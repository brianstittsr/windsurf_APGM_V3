import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';

// Default time slots - matches the booking page
const DEFAULT_SLOTS = {
  morning: { startTime: '10:00', endTime: '13:00', label: 'Morning' },
  afternoon: { startTime: '13:00', endTime: '16:00', label: 'Afternoon' },
  evening: { startTime: '16:00', endTime: '19:00', label: 'Evening' },
};

// Day name mapping
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * GET /api/availability/slots
 * 
 * Fetch slot availability for a specific date
 * Query params: date (YYYY-MM-DD format)
 * 
 * This endpoint returns time slots based on artist availability settings
 * and checks for booked appointments via GHL.
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

    // Get day of week for the selected date
    const selectedDate = new Date(date + 'T12:00:00');
    const dayOfWeek = DAY_NAMES[selectedDate.getDay()];

    // Return default time slots
    const customTimes = { ...DEFAULT_SLOTS };
    const bookedSlots: string[] = [];
    const disabledSlots: string[] = []; // Slots disabled by artist availability settings
    let dayEnabled = true; // Whether the day itself is enabled

    // Fetch artist availability from Firestore
    try {
      const db = adminDb;
      
      // Get all artist availability documents
      const availabilitySnapshot = await db.collection('artist-availability').get();
      
      if (!availabilitySnapshot.empty) {
        // Find the first artist with availability settings (typically Victoria)
        for (const doc of availabilitySnapshot.docs) {
          const data = doc.data();
          const availability = data.availability || {};
          
          console.log(`[Availability API] Checking artist ${doc.id} for ${dayOfWeek}`);
          
          console.log(`[Availability API] Available days in data:`, Object.keys(availability));
          console.log(`[Availability API] Looking for day: ${dayOfWeek}`);
          
          // Check if this day exists in the availability data
          if (availability[dayOfWeek]) {
            const dayConfig = availability[dayOfWeek];
            console.log(`[Availability API] Found ${dayOfWeek} config:`, JSON.stringify(dayConfig));
            
            if (dayConfig.enabled) {
              // Day is enabled, check which time slots are enabled
              const timeSlots = dayConfig.timeSlots || { morning: true, afternoon: true, evening: true };
              
              console.log(`[Availability API] ${dayOfWeek} timeSlots:`, timeSlots);
              
              // Add disabled slots based on artist availability
              if (timeSlots.morning === false) {
                disabledSlots.push('morning');
              }
              if (timeSlots.afternoon === false) {
                disabledSlots.push('afternoon');
              }
              if (timeSlots.evening === false) {
                disabledSlots.push('evening');
              }
            } else {
              // Day exists but is not enabled - disable all slots
              dayEnabled = false;
              disabledSlots.push('morning', 'afternoon', 'evening');
            }
            
            break; // Use first artist's availability
          } else {
            // Day not in saved data - check if ANY days are configured
            // If no days are configured at all, default to all available
            // If some days are configured but not this one, this day is not available
            const configuredDays = Object.keys(availability);
            console.log(`[Availability API] ${dayOfWeek} not found. Configured days:`, configuredDays);
            
            if (configuredDays.length > 0) {
              // Some days are configured, but not this one - day is not available
              dayEnabled = false;
              disabledSlots.push('morning', 'afternoon', 'evening');
            }
            // If no days configured at all, leave dayEnabled=true and disabledSlots=[]
            break;
          }
        }
      }
    } catch (firestoreError) {
      console.error('Error fetching artist availability from Firestore:', firestoreError);
      // Continue without Firestore data - all slots will be available
    }

    // Check GHL appointments if credentials are available via env vars
    const apiKey = process.env.GHL_API_KEY || '';
    const locationId = process.env.GHL_LOCATION_ID || '';
    
    if (apiKey && locationId) {
      try {
        const appointments = await fetchGHLAppointmentsForDate(apiKey, locationId, date);
        
        for (const apt of appointments) {
          const aptTime = new Date(apt.startTime);
          const hour = aptTime.getHours();
          
          // Determine which slot this appointment falls into (using new time ranges)
          if (hour >= 10 && hour < 13 && !bookedSlots.includes('morning')) {
            bookedSlots.push('morning');
          } else if (hour >= 13 && hour < 16 && !bookedSlots.includes('afternoon')) {
            bookedSlots.push('afternoon');
          } else if (hour >= 16 && hour < 19 && !bookedSlots.includes('evening')) {
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
      dayOfWeek,
      dayEnabled,
      customTimes,
      bookedSlots,
      disabledSlots,
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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
      console.warn('GHL API request timed out for slots');
    } else {
      console.warn('GHL fetch error:', error.message);
    }
    return [];
  }
}
