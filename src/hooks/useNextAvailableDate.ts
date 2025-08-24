import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NextAvailableDate {
  date: string;
  timeSlots: any[];
}

export function useNextAvailableDate() {
  const [nextAvailable, setNextAvailable] = useState<NextAvailableDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findNextAvailableDate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Query availability collection for dates >= today with available slots
      const availabilityRef = collection(db, 'availability');
      const q = query(
        availabilityRef,
        where('hasAvailability', '==', true),
        orderBy('__name__'),
        limit(30) // Check next 30 days
      );

      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const dateString = doc.id;
        if (dateString >= todayString) {
          const data = doc.data();
          const availableSlots = data.timeSlots?.filter((slot: any) => slot.available) || [];
          
          if (availableSlots.length > 0) {
            setNextAvailable({
              date: dateString,
              timeSlots: availableSlots
            });
            return;
          }
        }
      }

      // No available dates found
      setNextAvailable(null);
    } catch (err) {
      console.error('Error finding next available date:', err);
      setError(err instanceof Error ? err.message : 'Failed to find next available date');
    } finally {
      setLoading(false);
    }
  }, []);

  return { nextAvailable, loading, error, findNextAvailableDate };
}
