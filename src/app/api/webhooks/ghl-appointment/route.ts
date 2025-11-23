import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

/**
 * GHL Webhook Handler for Appointment Events
 * 
 * This endpoint receives webhooks from GoHighLevel when appointments are:
 * - Created
 * - Updated
 * - Deleted
 * 
 * Setup in GHL:
 * 1. Go to Settings → Integrations → Webhooks
 * 2. Create webhook for "Appointment" events
 * 3. URL: https://www.aprettygirlmatter.com/api/webhooks/ghl-appointment
 * 4. Select events: appointment.created, appointment.updated, appointment.deleted
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[ghl-webhook] Received webhook');

    const payload = await req.json();
    console.log('[ghl-webhook] Event type:', payload.type);
    console.log('[ghl-webhook] Appointment ID:', payload.id);

    const eventType = payload.type;
    const appointment = payload;

    // Handle different event types
    switch (eventType) {
      case 'appointment.created':
      case 'appointment.updated':
        await syncAppointmentToWebsite(appointment);
        break;
      
      case 'appointment.deleted':
        await deleteAppointmentFromWebsite(appointment.id);
        break;
      
      default:
        console.log('[ghl-webhook] Unknown event type:', eventType);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('[ghl-webhook] Error processing webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function syncAppointmentToWebsite(ghlAppointment: any) {
  try {
    console.log('[ghl-webhook] Syncing appointment to website:', ghlAppointment.id);

    // Fetch contact details from GHL
    const contactId = ghlAppointment.contactId;
    let contactData: any = {};

    if (contactId) {
      const apiKey = await getGHLApiKey();
      const contactResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (contactResponse.ok) {
        const result = await contactResponse.json();
        contactData = result.contact;
      }
    }

    // Parse appointment data
    const startTime = new Date(ghlAppointment.startTime);
    const endTime = new Date(ghlAppointment.endTime);

    // Create booking object
    const bookingData = {
      clientName: contactData.name || contactData.firstName + ' ' + contactData.lastName || 'Unknown',
      clientEmail: contactData.email || '',
      clientPhone: contactData.phone || '',
      artistId: ghlAppointment.assignedUserId || 'default-artist',
      artistName: 'Victoria Escobar', // Default artist
      serviceName: extractServiceName(ghlAppointment.title),
      date: startTime.toISOString().split('T')[0],
      time: startTime.toTimeString().slice(0, 5),
      status: mapGHLStatus(ghlAppointment.appointmentStatus),
      price: extractPrice(ghlAppointment.notes) || 0,
      depositPaid: checkDepositPaid(ghlAppointment.notes),
      notes: ghlAppointment.notes || '',
      ghlContactId: contactId,
      ghlAppointmentId: ghlAppointment.id,
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date(ghlAppointment.dateAdded || Date.now()),
      updatedAt: new Date(ghlAppointment.dateUpdated || Date.now())
    };

    // Check if booking already exists
    const existingBookings = await db.collection('bookings')
      .where('ghlAppointmentId', '==', ghlAppointment.id)
      .get();

    if (!existingBookings.empty) {
      // Update existing booking
      const bookingId = existingBookings.docs[0].id;
      await db.collection('bookings').doc(bookingId).update(bookingData);
      console.log('[ghl-webhook] Updated existing booking:', bookingId);
    } else {
      // Create new booking
      const newBooking = await db.collection('bookings').add(bookingData);
      console.log('[ghl-webhook] Created new booking:', newBooking.id);
    }

  } catch (error) {
    console.error('[ghl-webhook] Error syncing appointment:', error);
    throw error;
  }
}

async function deleteAppointmentFromWebsite(ghlAppointmentId: string) {
  try {
    console.log('[ghl-webhook] Deleting appointment from website:', ghlAppointmentId);

    const bookings = await db.collection('bookings')
      .where('ghlAppointmentId', '==', ghlAppointmentId)
      .get();

    if (!bookings.empty) {
      const bookingId = bookings.docs[0].id;
      await db.collection('bookings').doc(bookingId).update({
        status: 'cancelled',
        lastSyncedAt: new Date().toISOString()
      });
      console.log('[ghl-webhook] Marked booking as cancelled:', bookingId);
    }

  } catch (error) {
    console.error('[ghl-webhook] Error deleting appointment:', error);
    throw error;
  }
}

async function getGHLApiKey(): Promise<string> {
  const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
  if (settingsDoc.exists) {
    const data = settingsDoc.data();
    return data?.apiKey || process.env.GHL_API_KEY || '';
  }
  return process.env.GHL_API_KEY || '';
}

function extractServiceName(title: string): string {
  // Extract service name from title like "Microblading - Jane Test"
  const match = title.match(/^([^-]+)/);
  return match ? match[1].trim() : title;
}

function extractPrice(notes: string): number {
  // Extract price from notes like "Price: $450"
  const match = notes?.match(/Price:\s*\$?(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

function checkDepositPaid(notes: string): boolean {
  // Check if deposit is paid from notes
  return notes?.toLowerCase().includes('deposit: paid') || false;
}

function mapGHLStatus(ghlStatus: string): 'pending' | 'confirmed' | 'completed' | 'cancelled' {
  const statusMap: { [key: string]: 'pending' | 'confirmed' | 'completed' | 'cancelled' } = {
    'new': 'pending',
    'confirmed': 'confirmed',
    'showed': 'completed',
    'noshow': 'cancelled',
    'cancelled': 'cancelled',
    'invalid': 'cancelled'
  };
  
  return statusMap[ghlStatus.toLowerCase()] || 'pending';
}
