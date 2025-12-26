import { NextRequest, NextResponse } from 'next/server';

// No Firebase Admin dependency to avoid Turbopack symlink issues on Windows

/**
 * GET /api/availability/month
 * 
 * Fetch booking counts for each day in a date range
 * Query params: startDate, endDate (YYYY-MM-DD format)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
    let nextAvailable: string | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate all dates in range
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: d >= today,
      };
    }

    // Try to fetch from GHL if credentials are available
    if (apiKey && locationId) {
      try {
        const appointments = await fetchGHLAppointments(apiKey, locationId, startDate, endDate);
        
        // Count bookings per day
        for (const apt of appointments) {
          const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
          if (availability[aptDate]) {
            availability[aptDate].bookingCount++;
            // Mark as unavailable if 2 or more bookings
            if (availability[aptDate].bookingCount >= 2) {
              availability[aptDate].isAvailable = false;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching GHL appointments:', error);
      }
    }

    // Local bookings are checked client-side via Firestore
    // This avoids Firebase Admin SDK dependency which causes Turbopack symlink issues on Windows

    // Find next available date
    const sortedDates = Object.keys(availability).sort();
    for (const dateStr of sortedDates) {
      const dateObj = new Date(dateStr + 'T00:00:00');
      if (dateObj >= today && availability[dateStr].isAvailable) {
        nextAvailable = dateStr;
        break;
      }
    }

    return NextResponse.json({
      availability,
      nextAvailable,
      startDate,
      endDate,
    });

  } catch (error) {
    console.error('Error fetching month availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

async function getGHLCredentials() {
  // Use environment variables only - no Firebase Admin SDK
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || '',
  };
}

async function fetchGHLAppointments(
  apiKey: string,
  locationId: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const startTime = new Date(startDate + 'T00:00:00').toISOString();
  const endTime = new Date(endDate + 'T23:59:59').toISOString();

  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/events?locationId=${locationId}&startTime=${startTime}&endTime=${endTime}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch GHL appointments: ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}
