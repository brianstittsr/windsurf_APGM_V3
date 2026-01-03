'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface DateAvailability {
  date: string;
  bookingCount: number;
  isAvailable: boolean;
}

interface MonthlyCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  maxBookingsPerDay?: number;
}

export default function MonthlyCalendar({ 
  selectedDate, 
  onDateSelect,
  maxBookingsPerDay = 2 
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateAvailability, setDateAvailability] = useState<Record<string, DateAvailability>>({});
  const [loading, setLoading] = useState(false);
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch availability data for the current month with timeout
  const fetchMonthAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Get first and last day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(
          `/api/availability/month?startDate=${startDate}&endDate=${endDate}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setDateAvailability(data.availability || {});
          
          // Find next available date
          if (data.nextAvailable) {
            setNextAvailableDate(data.nextAvailable);
          }
        } else {
          // API returned error - use default availability
          generateDefaultAvailability(firstDay, lastDay);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn('Month availability fetch timed out, using defaults');
        } else {
          console.error('Error fetching month availability:', fetchError);
        }
        // Generate default availability on error
        generateDefaultAvailability(firstDay, lastDay);
      }
    } catch (error) {
      console.error('Error in fetchMonthAvailability:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  // Generate default availability (all future dates available)
  const generateDefaultAvailability = (firstDay: Date, lastDay: Date) => {
    const availability: Record<string, DateAvailability> = {};
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: d >= todayDate,
      };
    }
    
    setDateAvailability(availability);
    
    // Set next available to today or first day of month if in future
    const nextAvail = todayDate >= firstDay ? todayDate.toISOString().split('T')[0] : firstDay.toISOString().split('T')[0];
    setNextAvailableDate(nextAvail);
  };

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToNextAvailable = () => {
    if (nextAvailableDate) {
      const nextDate = new Date(nextAvailableDate + 'T12:00:00');
      setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      onDateSelect(nextAvailableDate);
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Past dates are disabled
    if (normalizedDate < today) {
      return true;
    }

    // Check if date is unavailable (all slots disabled)
    const availability = dateAvailability[dateString];
    if (availability && availability.isAvailable === false) {
      return true;
    }

    // Check if date has max bookings
    if (availability && availability.bookingCount >= maxBookingsPerDay) {
      return true;
    }

    return false;
  };

  const getDateStatus = (date: Date): 'past' | 'full' | 'unavailable' | 'available' | 'selected' | 'today' => {
    const dateString = date.toISOString().split('T')[0];
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateString === selectedDate) {
      return 'selected';
    }
    
    if (normalizedDate < today) {
      return 'past';
    }

    if (normalizedDate.toDateString() === today.toDateString()) {
      return 'today';
    }

    const availability = dateAvailability[dateString];
    
    // Check if day is completely unavailable (all slots disabled)
    if (availability && availability.isAvailable === false) {
      return 'unavailable';
    }

    if (availability && availability.bookingCount >= maxBookingsPerDay) {
      return 'full';
    }

    return 'available';
  };

  const calendarDays = generateCalendarDays();
  const isPreviousMonthDisabled = currentMonth.getFullYear() === today.getFullYear() && 
                                   currentMonth.getMonth() <= today.getMonth();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          disabled={isPreviousMonthDisabled}
          className="p-2"
        >
          <i className="fas fa-chevron-left"></i>
        </Button>
        
        <h3 className="text-xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="p-2"
        >
          <i className="fas fa-chevron-right"></i>
        </Button>
      </div>

      {/* Next Available Button */}
      {nextAvailableDate && (
        <div className="text-center mb-4">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            onClick={goToNextAvailable}
          >
            <i className="fas fa-calendar-check mr-2"></i>
            Jump to Next Available
          </Button>
        </div>
      )}

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {loading ? (
          <div className="col-span-7 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269] mx-auto"></div>
            <p className="mt-2 text-gray-500 text-sm">Loading availability...</p>
          </div>
        ) : (
          calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const status = getDateStatus(date);
            const dateString = date.toISOString().split('T')[0];
            const isDisabled = isDateDisabled(date);
            const availability = dateAvailability[dateString];
            const bookingCount = availability?.bookingCount || 0;

            return (
              <button
                key={dateString}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onDateSelect(dateString)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium
                  transition-all duration-200 relative
                  ${status === 'selected' 
                    ? 'bg-[#AD6269] text-white ring-2 ring-[#AD6269] ring-offset-2' 
                    : status === 'today'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400 hover:bg-yellow-200'
                    : status === 'past' || status === 'full' || status === 'unavailable'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-900 hover:bg-[#AD6269]/10 hover:border-[#AD6269]'
                  }
                `}
              >
                <span className="text-base">{date.getDate()}</span>
                {status === 'today' && (
                  <span className="text-[10px] leading-none">Today</span>
                )}
                {status === 'full' && (
                  <span className="text-[10px] leading-none text-red-500">Full</span>
                )}
                {bookingCount > 0 && bookingCount < maxBookingsPerDay && status !== 'past' && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#AD6269] rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-400 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded relative">
            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
          </div>
          <span>Partial</span>
        </div>
      </div>
    </div>
  );
}
