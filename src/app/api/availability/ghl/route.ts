import { NextRequest, NextResponse } from 'next/server';

// Lazy load Firebase Admin to prevent Turbopack symlink errors on Windows
async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch (error) {
    console.warn('Firebase Admin not available:', error);
    return null;
  }
}

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

    // Fetch local Firestore bookings for this date to prevent double bookings
    const localBookings = await fetchLocalBookings(date);
    console.log(`[Availability API] Found ${localBookings.length} local Firestore bookings for ${date}`);

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
    console.log(`[GHL API] Found ${calendars.length} calendars:`, calendars.map((c: any) => ({ id: c.id, name: c.name })));
    
    // Return early with debug info if no calendars
    if (calendars.length === 0) {
      return NextResponse.json({
        hasAvailability: false,
        timeSlots: [],
        debug: {
          message: 'No calendars found in GHL',
          locationId,
          hasApiKey: !!apiKey
        }
      });
    }
    
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
        
        console.log(`[GHL API] Calendar details structure:`, JSON.stringify({
          name: calendarDetails.name,
          hasAvailability: !!calendarDetails.availability,
          hasOpenHours: !!calendarDetails.openHours,
          availabilityKeys: calendarDetails.availability ? Object.keys(calendarDetails.availability) : [],
          openHoursKeys: calendarDetails.openHours ? Object.keys(calendarDetails.openHours) : []
        }));

        // Fetch existing appointments for this calendar on this date
        const existingAppointments = await fetchCalendarAppointments(
          apiKey,
          locationId,
          calendar.id,
          date
        );

        console.log(`[GHL API] Calendar "${calendar.name}": ${existingAppointments.length} existing appointments`);

        // Generate time slots based on calendar availability settings
        // Pass both GHL appointments AND local Firestore bookings to prevent double bookings
        const slots = generateTimeSlots(calendarDetails, date, existingAppointments, localBookings, 3);
        
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
      timeSlots: allTimeSlots,
      debug: {
        calendarsChecked: calendars.length,
        date,
        totalSlots: allTimeSlots.length
      }
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
  // Use environment variables only - no Firebase Admin SDK
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

// Fetch local Firestore bookings to prevent double bookings
async function fetchLocalBookings(date: string): Promise<any[]> {
  try {
    const db = await getFirebaseDb();
    if (!db) {
      console.warn('[Availability API] Firebase Admin not available, skipping local booking check');
      return [];
    }
    
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.where('date', '==', date).get();
    
    const bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date,
        time: data.time,
        status: data.status
      };
    });
    
    // Filter out cancelled bookings
    return bookings.filter(b => b.status !== 'cancelled');
  } catch (error) {
    console.error('[Availability API] Error fetching local bookings:', error);
    return [];
  }
}

function generateTimeSlots(
  calendar: any,
  date: string,
  existingAppointments: any[],
  localBookings: any[],
  appointmentDuration: number = 3
): any[] {
  const slots: any[] = [];
  const dayOfWeek = new Date(date).getDay();
  
  console.log(`[GHL API] Calendar ${calendar.name} - Looking for day: ${dayOfWeek}`);
  
  // GHL uses openHours as an array of objects with daysOfTheWeek arrays
  let daySchedule = null;
  
  if (calendar.openHours && Array.isArray(calendar.openHours)) {
    // Find the schedule entry that includes this day of week
    daySchedule = calendar.openHours.find((schedule: any) => 
      schedule.daysOfTheWeek && schedule.daysOfTheWeek.includes(dayOfWeek)
    );
  }
  
  if (!daySchedule || !daySchedule.hours || daySchedule.hours.length === 0) {
    console.log(`[GHL API] No availability settings for calendar ${calendar.name} on day ${dayOfWeek}`);
    return slots;
  }

  // Process each time block for this day
  for (const timeBlock of daySchedule.hours) {
    const openHour = timeBlock.openHour;
    const openMinute = timeBlock.openMinute || 0;
    const closeHour = timeBlock.closeHour;
    const closeMinute = timeBlock.closeMinute || 0;
    
    console.log(`[GHL API] Calendar ${calendar.name} time block: ${openHour}:${String(openMinute).padStart(2, '0')} - ${closeHour}:${String(closeMinute).padStart(2, '0')}`);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (true) {
      const slotEndHour = currentHour + appointmentDuration;
      const slotEndMinute = currentMinute;

      if (slotEndHour > closeHour || (slotEndHour === closeHour && slotEndMinute > closeMinute)) {
        break;
      }

      const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const endTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

      const slotStart = new Date(`${date}T${startTime}:00`);
      const slotEnd = new Date(`${date}T${endTime}:00`);
      
      // Check GHL appointments for conflicts
      const hasGHLConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        return (slotStart < aptEnd && slotEnd > aptStart);
      });
      
      // Check local Firestore bookings for conflicts
      const hasLocalConflict = localBookings.some(booking => {
        // Parse the booking time (HH:MM format)
        const bookingHour = parseInt(booking.time.split(':')[0]);
        const bookingMinute = parseInt(booking.time.split(':')[1] || '0');
        const bookingStart = new Date(`${date}T${booking.time}:00`);
        // Assume 3-hour appointments
        const bookingEnd = new Date(bookingStart.getTime() + (3 * 60 * 60 * 1000));
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });
      
      const isAvailable = !hasGHLConflict && !hasLocalConflict;
      
      if (hasLocalConflict) {
        console.log(`[GHL API] Slot ${startTime} blocked by local Firestore booking`);
      }

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
  }

  return slots;
}
