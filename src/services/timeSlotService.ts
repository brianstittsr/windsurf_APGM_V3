import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AvailabilityService, ArtistAvailability, TimeRange } from './availabilityService';
import { AppointmentService } from './database';
import { Appointment } from '@/types/database';

export interface TimeSlot {
  id: string;
  time: string; // "9:00 AM"
  available: boolean;
  artistId: string;
  artistName: string;
  duration: number; // minutes
  reason?: string; // if not available
  appointmentId?: string; // if booked
}

export interface DayTimeSlots {
  date: string; // "2025-08-05"
  dayOfWeek: string; // "monday"
  timeSlots: TimeSlot[];
  hasAvailability: boolean;
}

export class TimeSlotService {
  // Generate 2-hour time slots from a time range
  private static generateTimeSlots(timeRange: TimeRange, artistId: string, artistName: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    if (!timeRange.isActive) return slots;
    
    const startTime = this.parseTime(timeRange.startTime);
    const endTime = this.parseTime(timeRange.endTime);
    
    // Generate 4-hour slots
    let currentTime = startTime;
    let slotIndex = 0;
    
    // Check if the time range is exactly 4 hours or more
    const timeRangeDuration = endTime - startTime;
    
    if (timeRangeDuration >= 240) { // If range is 4 hours or more
      // For exactly 4-hour ranges, create one slot at the start time
      if (timeRangeDuration === 240) {
        const timeString = this.formatTime(currentTime);
        slots.push({
          id: `${artistId}_${timeString.replace(/[:\s]/g, '')}_${slotIndex}`,
          time: timeString,
          available: true,
          artistId,
          artistName,
          duration: 240 // 4 hours in minutes
        });
      } else {
        // For longer ranges, generate multiple 4-hour slots
        while (currentTime + 240 <= endTime) { // 240 minutes = 4 hours
          const timeString = this.formatTime(currentTime);
          
          slots.push({
            id: `${artistId}_${timeString.replace(/[:\s]/g, '')}_${slotIndex}`,
            time: timeString,
            available: true,
            artistId,
            artistName,
            duration: 240 // 4 hours in minutes
          });
          
          currentTime += 240; // Move to next 4-hour slot
          slotIndex++;
        }
      }
    }
    
    return slots;
  }

  // Parse time string to minutes since midnight
  private static parseTime(timeString: string): number {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalMinutes = hours * 60 + minutes;
    
    if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    } else if (period === 'AM' && hours === 12) {
      totalMinutes = minutes;
    }
    
    return totalMinutes;
  }

  // Format minutes since midnight to time string
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  // Get day of week from date string
  private static getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  // Get all artists (for now, return mock data - this should be replaced with actual artist service)
  private static async getArtists(): Promise<Array<{ id: string; name: string }>> {
    // TODO: Replace with actual artist service when implemented
    return [
      { id: 'victoria', name: 'Victoria' },
      { id: 'admin', name: 'Admin' }
    ];
  }

  // Get available time slots for a specific date
  static async getAvailableTimeSlots(date: string): Promise<DayTimeSlots> {
    try {
      const dayOfWeek = this.getDayOfWeek(date);
      const artists = await this.getArtists();
      const allTimeSlots: TimeSlot[] = [];

      // Get existing appointments for this date
      const existingAppointments = await AppointmentService.getAppointmentsByDate(date);
      const bookedSlots = new Map<string, Appointment>();
      
      existingAppointments.forEach(appointment => {
        if (appointment.status !== 'cancelled') {
          const key = `${appointment.artistId}_${appointment.scheduledTime}`;
          bookedSlots.set(key, appointment);
        }
      });

      // Process each artist's availability
      for (const artist of artists) {
        try {
          const artistAvailability = await AvailabilityService.getArtistAvailability(artist.id);
          const dayAvailability = artistAvailability.find(a => a.dayOfWeek === dayOfWeek);
          
          if (dayAvailability && dayAvailability.isEnabled) {
            const artistSlots: TimeSlot[] = [];
            const seenTimes = new Set<string>();
            
            // Debug logging for Saturday availability
            if (dayOfWeek === 'saturday' && artist.name === 'Victoria') {
              console.log('🔍 Victoria Saturday availability debug:', {
                dayOfWeek,
                isEnabled: dayAvailability.isEnabled,
                timeRanges: dayAvailability.timeRanges.map(tr => ({
                  startTime: tr.startTime,
                  endTime: tr.endTime,
                  isActive: tr.isActive
                }))
              });
            }
            
            // Generate time slots from each time range
            dayAvailability.timeRanges.forEach(timeRange => {
              const slots = this.generateTimeSlots(timeRange, artist.id, artist.name);
              
              // Debug logging for Saturday slots
              if (dayOfWeek === 'saturday' && artist.name === 'Victoria') {
                console.log('🔍 Generated slots for time range:', {
                  timeRange: { startTime: timeRange.startTime, endTime: timeRange.endTime },
                  generatedSlots: slots.map(s => s.time)
                });
              }
              
              // Only add slots that haven't been seen before for this artist
              slots.forEach(slot => {
                if (!seenTimes.has(slot.time)) {
                  seenTimes.add(slot.time);
                  artistSlots.push(slot);
                }
              });
            });
            
            // Check if slots are already booked
            artistSlots.forEach(slot => {
              const bookingKey = `${slot.artistId}_${slot.time}`;
              const bookedAppointment = bookedSlots.get(bookingKey);
              
              if (bookedAppointment) {
                slot.available = false;
                slot.appointmentId = bookedAppointment.id;
                slot.reason = 'Booked';
              }
            });
            
            allTimeSlots.push(...artistSlots);
          }
        } catch (error) {
          console.error(`Error fetching availability for artist ${artist.id}:`, error);
          // Continue with other artists even if one fails
        }
      }

      // Sort time slots by time
      allTimeSlots.sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time));

      return {
        date,
        dayOfWeek,
        timeSlots: allTimeSlots,
        hasAvailability: allTimeSlots.some(slot => slot.available)
      };
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return {
        date,
        dayOfWeek: this.getDayOfWeek(date),
        timeSlots: [],
        hasAvailability: false
      };
    }
  }

  // Get available time slots for multiple dates (useful for calendar view)
  static async getAvailableTimeSlotsForWeek(startDate: string): Promise<DayTimeSlots[]> {
    const results: DayTimeSlots[] = [];
    const start = new Date(startDate);
    
    // Get 7 days starting from startDate
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      try {
        const daySlots = await this.getAvailableTimeSlots(dateString);
        results.push(daySlots);
      } catch (error) {
        console.error(`Error getting slots for ${dateString}:`, error);
        results.push({
          date: dateString,
          dayOfWeek: this.getDayOfWeek(dateString),
          timeSlots: [],
          hasAvailability: false
        });
      }
    }
    
    return results;
  }

  // Check if a specific time slot is available
  static async isTimeSlotAvailable(date: string, time: string, artistId: string): Promise<boolean> {
    try {
      const daySlots = await this.getAvailableTimeSlots(date);
      const slot = daySlots.timeSlots.find(s => s.time === time && s.artistId === artistId);
      return slot ? slot.available : false;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }

  // Get next available date with time slots
  static async getNextAvailableDate(fromDate?: string): Promise<{ date: string; timeSlots: TimeSlot[] } | null> {
    const startDate = fromDate ? new Date(fromDate) : new Date();
    // Start checking from tomorrow, not today
    startDate.setDate(startDate.getDate() + 1);
    const maxDaysToCheck = 30; // Check up to 30 days ahead
    
    for (let i = 0; i < maxDaysToCheck; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      try {
        const daySlots = await this.getAvailableTimeSlots(dateString);
        if (daySlots.hasAvailability && daySlots.timeSlots.some(slot => slot.available)) {
          return {
            date: dateString,
            timeSlots: daySlots.timeSlots.filter(slot => slot.available)
          };
        }
      } catch (error) {
        console.error(`Error checking availability for ${dateString}:`, error);
      }
    }
    
    return null;
  }
}
