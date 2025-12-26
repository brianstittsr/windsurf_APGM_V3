/**
 * Unified Availability Hook
 * 
 * This hook automatically switches between GHL calendar availability
 * and website's built-in availability system based on admin settings.
 */

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface TimeSlot {
  time: string;
  endTime: string;
  duration: string;
  available: boolean;
  artistId: string;
  artistName: string;
  calendarId?: string;
  calendarName?: string;
}

interface AvailabilityData {
  hasAvailability: boolean;
  timeSlots: TimeSlot[];
  source: 'ghl' | 'website'; // Track which system provided the data
}

export function useAvailabilitySystem(selectedDate: string) {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useGHL, setUseGHL] = useState(false);

  // Check which system to use
  useEffect(() => {
    const checkAvailabilityMode = async () => {
      try {
        const settingsRef = collection(getDb(), 'crmSettings');
        const snapshot = await getDocs(settingsRef);
        
        if (!snapshot.empty) {
          const settings = snapshot.docs[0].data();
          setUseGHL(settings.useGHLAvailability || false);
          console.log('[Availability System] Mode:', settings.useGHLAvailability ? 'GHL' : 'Website');
        } else {
          setUseGHL(false);
          console.log('[Availability System] Mode: Website (default)');
        }
      } catch (error) {
        console.error('[Availability System] Error checking mode (using Website as default):', error);
        // Default to Website if Firestore permissions error - more reliable fallback
        setUseGHL(false);
      }
    };

    checkAvailabilityMode();
  }, []);

  // Fetch availability based on selected system
  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        if (useGHL) {
          // Fetch from GHL
          console.log('[Availability System] Fetching from GHL for:', selectedDate);
          try {
            const response = await fetch(`/api/availability/ghl?date=${selectedDate}`);
            
            if (!response.ok) {
              console.warn('[Availability System] GHL API returned error, falling back to website');
              // Fall through to website mode
            } else {
              const data = await response.json();
              
              // Check if GHL returned valid data
              if (data.timeSlots && data.timeSlots.length > 0) {
                setAvailability({
                  hasAvailability: data.hasAvailability,
                  timeSlots: data.timeSlots,
                  source: 'ghl'
                });
                console.log('[Availability System] GHL slots:', data.timeSlots.length);
                return; // Success - exit early
              } else {
                console.log('[Availability System] GHL returned no slots, falling back to website');
              }
            }
          } catch (ghlError) {
            console.warn('[Availability System] GHL fetch failed, falling back to website:', ghlError);
          }
          
          // Fall through to website mode if GHL fails or returns no data
        }
        
        {
          // Fetch from website's built-in system
          console.log('[Availability System] Fetching from website for:', selectedDate);
          const { useTimeSlots } = await import('./useTimeSlots');
          
          // We need to call the hook directly, but since we can't use hooks conditionally,
          // we'll fetch the data directly using the same logic
          const date = new Date(selectedDate + 'T12:00:00');
          const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

          const availabilityRef = collection(getDb(), 'artistAvailability');
          const snapshot = await getDocs(availabilityRef);

          const dayAvailability = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.dayOfWeek === dayOfWeek && data.isEnabled;
          });

          if (dayAvailability) {
            const data = dayAvailability.data();
            const timeRanges = data.timeRanges || [];

            // Get booked slots
            const { AvailabilityService } = await import('@/services/availabilityService');
            const bookedSlots = await AvailabilityService.getBookedSlots(selectedDate);

            // Generate time slots
            const timeSlots: TimeSlot[] = [];
            const convertTo24Hour = (time12: string): number => {
              const [time, period] = time12.split(' ');
              let [hours] = time.split(':').map(Number);
              if (period === 'PM' && hours !== 12) hours += 12;
              if (period === 'AM' && hours === 12) hours = 0;
              return hours;
            };

            timeRanges.forEach((range: any) => {
              if (range.isActive) {
                const startHour = convertTo24Hour(range.startTime);
                const endHour = convertTo24Hour(range.endTime);

                for (let hour = startHour; hour <= endHour - 3; hour += 1) {
                  const endTime = hour + 3;
                  const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                  const endTimeFormatted = `${endTime.toString().padStart(2, '0')}:00`;
                  
                  const isBooked = bookedSlots[timeSlot] && bookedSlots[timeSlot].available === false;
                  
                  // Check if past time
                  const now = new Date();
                  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
                  const isToday = selectedDateObj.toDateString() === now.toDateString();
                  
                  let isPastTime = false;
                  if (isToday) {
                    const currentHour = now.getHours();
                    const currentMinutes = now.getMinutes();
                    isPastTime = hour < currentHour || 
                                (hour === currentHour && currentMinutes > 0) ||
                                (hour - currentHour < 1 && hour > currentHour);
                  }
                  
                  if (!isPastTime) {
                    timeSlots.push({
                      time: timeSlot,
                      endTime: endTimeFormatted,
                      duration: '3 Hours',
                      available: !isBooked && !isPastTime,
                      artistId: data.artistId,
                      artistName: 'Victoria'
                    });
                  }
                }
              }
            });

            setAvailability({
              hasAvailability: timeSlots.length > 0,
              timeSlots,
              source: 'website'
            });
            console.log('[Availability System] Website slots:', timeSlots.length);
          } else {
            setAvailability({
              hasAvailability: false,
              timeSlots: [],
              source: 'website'
            });
          }
        }
      } catch (err) {
        console.error('[Availability System] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
        setAvailability({
          hasAvailability: false,
          timeSlots: [],
          source: useGHL ? 'ghl' : 'website'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, useGHL]);

  return { 
    availability, 
    loading, 
    error,
    isUsingGHL: useGHL
  };
}
