import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TimeSlot {
  time: string;
  available: boolean;
  artistId: string;
  artistName: string;
}

interface AvailabilityData {
  hasAvailability: boolean;
  timeSlots: TimeSlot[];
}

// Helper function to generate time slots from a time range
const generateTimeSlots = (startTime: string, endTime: string, artistId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  
  // Generate 4-hour slots
  const current = new Date(start);
  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5);
    slots.push({
      time: timeString,
      available: true,
      artistId: artistId,
      artistName: 'Artist' // This should be fetched from artist data
    });
    current.setHours(current.getHours() + 4);
  }
  
  return slots;
};

export function useAvailability(selectedDate: string) {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const date = new Date(selectedDate);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
        
        const availabilityRef = collection(db, 'artistAvailability');
        const snapshot = await getDocs(availabilityRef);
        
        const timeSlots: TimeSlot[] = [];
        let hasAnyAvailability = false;
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const dayData = data[dayOfWeek];
          
          if (dayData && dayData.isEnabled && dayData.timeRanges) {
            hasAnyAvailability = true;
            
            dayData.timeRanges.forEach((range: any) => {
              if (range.isEnabled) {
                const slots = generateTimeSlots(range.startTime, range.endTime, data.artistId);
                timeSlots.push(...slots);
              }
            });
          }
        });

        // Check for existing bookings and mark those slots as unavailable
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(bookingsRef, where('date', '==', selectedDate));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        const bookedSlots = new Set<string>();
        bookingsSnapshot.docs.forEach(doc => {
          const booking = doc.data();
          bookedSlots.add(`${booking.time}_${booking.artistId}`);
        });
        
        // Update availability based on bookings
        const updatedTimeSlots = timeSlots.map(slot => ({
          ...slot,
          available: !bookedSlots.has(`${slot.time}_${slot.artistId}`)
        }));

        setAvailability({
          hasAvailability: hasAnyAvailability,
          timeSlots: updatedTimeSlots.sort((a, b) => a.time.localeCompare(b.time))
        });
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  const bookTimeSlot = async (time: string, appointmentId: string, artistId: string) => {
    if (!selectedDate || !availability) return;

    try {
      // For artistAvailability collection, we'll create a separate bookings collection
      // to track booked slots without modifying the base availability
      const bookingRef = doc(db, 'bookings', `${selectedDate}_${time}_${artistId}`);
      
      await setDoc(bookingRef, {
        date: selectedDate,
        time: time,
        artistId: artistId,
        appointmentId: appointmentId,
        bookedAt: new Date()
      });

      // Update local state to reflect the booking
      const updatedTimeSlots = availability.timeSlots.map(slot => {
        if (slot.time === time && slot.artistId === artistId) {
          return { ...slot, available: false };
        }
        return slot;
      });

      setAvailability(prev => prev ? {
        ...prev,
        timeSlots: updatedTimeSlots
      } : null);

      return true;
    } catch (err) {
      console.error('Error booking time slot:', err);
      throw err;
    }
  };

  return { availability, loading, error, bookTimeSlot };
}
