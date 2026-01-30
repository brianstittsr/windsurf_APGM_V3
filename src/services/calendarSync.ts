import { GoogleCalendarService } from './googleCalendar';
import { GHLOrchestrator } from './ghl-orchestrator';
import { Appointment } from '@/types/database';

interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
  metadata?: {
    googleEventId?: string;
    ghlAppointmentId?: string;
  };
}

export class CalendarSyncService {
  static async syncBookingToGoogleCalendar(
    userId: string,
    calendarId: string,
    booking: Appointment
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };

    try {
      if (!booking.date || !booking.time) {
        throw new Error('Missing date or time in booking');
      }

      // Convert booking to Google Calendar event format
      const event = this.mapBookingToEvent(booking);

      if (booking.status === 'cancelled' && booking.googleEventId) {
        // Delete cancelled event
        await GoogleCalendarService.deleteEvent(userId, calendarId, booking.googleEventId);
        result.deleted = 1;
      } else if (booking.googleEventId) {
        // Update existing event
        await GoogleCalendarService.updateEvent(
          userId,
          calendarId,
          booking.googleEventId,
          event
        );
        result.updated = 1;
      } else {
        // Create new event
        const createdEvent = await GoogleCalendarService.createEvent(
          userId,
          calendarId,
          event
        );
        result.created = 1;
        result.metadata = { googleEventId: createdEvent.id || '' };
      }

      return { ...result, success: true };
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  static async syncBookingToGHL(booking: Appointment): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };

    try {
      const orchestrator = new GHLOrchestrator({
        apiKey: process.env.GHL_API_KEY || '',
        locationId: process.env.GHL_LOCATION_ID
      });

      if (booking.status === 'cancelled' && booking.ghlAppointmentId) {
        // Use GHL's appointment update with cancelled status
        await orchestrator.updateAppointment(
          booking.ghlAppointmentId,
          { status: 'cancelled' }
        );
        result.deleted = 1;
      } else if (booking.ghlAppointmentId) {
        await orchestrator.updateAppointment(
          booking.ghlAppointmentId,
          this.mapBookingToGHL(booking)
        );
        result.updated = 1;
      } else {
        // Create new appointment with calendarId from booking or env
        const calendarId = booking.calendarId || process.env.GHL_CALENDAR_ID;
        if (!calendarId) throw new Error('No calendar ID specified');
        
        const appointment = await orchestrator.createAppointment(
          calendarId,
          this.mapBookingToGHL(booking)
        );
        result.created = 1;
        result.metadata = { ghlAppointmentId: appointment.id };
      }

      return { ...result, success: true };
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  private static mapBookingToEvent(booking: Appointment): any {
    return {
      summary: `${booking.serviceName} - ${booking.clientName}`,
      description: `Service: ${booking.serviceName}\nPrice: $${booking.price}\nDeposit Paid: ${booking.depositPaid ? 'Yes' : 'No'}\nNotes: ${booking.notes || 'None'}`,
      start: {
        dateTime: `${booking.date}T${booking.time}:00`,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: `${booking.date}T${this.addDuration(booking.time, 180)}:00`,
        timeZone: 'America/New_York'
      },
      attendees: [
        { email: booking.clientEmail, displayName: booking.clientName }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      }
    };
  }

  private static mapBookingToGHL(booking: Appointment): any {
    return {
      title: `${booking.serviceName} - ${booking.clientName}`,
      startTime: `${booking.date}T${booking.time}:00`,
      endTime: `${booking.date}T${this.addDuration(booking.time, 180)}:00`,
      description: `Service: ${booking.serviceName}\nPrice: $${booking.price}`,
      status: this.mapStatusToGHL(booking.status)
    };
  }

  private static addDuration(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  private static mapStatusToGHL(status: Appointment['status']): string {
    switch (status) {
      case 'confirmed': return 'confirmed';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  }
}
