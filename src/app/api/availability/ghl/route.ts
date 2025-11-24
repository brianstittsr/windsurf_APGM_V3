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
        const slots = await fetchGHLCalendarSlots(apiKey, calendar.id, date);
        
        // Convert GHL slots to our format
        slots.forEach((slot: any) => {
          const startTime = new Date(slot.startTime);
          const endTime = new Date(slot.endTime);
          
          // Calculate duration in hours
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationHours = Math.round(durationMs / (1000 * 60 * 60));
          
          allTimeSlots.push({
            time: startTime.toTimeString().slice(0, 5),
            endTime: endTime.toTimeString().slice(0, 5),
            duration: `${durationHours} Hour${durationHours !== 1 ? 's' : ''}`,
            available: true,
            artistId: calendar.teamMembers?.[0] || 'victoria',
            artistName: calendar.teamMembers?.[0] || 'Victoria',
            calendarId: calendar.id,
            calendarName: calendar.name
          });
        });

      } catch (error) {
        console.error(`Error fetching slots for calendar ${calendar.name}:`, error);
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

async function fetchGHLCalendarSlots(
  apiKey: string,
  calendarId: string,
  date: string
): Promise<any[]> {
  // GHL expects timestamps in milliseconds
  const startOfDay = new Date(date + 'T00:00:00');
  const endOfDay = new Date(date + 'T23:59:59');

  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startOfDay.getTime()}&endDate=${endOfDay.getTime()}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    console.warn(`Failed to fetch slots for calendar ${calendarId}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data.slots || [];
}
