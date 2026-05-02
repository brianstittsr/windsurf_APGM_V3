import { NextRequest, NextResponse } from 'next/server';

interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, calendarId, locationId } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GHL_API_KEY;
    const envLocationId = process.env.GHL_LOCATION_ID;
    const envCalendarId = process.env.GHL_CALENDAR_ID || 'C9kiOUUFTpnSSqGurWh1';

    console.log('[GHL Availability] Env vars check:', {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
      hasLocationId: !!envLocationId,
      envCalendarId: envCalendarId
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GHL_API_KEY not configured' },
        { status: 500 }
      );
    }

    const targetLocationId = locationId || envLocationId;
    const targetCalendarId = calendarId || envCalendarId;

    console.log('[GHL Availability] Using:', {
      targetCalendarId,
      targetLocationId,
      dateRange: { startDate, endDate }
    });

    const slotsByDate: Record<string, TimeSlot[]> = {};

    // Generate time slots for each day (10am - 7pm, 3-hour blocks)
    // Initialize as AVAILABLE - we mark as unavailable only if an existing event blocks the slot
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      slotsByDate[dateStr] = [
        { time: '10:00', endTime: '13:00', available: true },
        { time: '13:00', endTime: '16:00', available: true },
        { time: '16:00', endTime: '19:00', available: true }
      ];
    }

    // Fetch existing appointments/events from GHL to find which slots are blocked
    const bookedIntervals: Array<{ start: Date; end: Date }> = [];
    
    try {
      // Try the /calendars/events endpoint (location-level)
      const eventsResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/events?locationId=${targetLocationId}&startTime=${startDate}T00:00:00.000Z&endTime=${endDate}T23:59:59.999Z`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      console.log('[GHL Availability] Events API status:', eventsResponse.status);
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const events = eventsData.events || [];
        console.log('[GHL Availability] Found events:', events.length);
        
        for (const event of events) {
          if (event.startTime) {
            const s = new Date(event.startTime);
            const e = event.endTime ? new Date(event.endTime) : new Date(s.getTime() + 3600000);
            bookedIntervals.push({ start: s, end: e });
            console.log(`[GHL Availability] Booked: ${s.toISOString()} - ${e.toISOString()}`);
          }
        }
      } else {
        const errText = await eventsResponse.text();
        console.warn('[GHL Availability] Events API error:', eventsResponse.status, errText);
      }
    } catch (error) {
      console.warn('[GHL Availability] Failed to fetch existing events:', error);
    }

    // Also fetch blocked slots from the calendar-specific endpoint
    try {
      const blockedResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/${targetCalendarId}/events?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json();
        const blocked = blockedData.events || blockedData.blockedSlots || [];
        console.log('[GHL Availability] Calendar-specific blocked events:', blocked.length);
        for (const event of blocked) {
          if (event.startTime) {
            const s = new Date(event.startTime);
            const e = event.endTime ? new Date(event.endTime) : new Date(s.getTime() + 3600000);
            bookedIntervals.push({ start: s, end: e });
          }
        }
      }
    } catch (error) {
      console.warn('[GHL Availability] Failed to fetch calendar blocked slots:', error);
    }

    // Mark slots as blocked only if an existing event overlaps with them
    const results: DayAvailability[] = [];

    for (const [dateStr, slots] of Object.entries(slotsByDate)) {
      const dayResult: DayAvailability = { date: dateStr, slots: [] };
      
      for (const slot of slots) {
        // Build UTC slot interval - GHL stores times in UTC
        const slotStart = new Date(`${dateStr}T${slot.time}:00.000Z`);
        const slotEnd = new Date(`${dateStr}T${slot.endTime}:00.000Z`);
        
        // Check if any booked interval overlaps with this slot
        const isBlocked = bookedIntervals.some(({ start, end }) => {
          // Overlap if: bookedStart < slotEnd AND bookedEnd > slotStart
          return start < slotEnd && end > slotStart;
        });

        dayResult.slots.push({
          ...slot,
          available: !isBlocked,
          reason: isBlocked ? 'Already booked in GHL' : 'Available'
        });
      }
      
      results.push(dayResult);
    }

    return NextResponse.json({
      success: true,
      calendarId: targetCalendarId,
      locationId: targetLocationId,
      availability: results,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking GHL availability:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
