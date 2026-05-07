import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { SMTPEmailService } from '@/services/gmailEmailService';

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
        firstName: data.clientName.trim().split(' ')[0] || data.clientName,
        lastName: data.clientName.trim().split(' ').slice(1).join(' ') || '',
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
    
    // Send confirmation emails (non-blocking)
    try {
      const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const emailSubject = `Booking Confirmation - ${data.serviceName} at A Pretty Girl Matter`;
      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - A Pretty Girl Matter</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #AD6269 0%, #8B4A52 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .appointment-card {
            background: #fdf2f2;
            border: 1px solid #fca5a5;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }
        .appointment-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #fecaca;
        }
        .appointment-row:last-child {
            border-bottom: none;
        }
        .appointment-label {
            color: #666;
            font-weight: 500;
        }
        .appointment-value {
            color: #333;
            font-weight: 600;
        }
        .deposit-info {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 24px 30px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✨ Booking Confirmed!</h1>
            <p>Your appointment has been successfully scheduled</p>
        </div>
        
        <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>Thank you for booking with A Pretty Girl Matter! We're excited to see you. Here are your appointment details:</p>
            
            <div class="appointment-card">
                <h3>📅 Appointment Details</h3>
                <div class="appointment-row">
                    <span class="appointment-label">Service</span>
                    <span class="appointment-value">${data.serviceName}</span>
                </div>
                <div class="appointment-row">
                    <span class="appointment-label">Date</span>
                    <span class="appointment-value">${formattedDate}</span>
                </div>
                <div class="appointment-row">
                    <span class="appointment-label">Time</span>
                    <span class="appointment-value">${data.startTime}</span>
                </div>
                <div class="appointment-row">
                    <span class="appointment-label">Artist</span>
                    <span class="appointment-value">${data.artistName}</span>
                </div>
                <div class="appointment-row">
                    <span class="appointment-label">Booking ID</span>
                    <span class="appointment-value">${bookingId}</span>
                </div>
            </div>
            
            <div class="deposit-info">
                <h3>💳 Deposit Information</h3>
                <p>A $${data.depositAmount || 200} deposit is required to confirm your booking.</p>
                <p><strong>Remaining balance:</strong> $${(data.price - (data.depositAmount || 200)).toFixed(2)} due at your appointment.</p>
                <p style="margin-top: 12px; font-size: 14px;">You will receive a payment link shortly.</p>
            </div>
            
            <p><strong>Location:</strong> 4040 Barrett Drive Suite 3, Raleigh, NC 27609</p>
            <p><strong>Phone:</strong> 919-441-0932</p>
            <p><strong>Email:</strong> victoria@aprettygirlmatter.com</p>
        </div>
        
        <div class="footer">
            <p style="margin: 8px 0; color: #666; font-size: 14px;">
                This is an automated confirmation email. Please do not reply directly to this email.
            </p>
        </div>
    </div>
</body>
</html>`;
      
      const emailText = `
Booking Confirmation - A Pretty Girl Matter

Hi ${data.clientName},

Your appointment has been confirmed!

Service: ${data.serviceName}
Date: ${formattedDate}
Time: ${data.startTime}
Artist: ${data.artistName}
Booking ID: ${bookingId}

Deposit Information:
Deposit Required: $${data.depositAmount || 200}
Remaining Balance: $${(data.price - (data.depositAmount || 200)).toFixed(2)} due at appointment

You will receive a payment link shortly.

Location: 4040 Barrett Drive Suite 3, Raleigh, NC 27609
Phone: 919-441-0932
Email: victoria@aprettygirlmatter.com
      `;
      
      // Send email to customer with BCC to Victoria
      await SMTPEmailService.sendEmail(
        data.clientEmail,
        {
          subject: emailSubject,
          htmlContent: emailHtml,
          textContent: emailText
        },
        undefined, // fromEmail - use default
        undefined, // cc
        ['victoria@aprettygirlmatter.com'] // bcc
      );
      
      console.log('✅ Confirmation email sent to', data.clientEmail);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
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
