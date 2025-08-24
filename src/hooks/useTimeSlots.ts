import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TimeSlot {
  time: string;
  available: boolean;
  artistId: string;
  artistName: string;
}

interface TimeSlotsData {
  hasAvailability: boolean;
  timeSlots: TimeSlot[];
}

export function useTimeSlots(selectedDate: string) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots(null);
      return;
    }

    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);

        const availabilityRef = doc(db, 'availability', selectedDate);
        const availabilitySnap = await getDoc(availabilityRef);

        if (availabilitySnap.exists()) {
          const data = availabilitySnap.data();
          setTimeSlots({
            hasAvailability: data.hasAvailability || false,
            timeSlots: data.timeSlots || []
          });
        } else {
          setTimeSlots({
            hasAvailability: false,
            timeSlots: []
          });
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch time slots');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate]);

  return { timeSlots, loading, error };
}
