import { NextRequest, NextResponse } from 'next/server';

// Default time slots - no Firebase Admin dependency to avoid Turbopack symlink issues on Windows
const DEFAULT_SLOTS = {
  morning: { startTime: '10:00', label: 'Morning' },
  afternoon: { startTime: '13:00', label: 'Afternoon' },
  evening: { startTime: '16:00', label: 'Evening' },
};

/**
 * GET /api/availability/slots
 * 
 * Fetch slot availability for a specific date
 * Query params: date (YYYY-MM-DD format)
 * 
 * This endpoint returns default time slots without Firebase Admin SDK
 * to avoid Turbopack symlink issues on Windows development environments.
 * Booking checks are handled client-side via the useTimeSlots hook.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date parameter is required' },
        { status: 400 }
      );
    }

    // Return default time slots
    // Custom times and booked slots are handled client-side via Firestore
    const customTimes = { ...DEFAULT_SLOTS };
    const bookedSlots: string[] = [];

    // Check GHL appointments if credentials are available via env vars
    const apiKey = process.env.GHL_API_KEY || '';
    const locationId = process.env.GHL_LOCATION_ID || '';
    
    if (apiKey && locationId) {
      try {
        const appointments = await fetchGHLAppointmentsForDate(apiKey, locationId, date);
        
        for (const apt of appointments) {
          const aptTime = new Date(apt.startTime);
          const hour = aptTime.getHours();
          
          // Determine which slot this appointment falls into
          if (hour >= 9 && hour < 12 && !bookedSlots.includes('morning')) {
            bookedSlots.push('morning');
          } else if (hour >= 12 && hour < 15 && !bookedSlots.includes('afternoon')) {
            bookedSlots.push('afternoon');
          } else if (hour >= 15 && hour < 19 && !bookedSlots.includes('evening')) {
            bookedSlots.push('evening');
          }
        }
      } catch (error) {
        console.error('Error fetching GHL appointments:', error);
        // Continue without GHL data
      }
    }

    return NextResponse.json({
      date,
      customTimes,
      bookedSlots,
    });

  } catch (error) {
    console.error('Error fetching slot availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slot availability' },
      { status: 500 }
    );
  }
}

async function fetchGHLAppointmentsForDate(
  apiKey: string,
  locationId: string,
  date: string
): Promise<any[]> {
  try {
    const startTime = new Date(date + 'T00:00:00').toISOString();
    const endTime = new Date(date + 'T23:59:59').toISOString();

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
  } catch (error) {
    console.error('GHL fetch error:', error);
    return [];
  }
}
