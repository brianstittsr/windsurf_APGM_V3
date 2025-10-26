import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface TimeSlot {
  time: string;
  endTime?: string;
  duration?: string;
  available: boolean;
  artistId: string;
  artistName: string;
}

interface TimeSlotsData {
  hasAvailability: boolean;
  timeSlots: TimeSlot[];
}

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h: string): number {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return parseInt(hours, 10);
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
        
        console.log('🕐 useTimeSlots: Fetching time slots for date:', selectedDate);

        // Get day of week from selected date
        const date = new Date(selectedDate + 'T12:00:00');
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
        console.log('🗓️ useTimeSlots: Day of week:', dayOfWeek, '- getDay() returned:', date.getDay());

        // Query artistAvailability collection for all documents
        const availabilityRef = collection(getDb(), 'artistAvailability');
        const snapshot = await getDocs(availabilityRef);
        console.log('📊 useTimeSlots: Total artistAvailability documents:', snapshot.docs.length);

        // Find availability for this day of week
        const dayAvailability = snapshot.docs.find(doc => {
          const data = doc.data();
          console.log(`    🔍 useTimeSlots: Checking doc ${doc.id}: dayOfWeek=${data.dayOfWeek}, isEnabled=${data.isEnabled}, looking for ${dayOfWeek}`);
          return data.dayOfWeek === dayOfWeek && data.isEnabled;
        });

        if (dayAvailability) {
          const data = dayAvailability.data();
          const timeRanges = data.timeRanges || [];
          console.log(`    📋 useTimeSlots: Processing ${timeRanges.length} time ranges for ${dayOfWeek}`);

          // Get booked slots for this date
          const { AvailabilityService } = await import('@/services/availabilityService');
          const bookedSlots = await AvailabilityService.getBookedSlots(selectedDate);
          console.log(`🚫 useTimeSlots: Booked slots for ${selectedDate}:`, bookedSlots);

          // Generate time slots from time ranges
          const timeSlots: TimeSlot[] = [];
          timeRanges.forEach((range: any, index: number) => {
            console.log(`      🕐 useTimeSlots: Range ${index}: ${range.startTime} - ${range.endTime}, isActive: ${range.isActive}`);
            
            if (range.isActive) {
              // Convert 12-hour format to 24-hour format
              const startHour = convertTo24Hour(range.startTime);
              const endHour = convertTo24Hour(range.endTime);
              
              console.log(`      ⏰ useTimeSlots: Converted times: ${startHour}:00 - ${endHour}:00`);
              
              // Generate non-overlapping 4-hour booking slots
              for (let hour = startHour; hour <= endHour - 4; hour += 4) {
                const endTime = hour + 4;
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                const endTimeFormatted = `${endTime.toString().padStart(2, '0')}:00`;
                
                // Check if this time slot is booked
                const isBooked = bookedSlots[timeSlot] && bookedSlots[timeSlot].available === false;
                
                // Enhanced past-time filtering for current day
                const now = new Date();
                const selectedDateObj = new Date(selectedDate + 'T12:00:00');
                const isToday = selectedDateObj.toDateString() === now.toDateString();
                
                let isPastTime = false;
                if (isToday) {
                  const currentHour = now.getHours();
                  const currentMinutes = now.getMinutes();
                  const slotStartTime = hour;
                  const slotEndTime = hour + 4;
                  
                  // Enhanced logic: Hide slot if ANY part of the 4-hour window has passed
                  // This ensures we don't show slots that are partially in the past
                  isPastTime = slotStartTime < currentHour || 
                              (slotStartTime === currentHour && currentMinutes > 0) ||
                              // Also check if we're too close to the start time (less than 1 hour buffer)
                              (slotStartTime - currentHour < 1 && slotStartTime > currentHour);
                  
                  if (isPastTime) {
                    console.log(`      ⏰ useTimeSlots: Time slot ${timeSlot}-${endTimeFormatted} is unavailable (current time: ${currentHour}:${currentMinutes.toString().padStart(2, '0')}, slot starts at ${slotStartTime}:00)`);
                  }
                }
                
                timeSlots.push({
                  time: timeSlot,
                  endTime: endTimeFormatted,
                  duration: '4 Hours',
                  available: !isBooked && !isPastTime,
                  artistId: data.artistId,
                  artistName: 'Victoria' // Default artist name
                });
                
                if (isBooked) {
                  console.log(`      🚫 useTimeSlots: Time slot ${timeSlot} is booked (appointment: ${bookedSlots[timeSlot].appointmentId})`);
                }
              }
            }
          });

          // Filter out all past time slots for today to completely hide them
          const now = new Date();
          const selectedDateObj = new Date(selectedDate + 'T12:00:00');
          const isToday = selectedDateObj.toDateString() === now.toDateString();
          
          let filteredTimeSlots = timeSlots;
          if (isToday) {
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            
            // Remove (hide) all time slots that are in the past or too close to current time
            filteredTimeSlots = timeSlots.filter(slot => {
              const slotHour = parseInt(slot.time.split(':')[0]);
              const isPastOrTooClose = slotHour < currentHour || 
                                     (slotHour === currentHour && currentMinutes > 0) ||
                                     (slotHour - currentHour < 1 && slotHour > currentHour);
              
              if (isPastOrTooClose) {
                console.log(`      🚫 useTimeSlots: Hiding past/too-close time slot ${slot.time} (current: ${currentHour}:${currentMinutes.toString().padStart(2, '0')})`);
              }
              
              return !isPastOrTooClose;
            });
          }
          
          console.log(`  ✅ useTimeSlots: Generated ${timeSlots.length} total slots, showing ${filteredTimeSlots.length} available slots for ${selectedDate}`);
          
          setTimeSlots({
            hasAvailability: filteredTimeSlots.length > 0,
            timeSlots: filteredTimeSlots
          });
        } else {
          console.log(`  ❌ useTimeSlots: No availability for ${dayOfWeek} on ${selectedDate}`);
          setTimeSlots({
            hasAvailability: false,
            timeSlots: []
          });
        }
      } catch (err) {
        console.error('💥 useTimeSlots: Error fetching time slots:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch time slots');
        setTimeSlots({
          hasAvailability: false,
          timeSlots: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate]);

  return { timeSlots, loading, error };
}
