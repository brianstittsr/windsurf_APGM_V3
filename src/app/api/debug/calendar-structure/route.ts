import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

async function getGHLCredentials() {
  try {
    const settingsDoc = await db.collection('crmSettings').doc('ghl').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        apiKey: data?.apiKey || '',
        locationId: data?.locationId || ''
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
    return { error: `Failed to fetch calendar details: ${response.status}` };
  }

  const data = await response.json();
  return data.calendar || data;
}

export async function GET() {
  try {
    const { apiKey, locationId } = await getGHLCredentials();

    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: 'GHL credentials not configured' },
        { status: 400 }
      );
    }

    const calendars = await fetchGHLCalendars(apiKey, locationId);
    
    const calendarDetails = await Promise.all(
      calendars.map(async (cal: any) => {
        const details = await fetchCalendarDetails(apiKey, cal.id);
        return {
          id: cal.id,
          name: cal.name,
          details: {
            hasAvailability: !!details.availability,
            hasOpenHours: !!details.openHours,
            availabilityKeys: details.availability ? Object.keys(details.availability) : [],
            openHoursKeys: details.openHours ? Object.keys(details.openHours) : [],
            availability: details.availability,
            openHours: details.openHours
          }
        };
      })
    );

    return NextResponse.json({
      calendarsFound: calendars.length,
      calendars: calendarDetails
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
