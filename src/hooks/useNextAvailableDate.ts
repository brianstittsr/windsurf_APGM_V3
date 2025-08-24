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
      console.log('🔍 findNextAvailableDate called - starting search...');
      setLoading(true);
      setError(null);

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      console.log('📅 Today string:', todayString);

      // Query availability collection for all documents
      const availabilityRef = collection(db, 'availability');
      const snapshot = await getDocs(availabilityRef);
      console.log('📊 Total availability documents:', snapshot.docs.length);
      
      // Filter and sort dates manually
      const availableDates: { date: string; timeSlots: any[] }[] = [];
      
      snapshot.docs.forEach(doc => {
        const dateString = doc.id;
        console.log('🗓️ Checking date:', dateString);
        
        // Only consider dates >= today
        if (dateString >= todayString) {
          const data = doc.data();
          const allSlots = data.timeSlots || [];
          const availableSlots = allSlots.filter((slot: any) => 
            slot.available && slot.artistName !== 'Admin'
          );
          
          console.log(`  - Date ${dateString}: ${allSlots.length} total slots, ${availableSlots.length} available`);
          
          if (availableSlots.length > 0) {
            availableDates.push({
              date: dateString,
              timeSlots: availableSlots
            });
          }
        } else {
          console.log(`  - Date ${dateString}: skipped (past date)`);
        }
      });

      // Sort by date and get the earliest available date
      availableDates.sort((a, b) => a.date.localeCompare(b.date));
      console.log('📋 Available dates found:', availableDates.map(d => d.date));
      
      if (availableDates.length > 0) {
        setNextAvailable(availableDates[0]);
        console.log('✅ Found next available date:', availableDates[0].date, 'with', availableDates[0].timeSlots.length, 'slots');
      } else {
        setNextAvailable(null);
        console.log('❌ No available dates found');
      }
    } catch (err) {
      console.error('💥 Error finding next available date:', err);
      setError(err instanceof Error ? err.message : 'Failed to find next available date');
      setNextAvailable(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { nextAvailable, loading, error, findNextAvailableDate };
}
