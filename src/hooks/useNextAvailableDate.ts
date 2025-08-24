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

      // Query artistAvailability collection for all documents
      const availabilityRef = collection(db, 'artistAvailability');
      const snapshot = await getDocs(availabilityRef);
      console.log('📊 Total artistAvailability documents:', snapshot.docs.length);
      
      // Generate available dates based on artist availability patterns
      const availableDates: { date: string; timeSlots: any[] }[] = [];
      
      // Get next 30 days to check
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        if (dateString >= todayString) {
          const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
          console.log(`🗓️ Checking ${dateString} (${dayOfWeek})`);
          
          // Find artist availability for this day of week
          const dayAvailability = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.dayOfWeek === dayOfWeek && data.isEnabled;
          });
          
          if (dayAvailability) {
            const data = dayAvailability.data();
            const timeRanges = data.timeRanges || [];
            
            // Generate time slots from time ranges
            const timeSlots: any[] = [];
            timeRanges.forEach((range: any) => {
              if (range.isActive) {
                // Generate hourly slots between start and end time
                const startHour = parseInt(range.startTime.split(':')[0]);
                const endHour = parseInt(range.endTime.split(':')[0]);
                
                for (let hour = startHour; hour < endHour; hour++) {
                  timeSlots.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    available: true,
                    artistId: data.artistId,
                    artistName: 'Victoria' // Default artist name
                  });
                }
              }
            });
            
            console.log(`  - Date ${dateString}: ${timeSlots.length} available slots`);
            
            if (timeSlots.length > 0) {
              availableDates.push({
                date: dateString,
                timeSlots
              });
            }
          } else {
            console.log(`  - Date ${dateString}: no availability for ${dayOfWeek}`);
          }
        }
      }

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
