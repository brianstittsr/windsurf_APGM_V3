import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { getDb } from '../../../../lib/firebase';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  depositPaid: boolean;
  notes?: string;
  ghlContactId?: string;
  ghlAppointmentId?: string;
}

async function getGHLApiKey() {
  try {
    const db = getDb();
    
    // First try to get from the collection (any document)
    const settingsQuery = query(collection(db, 'crmSettings'), limit(1));
    const settingsSnapshot = await getDocs(settingsQuery);
    if (!settingsSnapshot.empty) {
      return settingsSnapshot.docs[0].data().apiKey;
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await getDoc(doc(db, 'crmSettings', 'gohighlevel'));
    if (settingsDoc.exists()) {
      return settingsDoc.data().apiKey;
    }
  } catch (error) {
    console.error('Error fetching GHL API key:', error);
  }
  return process.env.GHL_API_KEY || '';
}

async function getGHLLocationId() {
  try {
    const db = getDb();
    
    // First try to get from the collection (any document)
    const settingsQuery = query(collection(db, 'crmSettings'), limit(1));
    const settingsSnapshot = await getDocs(settingsQuery);
    if (!settingsSnapshot.empty) {
      return settingsSnapshot.docs[0].data().locationId;
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await getDoc(doc(db, 'crmSettings', 'gohighlevel'));
    if (settingsDoc.exists()) {
      return settingsDoc.data().locationId;
    }
  } catch (error) {
    console.error('Error fetching GHL location ID:', error);
  }
  return process.env.GHL_LOCATION_ID || '';
}

async function createOrUpdateGHLContact(booking: Booking, apiKey: string) {
  try {
    // Check if contact already exists
    if (booking.ghlContactId) {
      // Update existing contact
      const response = await fetch(`https://services.leadconnectorhq.com/contacts/${booking.ghlContactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.clientPhone,
          tags: [booking.serviceName, booking.status]
        })
      });

      if (response.ok) {
        return booking.ghlContactId;
      }
    }

    // Create new contact
    const locationId = await getGHLLocationId();
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId,
        name: booking.clientName,
        email: booking.clientEmail,
        phone: booking.clientPhone,
        tags: [booking.serviceName, booking.status],
        source: 'Website Booking'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.contact.id;
    }

    throw new Error('Failed to create GHL contact');
  } catch (error) {
    console.error('Error creating/updating GHL contact:', error);
    throw error;
  }
}

async function createOrUpdateGHLAppointment(booking: Booking, contactId: string, apiKey: string) {
  try {
    const locationId = await getGHLLocationId();
    
    // Get the default calendar (Service Calendar)
    const calendarsResponse = await fetch(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );
    
    if (!calendarsResponse.ok) {
      throw new Error('Failed to fetch calendars');
    }
    
    const calendarsData = await calendarsResponse.json();
    const calendars = calendarsData.calendars || [];
    
    // Use the first calendar (Service Calendar) or throw error if none found
    if (calendars.length === 0) {
      throw new Error('No calendars found in GHL');
    }
    
    const calendarId = calendars[0].id;
    
    // Parse date and add 3 hours for end time
    const startDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours

    const appointmentData = {
      locationId,
      contactId,
      calendarId,
      title: `${booking.serviceName} - ${booking.clientName}`,
      appointmentStatus: booking.status === 'confirmed' ? 'confirmed' : 'new',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: booking.notes || `Booking for ${booking.serviceName}. Price: $${booking.price}. Deposit Paid: ${booking.depositPaid ? 'Yes' : 'No'}`,
    };

    if (booking.ghlAppointmentId) {
      // Update existing appointment
      const response = await fetch(`https://services.leadconnectorhq.com/calendars/events/appointments/${booking.ghlAppointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        return booking.ghlAppointmentId;
      }
    }

    // Create new appointment
    const response = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(appointmentData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.id;
    }

    const errorText = await response.text();
    console.error('GHL appointment creation failed:', response.status, errorText);
    throw new Error(`Failed to create GHL appointment: ${response.status} - ${errorText}`);
  } catch (error) {
    console.error('Error creating/updating GHL appointment:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId, booking, action } = await req.json();

    if (!bookingId || !booking) {
      return NextResponse.json(
        { error: 'Booking ID and booking data are required' },
        { status: 400 }
      );
    }

    const apiKey = await getGHLApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GHL API key not configured' },
        { status: 503 }
      );
    }

    // Create or update contact in GHL
    const contactId = await createOrUpdateGHLContact(booking, apiKey);

    // Create or update appointment in GHL
    const appointmentId = await createOrUpdateGHLAppointment(booking, contactId, apiKey);

    // Update booking in Firestore with GHL IDs
    const db = getDb();
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      ghlContactId: contactId,
      ghlAppointmentId: appointmentId,
      lastSyncedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      contactId,
      appointmentId,
      message: 'Booking synced with GHL successfully'
    });
  } catch (error) {
    console.error('Error syncing booking with GHL:', error);
    return NextResponse.json(
      { error: 'Failed to sync booking with GHL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const apiKey = await getGHLApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GHL API key not configured' },
        { status: 503 }
      );
    }

    // Delete appointment from GHL
    const response = await fetch(`https://services.leadconnectorhq.com/calendars/events/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete GHL appointment');
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted from GHL successfully'
    });
  } catch (error) {
    console.error('Error deleting GHL appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete GHL appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
