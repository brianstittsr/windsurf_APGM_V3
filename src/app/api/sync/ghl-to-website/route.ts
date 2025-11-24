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
 * Scheduled Sync: GHL → Website
 * 
 * This endpoint syncs all appointments from GHL to the website.
 * Can be called manually or set up as a cron job.
 * 
 * Usage:
 * - Manual: Click "Sync from GHL" button in admin dashboard
 * - Automated: Set up Vercel Cron Job to run every hour
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[ghl-sync] Starting GHL → Website sync...');

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: 'GHL credentials not configured' },
        { status: 400 }
      );
    }

    // Fetch all calendars
    const calendars = await fetchGHLCalendars(apiKey, locationId);
    console.log(`[ghl-sync] Found ${calendars.length} calendars`);

    // Set date range (past 7 days to future 90 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    let totalSynced = 0;
    let totalFailed = 0;

    // Fetch appointments from each calendar
    for (const calendar of calendars) {
      try {
        console.log(`[ghl-sync] Fetching from "${calendar.name}"...`);
        
        const appointments = await fetchGHLAppointmentsByCalendar(
          apiKey,
          locationId,
          calendar.id,
          startDate.toISOString(),
          endDate.toISOString()
        );

        console.log(`[ghl-sync] Found ${appointments.length} appointments in "${calendar.name}"`);

        // Sync each appointment
        for (const appointment of appointments) {
          try {
            await syncAppointmentToWebsite(appointment, apiKey);
            totalSynced++;
          } catch (error) {
            console.error(`[ghl-sync] Failed to sync appointment ${appointment.id}:`, error);
            totalFailed++;
          }
        }

      } catch (error) {
        console.error(`[ghl-sync] Failed to fetch from calendar "${calendar.name}":`, error);
      }
    }

    console.log(`[ghl-sync] Sync complete. Synced: ${totalSynced}, Failed: ${totalFailed}`);

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      failed: totalFailed,
      calendars: calendars.length
    });

  } catch (error) {
    console.error('[ghl-sync] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function getGHLCredentials() {
  try {
    // First try to get from the collection (any document)
    const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
    if (!settingsSnapshot.empty) {
      const data = settingsSnapshot.docs[0].data();
      console.log('[ghl-sync] Found credentials in Firestore');
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      console.log('[ghl-sync] Found credentials in Firestore (legacy doc)');
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  
  console.log('[ghl-sync] Using environment variables for credentials');
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || ''
  };
}

async function fetchGHLCalendars(apiKey: string, locationId: string) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch calendars: ${response.status}`);
  }

  const data = await response.json();
  return data.calendars || [];
}

async function fetchGHLAppointmentsByCalendar(
  apiKey: string,
  locationId: string,
  calendarId: string,
  startTime: string,
  endTime: string
) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/events?locationId=${locationId}&calendarId=${calendarId}&startTime=${startTime}&endTime=${endTime}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch appointments: ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}

async function syncAppointmentToWebsite(ghlAppointment: any, apiKey: string) {
  // Fetch contact details
  const contactId = ghlAppointment.contactId;
  let contactData: any = {};

  if (contactId) {
    try {
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
    } catch (error) {
      console.error('[ghl-sync] Error fetching contact:', error);
    }
  }

  // Parse appointment data
  const startTime = new Date(ghlAppointment.startTime);
  const endTime = new Date(ghlAppointment.endTime);

  // Create booking object
  const bookingData = {
    clientName: contactData.name || (contactData.firstName && contactData.lastName ? `${contactData.firstName} ${contactData.lastName}` : 'Unknown'),
    clientEmail: contactData.email || '',
    clientPhone: contactData.phone || '',
    artistId: ghlAppointment.assignedUserId || 'default-artist',
    artistName: 'Victoria Escobar',
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
    console.log('[ghl-sync] Updated booking:', bookingId);
  } else {
    // Create new booking
    const newBooking = await db.collection('bookings').add(bookingData);
    console.log('[ghl-sync] Created booking:', newBooking.id);
  }
}

function extractServiceName(title: string): string {
  const match = title.match(/^([^-]+)/);
  return match ? match[1].trim() : title;
}

function extractPrice(notes: string): number {
  const match = notes?.match(/Price:\s*\$?(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

function checkDepositPaid(notes: string): boolean {
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
