import { CalendarSyncService } from '@/services/calendarSync';
import { Appointment } from '@/types/database';

describe('CalendarSyncService', () => {
  const mockAppointment: Appointment = {
    id: 'test123',
    clientId: 'client456',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    serviceId: 'service789',
    serviceName: 'Microblading',
    artistId: 'artist001',
    date: '2024-01-01',
    time: '10:00',
    status: 'confirmed',
    price: 250,
    depositPaid: true,
    depositAmount: 50,
    remainingAmount: 200,
    paymentStatus: 'deposit_paid',
    paymentIntentId: 'pi_123',
    specialRequests: 'None',
    createdAt: new Date(),
    updatedAt: new Date(),
    rescheduleCount: 0,
    confirmationSent: true,
    reminderSent: false
  };

  describe('mapBookingToEvent', () => {
    it('should correctly map an appointment to a Google Calendar event', () => {
      const event = CalendarSyncService.mapBookingToEvent(mockAppointment);
      
      expect(event.summary).toBe('Microblading - John Doe');
      expect(event.start.dateTime).toBe('2024-01-01T10:00:00');
      expect(event.end.dateTime).toBe('2024-01-01T13:00:00');
      expect(event.attendees[0].email).toBe('john@example.com');
    });
  });

  describe('mapBookingToGHL', () => {
    it('should correctly map an appointment to a GHL appointment', () => {
      const ghlAppointment = CalendarSyncService.mapBookingToGHL(mockAppointment);
      
      expect(ghlAppointment.title).toBe('Microblading - John Doe');
      expect(ghlAppointment.startTime).toBe('2024-01-01T10:00:00');
      expect(ghlAppointment.endTime).toBe('2024-01-01T13:00:00');
      expect(ghlAppointment.description).toContain('Service: Microblading');
      expect(ghlAppointment.description).toContain('Price: $250');
    });
  });

  describe('mapStatusToGHL', () => {
    it('should map statuses correctly', () => {
      expect(CalendarSyncService.mapStatusToGHL('pending')).toBe('pending');
      expect(CalendarSyncService.mapStatusToGHL('confirmed')).toBe('confirmed');
      expect(CalendarSyncService.mapStatusToGHL('completed')).toBe('completed');
      expect(CalendarSyncService.mapStatusToGHL('cancelled')).toBe('cancelled');
    });
  });
});
