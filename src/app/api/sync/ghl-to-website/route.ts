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
    let totalDeleted = 0;
    const ghlAppointmentIds = new Set<string>();

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
            ghlAppointmentIds.add(appointment.id);
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

    // Also fetch appointments from Contacts (for opportunity-linked appointments)
    try {
      console.log(`[ghl-sync] Fetching appointments from Contacts...`);
      const contactAppointments = await fetchGHLContactAppointments(
        apiKey,
        locationId,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      console.log(`[ghl-sync] Found ${contactAppointments.length} contact appointments`);
      
      for (const appointment of contactAppointments) {
        try {
          await syncAppointmentToWebsite(appointment, apiKey);
          ghlAppointmentIds.add(appointment.id);
          totalSynced++;
        } catch (error) {
          console.error(`[ghl-sync] Failed to sync contact appointment ${appointment.id}:`, error);
          console.error(`[ghl-sync] Appointment data:`, JSON.stringify(appointment, null, 2));
          totalFailed++;
        }
      }
    } catch (error) {
      console.error(`[ghl-sync] Failed to fetch contact appointments:`, error);
    }

    // Delete appointments that no longer exist in GHL
    console.log(`[ghl-sync] Checking for deleted appointments...`);
    const websiteBookings = await db.collection('bookings')
      .where('ghlAppointmentId', '!=', null)
      .get();
    
    for (const doc of websiteBookings.docs) {
      const booking = doc.data();
      if (booking.ghlAppointmentId && !ghlAppointmentIds.has(booking.ghlAppointmentId)) {
        // Appointment exists on website but not in GHL - it was deleted
        console.log(`[ghl-sync] Deleting appointment ${booking.ghlAppointmentId} (no longer in GHL)`);
        try {
          await db.collection('bookings').doc(doc.id).delete();
          totalDeleted++;
        } catch (error) {
          console.error(`[ghl-sync] Failed to delete booking ${doc.id}:`, error);
        }
      }
    }

    console.log(`[ghl-sync] Sync complete. Synced: ${totalSynced}, Failed: ${totalFailed}, Deleted: ${totalDeleted}`);

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      failed: totalFailed,
      deleted: totalDeleted,
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

async function fetchGHLContactAppointments(
  apiKey: string,
  locationId: string,
  startTime: string,
  endTime: string
) {
  // Fetch all contacts for the location
  const contactsResponse = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=100`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!contactsResponse.ok) {
    throw new Error(`Failed to fetch contacts: ${contactsResponse.status}`);
  }

  const contactsData = await contactsResponse.json();
  const contacts = contactsData.contacts || [];
  
  const allAppointments: any[] = [];
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  // Fetch appointments for each contact
  for (const contact of contacts) {
    try {
      const apptResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contact.id}/appointments`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (apptResponse.ok) {
        const apptData = await apptResponse.json();
        const appointments = apptData.events || [];
        
        // Filter appointments by date range and add to list
        for (const appt of appointments) {
          const apptStartDate = new Date(appt.startTime);
          
          if (apptStartDate >= startDate && apptStartDate <= endDate) {
            // Transform to match calendar event format
            allAppointments.push({
              id: appt.id,
              title: appt.title,
              startTime: appt.startTime,
              endTime: appt.endTime,
              calendarId: appt.calendarId,
              contactId: appt.contactId,
              appointmentStatus: appt.appointmentStatus || appt.appoinmentStatus || 'new', // Handle typo in API
              assignedUserId: appt.assignedUserId,
              address: appt.address,
              notes: appt.notes || '',
              dateAdded: appt.dateAdded,
              dateUpdated: appt.dateUpdated
            });
          }
        }
      }
    } catch (error) {
      console.error(`[ghl-sync] Failed to fetch appointments for contact ${contact.id}:`, error);
    }
  }

  return allAppointments;
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

  // Parse appointment data - handle different date formats
  // GHL contact appointments use format: "2025-11-25 11:00:00"
  // GHL calendar events use ISO format: "2025-11-25T11:00:00.000Z"
  const parseGHLDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    // If it's already ISO format, use it directly
    if (dateStr.includes('T')) {
      return new Date(dateStr);
    }
    // Otherwise, assume it's "YYYY-MM-DD HH:MM:SS" format and convert to ISO
    return new Date(dateStr.replace(' ', 'T') + 'Z');
  };

  const startTime = parseGHLDate(ghlAppointment.startTime);
  const endTime = parseGHLDate(ghlAppointment.endTime);

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
