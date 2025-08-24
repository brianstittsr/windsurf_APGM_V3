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

        // Fetch availability for the selected date
        const availabilityRef = doc(db, 'availability', selectedDate);
        const availabilitySnap = await getDoc(availabilityRef);

        if (availabilitySnap.exists()) {
          const data = availabilitySnap.data();
          setAvailability({
            hasAvailability: data.hasAvailability || false,
            timeSlots: data.timeSlots || []
          });
        } else {
          // No availability data for this date
          setAvailability({
            hasAvailability: false,
            timeSlots: []
          });
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  const bookTimeSlot = async (time: string, appointmentId: string, artistId: string) => {
    if (!selectedDate || !availability) return;

    try {
      const availabilityRef = doc(db, 'availability', selectedDate);
      
      // Update the time slot to mark it as booked
      const updatedTimeSlots = availability.timeSlots.map(slot => {
        if (slot.time === time && slot.artistId === artistId) {
          return { ...slot, available: false, appointmentId };
        }
        return slot;
      });

      await updateDoc(availabilityRef, {
        timeSlots: updatedTimeSlots
      });

      // Update local state
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
