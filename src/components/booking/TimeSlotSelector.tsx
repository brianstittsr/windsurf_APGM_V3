'use client';

import { useState, useEffect } from 'react';

interface TimeSlot {
  id: 'morning' | 'afternoon' | 'evening';
  label: string;
  icon: string;
  defaultStartTime: string;
  startTime: string;
  endTime: string;
  available: boolean;
  booked: boolean;
  isPast?: boolean;
  isDisabled?: boolean; // Disabled by artist availability settings
}

interface TimeSlotSelectorProps {
  selectedDate: string;
  selectedSlot: string | null;
  onSlotSelect: (slotId: string, startTime: string) => void;
}

// Default time slot configuration
const DEFAULT_SLOTS: Omit<TimeSlot, 'available' | 'booked' | 'startTime' | 'endTime'>[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: 'fa-sun', // sunrise icon
    defaultStartTime: '10:00',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    icon: 'fa-cloud-sun', // sunshine icon
    defaultStartTime: '13:00',
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: 'fa-moon', // sunset/evening icon
    defaultStartTime: '16:00',
  },
];

// Helper to format time to 12-hour format
function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper to add hours to a time string
function addHours(time24: string, hours: number): string {
  const [h, m] = time24.split(':').map(Number);
  const newHours = h + hours;
  return `${newHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Check if a time slot is in the past for a given date
function isSlotInPast(date: string, startTime: string): boolean {
  const now = new Date();
  
  // Get today's date in local timezone (YYYY-MM-DD format)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  console.log(`🕐 isSlotInPast check: selectedDate=${date}, today=${today}, startTime=${startTime}, currentTime=${now.getHours()}:${now.getMinutes()}`);
  
  // If the date is in the future, the slot is not in the past
  if (date > today) {
    console.log(`  → Date ${date} is in the future (after ${today}), slot is available`);
    return false;
  }
  
  // If the date is in the past, all slots are in the past
  if (date < today) {
    console.log(`  → Date ${date} is in the past (before ${today}), slot is unavailable`);
    return true;
  }
  
  // For today, compare the current time with the slot start time
  const [slotHours, slotMinutes] = startTime.split(':').map(Number);
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Slot is in the past if current time is >= slot start time
  if (currentHours > slotHours) {
    console.log(`  → Today: current hour ${currentHours} > slot hour ${slotHours}, slot is unavailable`);
    return true;
  }
  if (currentHours === slotHours && currentMinutes >= slotMinutes) {
    console.log(`  → Today: current time ${currentHours}:${currentMinutes} >= slot time ${slotHours}:${slotMinutes}, slot is unavailable`);
    return true;
  }
  
  console.log(`  → Today: current time ${currentHours}:${currentMinutes} < slot time ${slotHours}:${slotMinutes}, slot is available`);
  return false;
}

export default function TimeSlotSelector({
  selectedDate,
  selectedSlot,
  onSlotSelect,
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch availability for the selected date
        const response = await fetch(`/api/availability/slots?date=${selectedDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        
        // Map default slots with availability data
        const slots: TimeSlot[] = DEFAULT_SLOTS.map((slot) => {
          const startTime = data.customTimes?.[slot.id]?.startTime || slot.defaultStartTime;
          const endTime = addHours(startTime, 3); // 3-hour appointments
          
          // Check if this slot is booked
          const isBooked = data.bookedSlots?.includes(slot.id) || false;
          
          // Check if this slot is disabled by artist availability settings
          const isDisabled = data.disabledSlots?.includes(slot.id) || false;
          
          // Check if slot is in the past using robust comparison
          const isPast = isSlotInPast(selectedDate, startTime);

          console.log(`[TimeSlotSelector] Slot ${slot.id}: booked=${isBooked}, disabled=${isDisabled}, isPast=${isPast}`);

          return {
            ...slot,
            startTime,
            endTime,
            available: !isBooked && !isPast && !isDisabled,
            booked: isBooked,
            isPast,
            isDisabled,
          };
        });

        setTimeSlots(slots);
      } catch (err) {
        console.error('Error fetching slot availability:', err);
        setError('Unable to load time slots');
        
        // Fallback to default slots without availability check
        const fallbackSlots: TimeSlot[] = DEFAULT_SLOTS.map((slot) => {
          const startTime = slot.defaultStartTime;
          const endTime = addHours(startTime, 3);
          
          // Use robust isPast check
          const isPast = isSlotInPast(selectedDate, startTime);

          return {
            ...slot,
            startTime,
            endTime,
            available: !isPast,
            booked: false,
            isPast,
          };
        });
        setTimeSlots(fallbackSlots);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  if (!selectedDate) {
    return null;
  }

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-gray-900 mb-1">
          Available Times for {formattedDate}
        </h4>
        <p className="text-sm text-gray-500">
          Each appointment is 3 hours
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269] mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading available times...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-center text-sm mb-4">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {/* Time Slots Grid */}
      {!loading && timeSlots.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            const isPast = slot.isPast || false;
            const isDisabled = !slot.available || isPast;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSlotSelect(slot.id, slot.startTime)}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-300
                  ${isSelected
                    ? 'border-[#AD6269] bg-[#AD6269] text-white shadow-lg scale-105'
                    : isPast
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-[#AD6269] hover:shadow-md hover:-translate-y-1'
                  }
                `}
              >
                {/* Icon */}
                <div className={`text-4xl mb-3 ${isSelected ? 'text-white' : isDisabled ? 'text-gray-300' : 'text-[#AD6269]'}`}>
                  <i className={`fas ${slot.icon}`}></i>
                </div>

                {/* Label */}
                <h5 className={`text-lg font-bold mb-2 ${isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                  {slot.label}
                </h5>

                {/* Time Range */}
                <p className={`text-sm font-medium mb-2 ${isSelected ? 'text-white/90' : isDisabled ? 'text-gray-400' : 'text-[#AD6269]'}`}>
                  {formatTimeTo12Hour(slot.startTime)} - {formatTimeTo12Hour(slot.endTime)}
                </p>

                {/* Duration Badge */}
                <span className={`
                  inline-block px-3 py-1 rounded-full text-xs font-semibold
                  ${isSelected 
                    ? 'bg-white/20 text-white' 
                    : isDisabled 
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-[#AD6269]/10 text-[#AD6269]'
                  }
                `}>
                  3 Hours
                </span>

                {/* Status Indicator - Past Time */}
                {isPast && !slot.booked && !slot.isDisabled && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs font-semibold rounded-full">
                      Past
                    </span>
                  </div>
                )}

                {/* Status Indicator - Booked */}
                {slot.booked && !isPast && !slot.isDisabled && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                      Booked
                    </span>
                  </div>
                )}

                {/* Status Indicator - Not Available (disabled by artist) */}
                {slot.isDisabled && !isPast && !slot.booked && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                      Not Available
                    </span>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <i className="fas fa-check-circle text-white text-xl"></i>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No Slots Available Message */}
      {!loading && timeSlots.length > 0 && !timeSlots.some(s => s.available && !s.isPast) && (
        <div className="text-center py-4 mt-4 bg-amber-50 border border-amber-200 rounded-lg">
          <i className="fas fa-info-circle text-amber-500 text-xl mb-2"></i>
          <p className="text-amber-700 font-medium text-sm">
            {timeSlots.every(s => s.isPast) 
              ? 'All time slots have passed for today. Please select a future date.'
              : 'All available time slots are booked. Please select a different date.'}
          </p>
        </div>
      )}
    </div>
  );
}
