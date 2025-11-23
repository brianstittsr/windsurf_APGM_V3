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
   * Fetch calendar slots for a specific date from GHL
   */
  private static async fetchGHLCalendarSlots(
    apiKey: string,
    calendarId: string,
    date: string
  ): Promise<any[]> {
    // GHL expects date in YYYY-MM-DD format
    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');

    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startOfDay.getTime()}&endDate=${endOfDay.getTime()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch slots for calendar ${calendarId}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.slots || [];
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
          const slots = await this.fetchGHLCalendarSlots(apiKey, calendar.id, date);
          
          console.log(`[GHL Availability] Calendar "${calendar.name}": ${slots.length} slots`);

          // Convert GHL slots to our format
          slots.forEach((slot: any) => {
            const startTime = new Date(slot.startTime);
            const endTime = new Date(slot.endTime);
            
            // Calculate duration in hours
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationHours = Math.round(durationMs / (1000 * 60 * 60));
            
            allTimeSlots.push({
              time: startTime.toTimeString().slice(0, 5), // HH:MM format
              endTime: endTime.toTimeString().slice(0, 5),
              duration: `${durationHours} Hour${durationHours !== 1 ? 's' : ''}`,
              available: true,
              artistId: calendar.teamMembers?.[0] || 'victoria',
              artistName: calendar.teamMembers?.[0] || 'Victoria',
              calendarId: calendar.id,
              calendarName: calendar.name
            });
          });

        } catch (error) {
          console.error(`[GHL Availability] Error fetching slots for calendar ${calendar.name}:`, error);
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
