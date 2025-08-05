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
        where('artistId', '==', artistId),
        orderBy('dayOfWeek')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ArtistAvailability));
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
      
      await updateDoc(docRef, {
        isEnabled,
        updatedAt: Timestamp.now()
      });
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
    
    try {
      const promises = daysOfWeek.map(day => {
        const docId = `${artistId}_${day}`;
        const docRef = doc(db, 'artistAvailability', docId);
        
        return setDoc(docRef, {
          id: docId,
          artistId,
          dayOfWeek: day,
          isEnabled: false,
          timeRanges: [],
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
        where('artistId', '==', artistId),
        orderBy('date')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScheduleException));
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
}
