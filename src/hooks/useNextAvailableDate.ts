import { useState, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface NextAvailableDate {
  date: string;
  timeSlots: any[];
}

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h: string): number {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  let hourNum = parseInt(hours, 10);
  
  if (modifier === 'AM') {
    if (hourNum === 12) {
      hourNum = 0; // 12 AM = 0 hours
    }
  } else if (modifier === 'PM') {
    if (hourNum !== 12) {
      hourNum += 12; // Add 12 for PM times except 12 PM
    }
  }
  
  return hourNum;
}

export function useNextAvailableDate() {
  const [nextAvailable, setNextAvailable] = useState<NextAvailableDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear function to reset the next available date
  const clearNextAvailable = useCallback(() => {
    setNextAvailable(null);
  }, []);

  const findNextAvailableDate = useCallback(async (startFromDate?: string) => {
    try {
      console.log('🔍 findNextAvailableDate called - starting search...');
      setLoading(true);
      setError(null);

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Use startFromDate if provided, otherwise start from today
      // Ensure we never search from a past date
      const searchStartDate = startFromDate && startFromDate >= todayString ? startFromDate : todayString;
      console.log('📅 Search start date:', searchStartDate, '(today:', todayString, ')');
      console.log('🕐 Current time:', today.toLocaleString());

      // Query artistAvailability collection for all documents
      const availabilityRef = collection(getDb(), 'artistAvailability');
      const snapshot = await getDocs(availabilityRef);
      console.log('📊 Total artistAvailability documents:', snapshot.docs.length);
      
      // Generate available dates based on artist availability patterns
      const availableDates: { date: string; timeSlots: any[] }[] = [];
      
      // Get next 30 days to check from the search start date
      const startDate = new Date(searchStartDate + 'T12:00:00');
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        // Only check dates from today onwards, but allow searching from future dates
        console.log(`🔍 Comparing dates: ${dateString} >= ${todayString} = ${dateString >= todayString}`);
        if (dateString >= todayString) {
          const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
          console.log(`🗓️ Checking ${dateString} (${dayOfWeek}) - getDay() returned: ${checkDate.getDay()}`);
          
          // Find artist availability for this day of week
          const dayAvailability = snapshot.docs.find(doc => {
            const data = doc.data();
            console.log(`    🔍 Checking doc ${doc.id}: dayOfWeek=${data.dayOfWeek}, isEnabled=${data.isEnabled}, looking for ${dayOfWeek}`);
            return data.dayOfWeek === dayOfWeek && data.isEnabled;
          });
          
          if (dayAvailability) {
            const data = dayAvailability.data();
            const timeRanges = data.timeRanges || [];
            
            // Generate time slots from time ranges
            const timeSlots: any[] = [];
            console.log(`    📋 Processing ${timeRanges.length} time ranges for ${dayOfWeek}`);
            
            timeRanges.forEach((range: any, index: number) => {
              console.log(`      🕐 Range ${index}: ${range.startTime} - ${range.endTime}, isActive: ${range.isActive}`);
              
              if (range.isActive) {
                // Convert 12-hour format to 24-hour format
                const startHour = convertTo24Hour(range.startTime);
                const endHour = convertTo24Hour(range.endTime);
                
                console.log(`      ⏰ Converted times: ${startHour}:00 - ${endHour}:00`);
                
                // Generate non-overlapping 4-hour booking slots
                // Start from the earliest possible time (9 AM if available)
                for (let hour = startHour; hour <= endHour - 4; hour += 4) {
                  const endTime = hour + 4;
                  const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                  const endTimeFormatted = `${endTime.toString().padStart(2, '0')}:00`;
                  
                  // Apply current-time filtering for today's slots
                  const now = new Date();
                  const checkDateObj = new Date(dateString + 'T12:00:00');
                  const isToday = checkDateObj.toDateString() === now.toDateString();
                  
                  let isPastTime = false;
                  if (isToday) {
                    const currentHour = now.getHours();
                    const currentMinutes = now.getMinutes();
                    const slotStartTime = hour;
                    
                    // Enhanced logic: Hide slot if ANY part of the 4-hour window has passed
                    // Also add 1-hour buffer to prevent last-minute bookings
                    isPastTime = slotStartTime < currentHour || 
                                (slotStartTime === currentHour && currentMinutes > 0) ||
                                // Add 1-hour buffer to prevent last-minute bookings
                                (slotStartTime - currentHour < 1 && slotStartTime > currentHour);
                    
                    if (isPastTime) {
                      console.log(`        ⏰ Slot ${timeSlot}-${endTimeFormatted} filtered out (current time: ${currentHour}:${currentMinutes.toString().padStart(2, '0')}, slot starts at ${slotStartTime}:00)`);
                    }
                  }
                  
                  // Only add slots that are not in the past
                  if (!isPastTime) {
                    console.log(`        ⏰ Generated available slot: ${timeSlot} - ${endTimeFormatted}`);
                    
                    timeSlots.push({
                      time: timeSlot,
                      endTime: endTimeFormatted,
                      duration: '4 Hours',
                      available: true,
                      artistId: data.artistId,
                      artistName: 'Victoria' // Default artist name
                    });
                  }
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

  // Function to find next available date after a specific date
  const findNextAvailableAfter = useCallback(async (afterDate: string) => {
    const nextDay = new Date(afterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayString = nextDay.toISOString().split('T')[0];
    console.log('🔍 Finding next available date after:', afterDate, '-> searching from:', nextDayString);
    await findNextAvailableDate(nextDayString);
  }, [findNextAvailableDate]);

  return { nextAvailable, loading, error, findNextAvailableDate, findNextAvailableAfter, clearNextAvailable };
}
