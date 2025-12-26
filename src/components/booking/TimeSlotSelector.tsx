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
          
          // Check if slot is in the past (for today)
          const now = new Date();
          const slotDateTime = new Date(`${selectedDate}T${startTime}:00`);
          const isPast = slotDateTime < now;

          return {
            ...slot,
            startTime,
            endTime,
            available: !isBooked && !isPast,
            booked: isBooked,
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
          
          const now = new Date();
          const slotDateTime = new Date(`${selectedDate}T${startTime}:00`);
          const isPast = slotDateTime < now;

          return {
            ...slot,
            startTime,
            endTime,
            available: !isPast,
            booked: false,
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
            const isDisabled = !slot.available;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isDisabled}
                onClick={() => slot.available && onSlotSelect(slot.id, slot.startTime)}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-300
                  ${isSelected
                    ? 'border-[#AD6269] bg-[#AD6269] text-white shadow-lg scale-105'
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

                {/* Status Indicator */}
                {slot.booked && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                      Booked
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

      {/* No Slots Available */}
      {!loading && timeSlots.length > 0 && !timeSlots.some(s => s.available) && (
        <div className="text-center py-6 mt-4 bg-gray-50 rounded-lg">
          <i className="fas fa-calendar-times text-gray-400 text-3xl mb-3"></i>
          <p className="text-gray-600 font-medium">No available times on this date</p>
          <p className="text-gray-500 text-sm">Please select a different date</p>
        </div>
      )}
    </div>
  );
}
