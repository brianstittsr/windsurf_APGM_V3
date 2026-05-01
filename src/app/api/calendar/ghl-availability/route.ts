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

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GHL_API_KEY not configured' },
        { status: 500 }
      );
    }

    const targetLocationId = locationId || envLocationId;
    const targetCalendarId = calendarId || envCalendarId;

    const slotsByDate: Record<string, TimeSlot[]> = {};

    // Generate time slots for each day (10am - 6pm, 3-hour blocks)
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      slotsByDate[dateStr] = [
        { time: '10:00', endTime: '13:00', available: false },
        { time: '13:00', endTime: '16:00', available: false },
        { time: '16:00', endTime: '19:00', available: false }
      ];
    }

    // Fetch existing appointments from GHL
    const existingSlots: string[] = [];
    
    try {
      const eventsResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/${targetCalendarId}/events?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.000Z&includeWithoutLookup=true`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const events = eventsData.events || [];
        
        for (const event of events) {
          if (event.startTime && event.endTime) {
            const eventDate = new Date(event.startTime);
            const dateStr = eventDate.toISOString().split('T')[0];
            const timeStr = eventDate.toISOString().split('T')[1].substring(0, 5);
            existingSlots.push(`${dateStr}_${timeStr}`);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch existing events:', error);
    }

    // Check each slot's availability by attempting to validate it
    const results: DayAvailability[] = [];

    for (const [dateStr, slots] of Object.entries(slotsByDate)) {
      const dayResult: DayAvailability = { date: dateStr, slots: [] };
      
      for (const slot of slots) {
        const startISO = `${dateStr}T${slot.time}:00.000Z`;
        const endISO = `${dateStr}T${slot.endTime}:00.000Z`;
        
        // Check if this slot is already booked
        const slotKey = `${dateStr}_${slot.time}`;
        const isBooked = existingSlots.some(s => s.startsWith(slotKey.substring(0, 13)));
        
        if (isBooked) {
          dayResult.slots.push({
            ...slot,
            available: false,
            reason: 'Already booked in GHL'
          });
          continue;
        }

        // Try to validate the slot via GHL API
        try {
          const validateResponse = await fetch(
            `https://services.leadconnectorhq.com/calendars/${targetCalendarId}/free-slots?startDate=${dateStr}&endDate=${dateStr}&timezone=America/New_York`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Version': '2021-07-28'
              }
            }
          );

          if (validateResponse.ok) {
            const slotsData = await validateResponse.json();
            const freeSlots = slotsData.slots || [];
            
            // Check if our time range is in the free slots
            const slotStart = new Date(startISO);
            const slotEnd = new Date(endISO);
            
            const isAvailable = freeSlots.some((freeSlot: any) => {
              const freeStart = new Date(freeSlot.startTime);
              const freeEnd = new Date(freeSlot.endTime);
              return slotStart >= freeStart && slotEnd <= freeEnd;
            });

            dayResult.slots.push({
              ...slot,
              available: isAvailable,
              reason: isAvailable ? 'Available' : 'Outside business hours or blocked'
            });
          } else {
            dayResult.slots.push({
              ...slot,
              available: false,
              reason: `API error: ${validateResponse.status}`
            });
          }
        } catch (error) {
          dayResult.slots.push({
            ...slot,
            available: false,
            reason: 'Failed to check availability'
          });
        }
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
