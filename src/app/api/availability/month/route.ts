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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate all dates in range with default availability
    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
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

    // Find next available date (before GHL check for fast response)
    let nextAvailable: string | null = null;
    const sortedDates = Object.keys(availability).sort();
    for (const dateStr of sortedDates) {
      const dateObj = new Date(dateStr + 'T00:00:00');
      if (dateObj >= today && availability[dateStr].isAvailable) {
        nextAvailable = dateStr;
        break;
      }
    }

    // Check GHL credentials - skip GHL call if not configured
    const apiKey = process.env.GHL_API_KEY || '';
    const locationId = process.env.GHL_LOCATION_ID || '';
    
    // If no GHL credentials, return immediately with default availability
    if (!apiKey || !locationId) {
      return NextResponse.json({
        availability,
        nextAvailable,
        startDate,
        endDate,
        source: 'default'
      });
    }

    // Try to fetch from GHL with short timeout (3 seconds)
    try {
      const appointments = await fetchGHLAppointmentsWithTimeout(apiKey, locationId, startDate, endDate, 3000);
      
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
      
      // Recalculate next available after GHL data
      nextAvailable = null;
      for (const dateStr of sortedDates) {
        const dateObj = new Date(dateStr + 'T00:00:00');
        if (dateObj >= today && availability[dateStr].isAvailable) {
          nextAvailable = dateStr;
          break;
        }
      }
    } catch (error) {
      // GHL failed - continue with default availability (already set)
      console.warn('GHL fetch failed, using default availability');
    }

    return NextResponse.json({
      availability,
      nextAvailable,
      startDate,
      endDate,
      source: apiKey ? 'ghl' : 'default'
    });

  } catch (error) {
    console.error('Error fetching month availability:', error);
    
    // Return empty availability on error so calendar still renders
    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate default availability for current month
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: d >= today,
      };
    }
    
    return NextResponse.json({
      availability,
      nextAvailable: today.toISOString().split('T')[0],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  }
}

async function fetchGHLAppointmentsWithTimeout(
  apiKey: string,
  locationId: string,
  startDate: string,
  endDate: string,
  timeoutMs: number = 5000
): Promise<any[]> {
  const startTime = new Date(startDate + 'T00:00:00').toISOString();
  const endTime = new Date(endDate + 'T23:59:59').toISOString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/events?locationId=${locationId}&startTime=${startTime}&endTime=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`GHL API returned ${response.status}, continuing without GHL data`);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('GHL API request timed out, continuing without GHL data');
    } else {
      console.warn('GHL API error:', error.message);
    }
    return [];
  }
}
