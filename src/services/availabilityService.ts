import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface TimeRange {
  id: string;
  startTime: string; // Format: "9:00 AM"
  endTime: string;   // Format: "5:00 PM"
  isActive: boolean;
}

export interface ArtistAvailability {
  id: string;
  artistId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isEnabled: boolean;
  timeRanges: TimeRange[];
  servicesOffered: string[]; // Array of service IDs, or ['all'] for all services
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ScheduleException {
  id: string;
  artistId: string;
  date: string; // Format: "2025-08-04"
  type: 'unavailable' | 'custom_hours';
  reason?: string;
  customTimeRanges?: TimeRange[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AvailabilitySettings {
  timezone: string;
  bufferTime: number; // Minutes between appointments
  advanceBookingDays: number;
  defaultServiceDuration: number;
}

export class AvailabilityService {
  // Get artist's weekly availability
  static async getArtistAvailability(artistId: string): Promise<ArtistAvailability[]> {
    try {
      const availabilityRef = collection(db, 'artistAvailability');
      const q = query(
        availabilityRef, 
        where('artistId', '==', artistId)
      );
      const snapshot = await getDocs(q);
      
      // Sort client-side to avoid needing a composite index
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ArtistAvailability)).sort((a, b) => {
        const aIndex = dayOrder.indexOf(a.dayOfWeek.toLowerCase());
        const bIndex = dayOrder.indexOf(b.dayOfWeek.toLowerCase());
        return aIndex - bIndex;
      });
    } catch (error) {
      console.error('Error fetching artist availability:', error);
      return [];
    }
  }

  // Create or update availability for a specific day
  static async updateDayAvailability(
    artistId: string, 
    dayOfWeek: string, 
    availabilityData: Partial<ArtistAvailability>
  ): Promise<void> {
    try {
      const docId = `${artistId}_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      const updateData = {
        ...availabilityData,
        artistId,
        dayOfWeek,
        updatedAt: Timestamp.now()
      };

      await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error updating day availability:', error);
      throw error;
    }
  }

  // Toggle day availability on/off
  static async toggleDayAvailability(artistId: string, dayOfWeek: string, isEnabled: boolean): Promise<void> {
    try {
      const docId = `${artistId}_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      // Use setDoc with merge to handle both existing and non-existing documents
      await setDoc(docRef, {
        id: docId,
        artistId,
        dayOfWeek,
        isEnabled,
        timeRanges: [],
        servicesOffered: ['all'],
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error toggling day availability:', error);
      throw error;
    }
  }

  // Add time range to a day
  static async addTimeRange(
    artistId: string, 
    dayOfWeek: string, 
    timeRange: Omit<TimeRange, 'id'>
  ): Promise<void> {
    try {
      const docId = `${artistId}_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      // Get current availability
      const availability = await this.getArtistAvailability(artistId);
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      const newTimeRange: TimeRange = {
        ...timeRange,
        id: `range_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const updatedTimeRanges = dayAvailability 
        ? [...dayAvailability.timeRanges, newTimeRange]
        : [newTimeRange];

      await updateDoc(docRef, {
        timeRanges: updatedTimeRanges,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding time range:', error);
      throw error;
    }
  }

  // Update time range
  static async updateTimeRange(
    artistId: string, 
    dayOfWeek: string, 
    timeRangeId: string, 
    updates: Partial<TimeRange>
  ): Promise<void> {
    try {
      const docId = `${artistId}_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      // Get current availability
      const availability = await this.getArtistAvailability(artistId);
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (!dayAvailability) return;

      const updatedTimeRanges = dayAvailability.timeRanges.map(range =>
        range.id === timeRangeId ? { ...range, ...updates } : range
      );

      await updateDoc(docRef, {
        timeRanges: updatedTimeRanges,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating time range:', error);
      throw error;
    }
  }

  // Remove time range
  static async removeTimeRange(
    artistId: string, 
    dayOfWeek: string, 
    timeRangeId: string
  ): Promise<void> {
    try {
      const docId = `${artistId}_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      // Get current availability
      const availability = await this.getArtistAvailability(artistId);
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (!dayAvailability) return;

      const updatedTimeRanges = dayAvailability.timeRanges.filter(
        range => range.id !== timeRangeId
      );

      await updateDoc(docRef, {
        timeRanges: updatedTimeRanges,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error removing time range:', error);
      throw error;
    }
  }

  // Initialize default availability for new artist
  static async initializeArtistAvailability(artistId: string): Promise<void> {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Default working hours for Victoria
    const defaultSchedule: Record<string, { start: string; end: string; isWorking: boolean }> = {
      monday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
      tuesday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
      wednesday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
      thursday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
      friday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
      saturday: { start: "10:00 AM", end: "4:00 PM", isWorking: true },
      sunday: { start: "10:00 AM", end: "4:00 PM", isWorking: false }
    };
    
    try {
      const promises = daysOfWeek.map(day => {
        const docId = `${artistId}_${day}`;
        const docRef = doc(db, 'artistAvailability', docId);
        const daySchedule = defaultSchedule[day];
        
        const timeRanges: TimeRange[] = daySchedule.isWorking ? [{
          id: `${day}_default`,
          startTime: daySchedule.start,
          endTime: daySchedule.end,
          isActive: true
        }] : [];
        
        return setDoc(docRef, {
          id: docId,
          artistId,
          dayOfWeek: day,
          isEnabled: daySchedule.isWorking,
          timeRanges,
          servicesOffered: ['all'],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error initializing artist availability:', error);
      throw error;
    }
  }

  // Schedule exceptions (holidays, time off, etc.)
  static async getScheduleExceptions(artistId: string): Promise<ScheduleException[]> {
    try {
      const exceptionsRef = collection(db, 'artistScheduleExceptions');
      const q = query(
        exceptionsRef, 
        where('artistId', '==', artistId)
      );
      const snapshot = await getDocs(q);
      
      // Sort client-side to avoid needing a composite index
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScheduleException)).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    } catch (error) {
      console.error('Error fetching schedule exceptions:', error);
      return [];
    }
  }

  // Add schedule exception
  static async addScheduleException(exception: Omit<ScheduleException, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const exceptionsRef = collection(db, 'artistScheduleExceptions');
      const docRef = doc(exceptionsRef);
      
      await setDoc(docRef, {
        ...exception,
        id: docRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding schedule exception:', error);
      throw error;
    }
  }

  // Update services offered for a specific day
  static async updateServicesOffered(artistId: string, dayOfWeek: string, servicesOffered: string[]): Promise<void> {
    try {
      const docId = `${artistId}_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      await setDoc(docRef, {
        id: docId,
        artistId,
        dayOfWeek,
        servicesOffered,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating services offered:', error);
      throw error;
    }
  }

  // Remove schedule exception
  static async removeScheduleException(exceptionId: string): Promise<void> {
    try {
      const docRef = doc(db, 'artistScheduleExceptions', exceptionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error removing schedule exception:', error);
      throw error;
    }
  }

  // Book a specific time slot (remove from availability)
  static async bookTimeSlot(
    artistId: string,
    date: string, 
    timeSlot: string, 
    appointmentId: string
  ): Promise<void> {
    try {
      console.log(`🚫 Booking time slot: ${date} ${timeSlot} for artist ${artistId}`);
      
      // Parse the date to get day of week
      const dateObj = new Date(date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      
      // Create a booked slots document for this specific date
      const bookedSlotsRef = doc(db, 'bookedSlots', date);
      
      // Get existing booked slots for this date
      const { getDoc } = await import('firebase/firestore');
      const bookedSlotsDoc = await getDoc(bookedSlotsRef);
      const existingBookedSlots = bookedSlotsDoc.exists() ? bookedSlotsDoc.data() : {};
      
      // Add this time slot as booked
      const updatedBookedSlots = {
        ...existingBookedSlots,
        [timeSlot]: {
          artistId,
          appointmentId,
          bookedAt: Timestamp.now(),
          available: false
        }
      };
      
      // Update the booked slots document
      await setDoc(bookedSlotsRef, updatedBookedSlots, { merge: true });
      
      console.log(`✅ Time slot ${timeSlot} on ${date} marked as booked`);
      
    } catch (error) {
      console.error('❌ Error booking time slot:', error);
      throw error;
    }
  }

  // Release a booked time slot (make available again)
  static async releaseTimeSlot(
    artistId: string,
    date: string, 
    timeSlot: string
  ): Promise<void> {
    try {
      console.log(`🔓 Releasing time slot: ${date} ${timeSlot} for artist ${artistId}`);
      
      const bookedSlotsRef = doc(db, 'bookedSlots', date);
      
      // Get existing booked slots for this date
      const { getDoc, updateDoc, deleteField } = await import('firebase/firestore');
      const bookedSlotsDoc = await getDoc(bookedSlotsRef);
      
      if (bookedSlotsDoc.exists()) {
        // Remove this specific time slot from booked slots
        await updateDoc(bookedSlotsRef, {
          [timeSlot]: deleteField()
        });
        
        console.log(`✅ Time slot ${timeSlot} on ${date} released`);
      }
      
    } catch (error) {
      console.error('❌ Error releasing time slot:', error);
      throw error;
    }
  }

  // Get booked slots for a specific date
  static async getBookedSlots(date: string): Promise<Record<string, any>> {
    try {
      const bookedSlotsRef = doc(db, 'bookedSlots', date);
      const { getDoc } = await import('firebase/firestore');
      const bookedSlotsDoc = await getDoc(bookedSlotsRef);
      
      return bookedSlotsDoc.exists() ? bookedSlotsDoc.data() : {};
    } catch (error) {
      console.error('Error getting booked slots:', error);
      return {};
    }
  }

  // Check if a specific time slot is available
  static async isTimeSlotAvailable(
    artistId: string,
    date: string, 
    timeSlot: string
  ): Promise<boolean> {
    try {
      const bookedSlots = await this.getBookedSlots(date);
      return !bookedSlots[timeSlot] || bookedSlots[timeSlot].available !== false;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }
}
