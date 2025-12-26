import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, query, where, getDocs } from 'firebase/firestore';

interface BookSlotRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  artistId: string;
  artistName: string;
  price: number;
  depositAmount?: number;
  notes?: string;
}

// GHL API configuration
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

async function getGHLCredentials() {
  try {
    const db = getDb();
    const settingsRef = doc(db, 'crmSettings', 'gohighlevel');
    const { getDoc } = await import('firebase/firestore');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        apiKey: data.apiKey,
        locationId: data.locationId,
        calendarId: data.calendarId
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting GHL credentials:', error);
    return null;
  }
}

async function createGHLContact(credentials: any, data: BookSlotRequest) {
  try {
    const response = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId: credentials.locationId,
        name: data.clientName,
        email: data.clientEmail,
        phone: data.clientPhone || '',
        tags: ['website-booking', data.serviceName.toLowerCase().replace(/\s+/g, '-')]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL contact creation failed:', errorText);
      return null;
    }
    
    const result = await response.json();
    return result.contact?.id;
  } catch (error) {
    console.error('Error creating GHL contact:', error);
    return null;
  }
}

async function createGHLAppointment(credentials: any, contactId: string, data: BookSlotRequest) {
  try {
    // Convert date and time to ISO format
    const startDateTime = new Date(`${data.date}T${data.startTime}:00`);
    const endDateTime = new Date(`${data.date}T${data.endTime}:00`);
    
    const response = await fetch(`${GHL_API_BASE}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calendarId: credentials.calendarId,
        locationId: credentials.locationId,
        contactId: contactId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        title: `${data.serviceName} - ${data.clientName}`,
        appointmentStatus: 'confirmed',
        assignedUserId: data.artistId !== 'default-artist' ? data.artistId : undefined,
        notes: data.notes || `Service: ${data.serviceName}\nPrice: $${data.price}`
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL appointment creation failed:', errorText);
      return null;
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating GHL appointment:', error);
    return null;
  }
}

async function blockTimeSlots(db: any, data: BookSlotRequest, bookingId: string) {
  // Create blocked time entries for the duration of the appointment
  const blockedSlotsRef = collection(db, 'blockedTimeSlots');
  
  // Parse start and end times
  const [startHour] = data.startTime.split(':').map(Number);
  const [endHour] = data.endTime.split(':').map(Number);
  
  // Block each hour slot
  for (let hour = startHour; hour < endHour; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    await addDoc(blockedSlotsRef, {
      date: data.date,
      time: timeSlot,
      artistId: data.artistId,
      bookingId: bookingId,
      reason: 'appointment',
      createdAt: Timestamp.now()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: BookSlotRequest = await request.json();
    
    // Validate required fields
    if (!data.clientName || !data.clientEmail || !data.serviceName || !data.date || !data.startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Check if time slot is already booked
    const existingBookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '==', data.date),
      where('time', '==', data.startTime),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const existingBookings = await getDocs(existingBookingsQuery);
    if (!existingBookings.empty) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }
    
    // Create booking in Firestore
    const bookingData = {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || '',
      serviceName: data.serviceName,
      serviceId: data.serviceId,
      date: data.date,
      time: data.startTime,
      endTime: data.endTime,
      artistId: data.artistId,
      artistName: data.artistName,
      price: data.price,
      depositAmount: data.depositAmount || 200,
      depositPaid: false,
      status: 'pending',
      notes: data.notes || '',
      ghlContactId: null as string | null,
      ghlAppointmentId: null as string | null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
    const bookingId = bookingRef.id;
    
    // Block time slots
    await blockTimeSlots(db, data, bookingId);
    
    // Try to sync with GHL (non-blocking)
    let ghlContactId = null;
    let ghlAppointmentId = null;
    
    const credentials = await getGHLCredentials();
    if (credentials?.apiKey && credentials?.locationId) {
      // Create or find contact in GHL
      ghlContactId = await createGHLContact(credentials, data);
      
      if (ghlContactId && credentials.calendarId) {
        // Create appointment in GHL
        ghlAppointmentId = await createGHLAppointment(credentials, ghlContactId, data);
      }
      
      // Update booking with GHL IDs
      if (ghlContactId || ghlAppointmentId) {
        await updateDoc(doc(db, 'bookings', bookingId), {
          ghlContactId,
          ghlAppointmentId,
          lastSyncedAt: Timestamp.now()
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      bookingId,
      ghlContactId,
      ghlAppointmentId,
      message: 'Booking created successfully'
    });
    
  } catch (error) {
    console.error('Error booking slot:', error);
    return NextResponse.json(
      { error: 'Failed to book slot' },
      { status: 500 }
    );
  }
}

// Endpoint to check slot availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const artistId = searchParams.get('artistId');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Get all bookings for the date
    let bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '==', date),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookedSlots = bookingsSnapshot.docs.map(doc => ({
      time: doc.data().time,
      endTime: doc.data().endTime,
      artistId: doc.data().artistId
    }));
    
    // Get blocked time slots
    let blockedQuery = query(
      collection(db, 'blockedTimeSlots'),
      where('date', '==', date)
    );
    
    const blockedSnapshot = await getDocs(blockedQuery);
    const blockedSlots = blockedSnapshot.docs.map(doc => ({
      time: doc.data().time,
      artistId: doc.data().artistId
    }));
    
    return NextResponse.json({
      date,
      bookedSlots,
      blockedSlots
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
