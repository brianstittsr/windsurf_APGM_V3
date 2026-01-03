import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/availability/sync-ghl
 * 
 * Sync artist availability settings to GoHighLevel calendar
 * This updates the calendar's open hours to match the website's availability settings
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { availability, artistId } = body;

    if (!availability) {
      return NextResponse.json(
        { error: 'Availability data is required' },
        { status: 400 }
      );
    }

    // Get GHL credentials
    const apiKey = process.env.GHL_API_KEY || '';
    const locationId = process.env.GHL_LOCATION_ID || '';

    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: 'GHL credentials not configured' },
        { status: 400 }
      );
    }

    // Fetch all calendars to find the one to update
    const calendars = await fetchGHLCalendars(apiKey, locationId);
    
    if (calendars.length === 0) {
      return NextResponse.json(
        { error: 'No calendars found in GHL' },
        { status: 404 }
      );
    }

    // Convert website availability format to GHL openHours format
    const openHours = convertToGHLOpenHours(availability);
    
    console.log('[GHL Sync] Converting availability to GHL format:', JSON.stringify(openHours, null, 2));

    // Update each calendar with the new availability
    const results = [];
    for (const calendar of calendars) {
      try {
        const result = await updateCalendarAvailability(apiKey, calendar.id, openHours);
        results.push({
          calendarId: calendar.id,
          calendarName: calendar.name,
          success: result.success,
          error: result.error
        });
        
        if (result.success) {
          console.log(`[GHL Sync] Successfully updated calendar: ${calendar.name}`);
        } else {
          console.error(`[GHL Sync] Failed to update calendar ${calendar.name}:`, result.error);
        }
      } catch (error) {
        console.error(`[GHL Sync] Error updating calendar ${calendar.name}:`, error);
        results.push({
          calendarId: calendar.id,
          calendarName: calendar.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Updated ${successCount} calendar(s), ${failCount} failed`,
      results,
      openHours // Include for debugging
    });

  } catch (error) {
    console.error('[GHL Sync] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to sync availability',
        success: false
      },
      { status: 500 }
    );
  }
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

/**
 * Convert website availability format to GHL openHours format
 * 
 * Website format:
 * {
 *   "Monday": { enabled: true, timeSlots: { morning: true, afternoon: false, evening: true } },
 *   "Tuesday": { enabled: true, timeSlots: { morning: false, afternoon: true, evening: true } },
 *   ...
 * }
 * 
 * GHL openHours format:
 * [
 *   {
 *     daysOfTheWeek: [1, 2, 3], // 0=Sunday, 1=Monday, etc.
 *     hours: [
 *       { openHour: 10, openMinute: 0, closeHour: 19, closeMinute: 0 }
 *     ]
 *   }
 * ]
 */
function convertToGHLOpenHours(availability: any) {
  // GHL uses lowercase day names as strings
  const dayNameToGHL: { [key: string]: string } = {
    'Sunday': 'sunday',
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday'
  };

  // Time slot definitions (matching the website)
  const TIME_SLOTS = {
    morning: { openHour: 10, openMinute: 0, closeHour: 13, closeMinute: 0 },
    afternoon: { openHour: 13, openMinute: 0, closeHour: 16, closeMinute: 0 },
    evening: { openHour: 16, openMinute: 0, closeHour: 19, closeMinute: 0 }
  };

  const openHours: any[] = [];

  // Process each day
  for (const [dayName, dayConfig] of Object.entries(availability)) {
    const ghlDayName = dayNameToGHL[dayName];
    if (!ghlDayName) continue;

    const config = dayConfig as any;
    if (!config || !config.enabled) continue;

    const timeSlots = config.timeSlots || { morning: true, afternoon: true, evening: true };
    
    // Build hours array for this day based on enabled time slots
    const hours: any[] = [];
    
    // Check which consecutive time slots are enabled and merge them
    let currentBlock: any = null;
    
    for (const [slotId, slotTimes] of Object.entries(TIME_SLOTS)) {
      const isEnabled = timeSlots[slotId] !== false; // Default to true if not specified
      
      if (isEnabled) {
        const times = slotTimes as any;
        if (!currentBlock) {
          // Start a new block
          currentBlock = {
            openHour: times.openHour,
            openMinute: times.openMinute,
            closeHour: times.closeHour,
            closeMinute: times.closeMinute
          };
        } else if (currentBlock.closeHour === times.openHour && currentBlock.closeMinute === times.openMinute) {
          // Extend the current block
          currentBlock.closeHour = times.closeHour;
          currentBlock.closeMinute = times.closeMinute;
        } else {
          // Save current block and start a new one
          hours.push({ ...currentBlock });
          currentBlock = {
            openHour: times.openHour,
            openMinute: times.openMinute,
            closeHour: times.closeHour,
            closeMinute: times.closeMinute
          };
        }
      } else {
        // Slot is disabled, save current block if exists
        if (currentBlock) {
          hours.push({ ...currentBlock });
          currentBlock = null;
        }
      }
    }
    
    // Don't forget the last block
    if (currentBlock) {
      hours.push(currentBlock);
    }

    // Only add if there are hours for this day
    if (hours.length > 0) {
      // Check if we can merge with an existing entry that has the same hours
      const existingEntry = openHours.find(entry => 
        JSON.stringify(entry.hours) === JSON.stringify(hours)
      );
      
      if (existingEntry) {
        existingEntry.daysOfTheWeek.push(ghlDayName);
      } else {
        openHours.push({
          daysOfTheWeek: [ghlDayName],
          hours
        });
      }
    }
  }

  return openHours;
}

async function updateCalendarAvailability(
  apiKey: string,
  calendarId: string,
  openHours: any[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // GHL API to update calendar
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/${calendarId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          openHours
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GHL Sync] Calendar update failed (${response.status}):`, errorText);
      return { 
        success: false, 
        error: `API returned ${response.status}: ${errorText}` 
      };
    }

    const data = await response.json();
    console.log(`[GHL Sync] Calendar updated successfully:`, data);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
