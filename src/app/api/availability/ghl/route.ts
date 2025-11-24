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
 * GET /api/availability/ghl
 * 
 * Fetch available time slots from GoHighLevel calendars
 * Query params: date (YYYY-MM-DD format)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: 'GHL credentials not configured' },
        { status: 400 }
      );
    }

    // Fetch calendars
    const calendars = await fetchGHLCalendars(apiKey, locationId);
    
    const allTimeSlots: any[] = [];

    // Fetch slots from each calendar
    for (const calendar of calendars) {
      try {
        console.log(`[GHL API] Processing calendar: ${calendar.name} (${calendar.id})`);
        
        // Fetch full calendar details with availability settings
        const calendarDetails = await fetchCalendarDetails(apiKey, calendar.id);
        
        if (!calendarDetails) {
          console.warn(`[GHL API] Could not fetch details for calendar ${calendar.name}`);
          continue;
        }

        // Fetch existing appointments for this calendar on this date
        const existingAppointments = await fetchCalendarAppointments(
          apiKey,
          locationId,
          calendar.id,
          date
        );

        console.log(`[GHL API] Calendar "${calendar.name}": ${existingAppointments.length} existing appointments`);

        // Generate time slots based on calendar availability settings
        const slots = generateTimeSlots(calendarDetails, date, existingAppointments, 3);
        
        console.log(`[GHL API] Calendar "${calendar.name}": ${slots.length} generated slots`);

        allTimeSlots.push(...slots);

      } catch (error) {
        console.error(`[GHL API] Error processing calendar ${calendar.name}:`, error);
      }
    }

    // Sort by time
    allTimeSlots.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      hasAvailability: allTimeSlots.length > 0,
      timeSlots: allTimeSlots
    });

  } catch (error) {
    console.error('Error fetching GHL availability:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch availability',
        hasAvailability: false,
        timeSlots: []
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
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
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

async function fetchCalendarDetails(apiKey: string, calendarId: string): Promise<any> {
  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/${calendarId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    console.warn(`Failed to fetch calendar details ${calendarId}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.calendar || data;
}

async function fetchCalendarAppointments(
  apiKey: string,
  locationId: string,
  calendarId: string,
  date: string
): Promise<any[]> {
  const startOfDay = new Date(date + 'T00:00:00').toISOString();
  const endOfDay = new Date(date + 'T23:59:59').toISOString();

  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/events?locationId=${locationId}&calendarId=${calendarId}&startTime=${startOfDay}&endTime=${endOfDay}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    console.warn(`Failed to fetch appointments for calendar ${calendarId}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data.events || [];
}

function generateTimeSlots(
  calendar: any,
  date: string,
  existingAppointments: any[],
  appointmentDuration: number = 3
): any[] {
  const slots: any[] = [];
  const dayOfWeek = new Date(date).getDay();
  
  const availability = calendar.availability?.[dayOfWeek] || calendar.openHours?.[dayOfWeek];
  
  if (!availability || !availability.openHour || !availability.closeHour) {
    console.log(`[GHL API] No availability settings for calendar ${calendar.name} on day ${dayOfWeek}`);
    return slots;
  }

  const [openHour, openMinute] = availability.openHour.split(':').map(Number);
  const [closeHour, closeMinute] = availability.closeHour.split(':').map(Number);
  
  console.log(`[GHL API] Calendar ${calendar.name} hours: ${availability.openHour} - ${availability.closeHour}`);

  let currentHour = openHour;
  let currentMinute = openMinute || 0;

  while (true) {
    const slotEndHour = currentHour + appointmentDuration;
    const slotEndMinute = currentMinute;

    if (slotEndHour > closeHour || (slotEndHour === closeHour && slotEndMinute > (closeMinute || 0))) {
      break;
    }

    const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const endTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

    const slotStart = new Date(`${date}T${startTime}:00`);
    const slotEnd = new Date(`${date}T${endTime}:00`);
    
    const isAvailable = !existingAppointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return (slotStart < aptEnd && slotEnd > aptStart);
    });

    slots.push({
      time: startTime,
      endTime: endTime,
      duration: `${appointmentDuration} Hour${appointmentDuration !== 1 ? 's' : ''}`,
      available: isAvailable,
      artistId: calendar.teamMembers?.[0] || 'victoria',
      artistName: calendar.name || 'Victoria',
      calendarId: calendar.id,
      calendarName: calendar.name
    });

    currentHour += 1;
  }

  return slots;
}
