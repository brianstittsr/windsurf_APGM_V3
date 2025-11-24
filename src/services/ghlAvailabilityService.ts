/**
 * GHL Availability Service
 * 
 * Fetches available time slots from GoHighLevel calendar booking rules
 * instead of using the website's built-in availability system.
 */

import { getFirestore } from 'firebase-admin/firestore';

interface GHLTimeSlot {
  time: string;
  endTime: string;
  duration: string;
  available: boolean;
  artistId: string;
  artistName: string;
  calendarId: string;
  calendarName: string;
}

interface GHLAvailabilityData {
  hasAvailability: boolean;
  timeSlots: GHLTimeSlot[];
}

export class GHLAvailabilityService {
  /**
   * Get GHL credentials from Firestore or environment
   */
  private static async getGHLCredentials(): Promise<{ apiKey: string; locationId: string }> {
    try {
      // Try to get from Firestore first (server-side only)
      if (typeof window === 'undefined') {
        const db = getFirestore();
        const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
        if (settingsDoc.exists) {
          const data = settingsDoc.data();
          return {
            apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
            locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
          };
        }
      }
    } catch (error) {
      console.error('Error fetching GHL credentials from Firestore:', error);
    }
    
    // Fallback to environment variables
    return {
      apiKey: process.env.GHL_API_KEY || '',
      locationId: process.env.GHL_LOCATION_ID || ''
    };
  }

  /**
   * Fetch all calendars from GHL
   */
  private static async fetchGHLCalendars(apiKey: string, locationId: string) {
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
   * Fetch calendar details including availability settings
   */
  private static async fetchCalendarDetails(
    apiKey: string,
    calendarId: string
  ): Promise<any> {
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

  /**
   * Fetch existing appointments for a calendar on a specific date
   */
  private static async fetchCalendarAppointments(
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

  /**
   * Generate time slots in 1-hour increments based on calendar availability
   */
  private static generateTimeSlots(
    calendar: any,
    date: string,
    existingAppointments: any[],
    appointmentDuration: number = 3 // Default 3 hours
  ): GHLTimeSlot[] {
    const slots: GHLTimeSlot[] = [];
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    
    // Get availability for this day of week
    const availability = calendar.availability?.[dayOfWeek] || calendar.openHours?.[dayOfWeek];
    
    if (!availability || !availability.openHour || !availability.closeHour) {
      console.log(`No availability settings found for calendar ${calendar.name} on day ${dayOfWeek}`);
      return slots;
    }

    // Parse open and close hours (format: "HH:MM" or "HH:MM:SS")
    const [openHour, openMinute] = availability.openHour.split(':').map(Number);
    const [closeHour, closeMinute] = availability.closeHour.split(':').map(Number);
    
    console.log(`Calendar ${calendar.name} hours: ${availability.openHour} - ${availability.closeHour}`);

    // Generate slots in 1-hour increments
    let currentHour = openHour;
    let currentMinute = openMinute || 0;

    while (true) {
      // Calculate end time for this slot (current time + appointment duration)
      const slotEndHour = currentHour + appointmentDuration;
      const slotEndMinute = currentMinute;

      // Check if this slot would end after closing time
      if (slotEndHour > closeHour || (slotEndHour === closeHour && slotEndMinute > (closeMinute || 0))) {
        break; // Stop generating slots
      }

      // Format times as HH:MM
      const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const endTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

      // Check if this slot conflicts with existing appointments
      const slotStart = new Date(`${date}T${startTime}:00`);
      const slotEnd = new Date(`${date}T${endTime}:00`);
      
      const isAvailable = !existingAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        // Check for overlap
        return (slotStart < aptEnd && slotEnd > aptStart);
      });

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

      // Move to next hour
      currentHour += 1;
    }

    return slots;
  }

  /**
   * Get available time slots from GHL for a specific date
   */
  static async getAvailableTimeSlots(date: string): Promise<GHLAvailabilityData> {
    try {
      console.log('[GHL Availability] Fetching slots for date:', date);

      const { apiKey, locationId } = await this.getGHLCredentials();

      if (!apiKey || !locationId) {
        console.error('[GHL Availability] Missing credentials');
        return {
          hasAvailability: false,
          timeSlots: []
        };
      }

      // Fetch all calendars
      const calendars = await this.fetchGHLCalendars(apiKey, locationId);
      console.log(`[GHL Availability] Found ${calendars.length} calendars`);

      const allTimeSlots: GHLTimeSlot[] = [];

      // Fetch slots from each calendar
      for (const calendar of calendars) {
        try {
          // Fetch full calendar details with availability settings
          const calendarDetails = await this.fetchCalendarDetails(apiKey, calendar.id);
          
          if (!calendarDetails) {
            console.warn(`[GHL Availability] Could not fetch details for calendar ${calendar.name}`);
            continue;
          }

          // Fetch existing appointments for this calendar on this date
          const existingAppointments = await this.fetchCalendarAppointments(
            apiKey,
            locationId,
            calendar.id,
            date
          );

          console.log(`[GHL Availability] Calendar "${calendar.name}": ${existingAppointments.length} existing appointments`);

          // Generate time slots based on calendar availability settings
          const slots = this.generateTimeSlots(calendarDetails, date, existingAppointments, 3);
          
          console.log(`[GHL Availability] Calendar "${calendar.name}": ${slots.length} generated slots`);

          allTimeSlots.push(...slots);

        } catch (error) {
          console.error(`[GHL Availability] Error processing calendar ${calendar.name}:`, error);
        }
      }

      // Sort by time
      allTimeSlots.sort((a, b) => a.time.localeCompare(b.time));

      console.log(`[GHL Availability] Total available slots: ${allTimeSlots.length}`);

      return {
        hasAvailability: allTimeSlots.length > 0,
        timeSlots: allTimeSlots
      };

    } catch (error) {
      console.error('[GHL Availability] Error:', error);
      return {
        hasAvailability: false,
        timeSlots: []
      };
    }
  }

  /**
   * Book a time slot in GHL calendar
   */
  static async bookGHLTimeSlot(
    calendarId: string,
    contactId: string,
    startTime: string,
    endTime: string,
    title: string,
    notes?: string
  ): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    try {
      const { apiKey, locationId } = await this.getGHLCredentials();

      if (!apiKey || !locationId) {
        return { success: false, error: 'Missing GHL credentials' };
      }

      const response = await fetch(
        `https://services.leadconnectorhq.com/calendars/events/appointments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locationId,
            contactId,
            calendarId,
            title,
            appointmentStatus: 'confirmed',
            startTime,
            endTime,
            notes: notes || ''
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL Availability] Failed to book slot:', errorText);
        return { success: false, error: `Failed to book: ${response.status}` };
      }

      const data = await response.json();
      console.log('[GHL Availability] Slot booked successfully:', data.id);

      return {
        success: true,
        appointmentId: data.id
      };

    } catch (error) {
      console.error('[GHL Availability] Error booking slot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
