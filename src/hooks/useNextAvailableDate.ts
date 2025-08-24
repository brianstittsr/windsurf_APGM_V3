import { useState, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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

      // Query availability collection for all documents
      const availabilityRef = collection(db, 'availability');
      const snapshot = await getDocs(availabilityRef);
      
      // Filter and sort dates manually
      const availableDates: { date: string; timeSlots: any[] }[] = [];
      
      snapshot.docs.forEach(doc => {
        const dateString = doc.id;
        
        // Only consider dates >= today
        if (dateString >= todayString) {
          const data = doc.data();
          const availableSlots = data.timeSlots?.filter((slot: any) => 
            slot.available && slot.artistName !== 'Admin'
          ) || [];
          
          if (availableSlots.length > 0) {
            availableDates.push({
              date: dateString,
              timeSlots: availableSlots
            });
          }
        }
      });

      // Sort by date and get the earliest available date
      availableDates.sort((a, b) => a.date.localeCompare(b.date));
      
      if (availableDates.length > 0) {
        setNextAvailable(availableDates[0]);
        console.log('Found next available date:', availableDates[0].date);
      } else {
        setNextAvailable(null);
        console.log('No available dates found');
      }
    } catch (err) {
      console.error('Error finding next available date:', err);
      setError(err instanceof Error ? err.message : 'Failed to find next available date');
    } finally {
      setLoading(false);
    }
  }, []);

  return { nextAvailable, loading, error, findNextAvailableDate };
}
