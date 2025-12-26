'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface TimeSlot {
  time: string;
  available: boolean;
  artistId: string;
  artistName: string;
  calendarName?: string;
}

interface TimeBlock {
  startTime: string;
  endTime: string;
  displayTime: string;
  available: boolean;
  artistId: string;
  artistName: string;
  blockedSlots: string[];
}

interface TimeBlockSelectorProps {
  date: string;
  timeSlots: TimeSlot[];
  selectedBlock: TimeBlock | null;
  onSelectBlock: (block: TimeBlock) => void;
  serviceDuration?: number; // in hours, default 3
  loading?: boolean;
  error?: string | null;
}

// Convert 24-hour time to 12-hour format
function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Add hours to a time string
function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newHours = h + hours;
  return `${newHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Check if time1 is within hours of time2
function isWithinHours(time1: string, time2: string, hours: number): boolean {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  return Math.abs(minutes1 - minutes2) < hours * 60;
}

export default function TimeBlockSelector({
  date,
  timeSlots,
  selectedBlock,
  onSelectBlock,
  serviceDuration = 3,
  loading = false,
  error = null
}: TimeBlockSelectorProps) {
  
  // Group time slots into blocks based on service duration
  const timeBlocks = useMemo(() => {
    if (!timeSlots || timeSlots.length === 0) return [];
    
    // Filter available slots and exclude Admin
    const availableSlots = timeSlots.filter(
      slot => slot.available && 
      slot.artistName !== 'Admin' && 
      (slot.calendarName === 'Service Calendar' || !slot.calendarName)
    );
    
    if (availableSlots.length === 0) return [];
    
    // Sort by time
    const sortedSlots = [...availableSlots].sort((a, b) => a.time.localeCompare(b.time));
    
    // Create blocks - each block represents a start time with duration
    const blocks: TimeBlock[] = [];
    const usedTimes = new Set<string>();
    
    for (const slot of sortedSlots) {
      // Skip if this time is already part of another block
      if (usedTimes.has(slot.time)) continue;
      
      const endTime = addHours(slot.time, serviceDuration);
      const blockedSlots: string[] = [];
      
      // Find all slots that would be blocked by this selection
      for (const otherSlot of sortedSlots) {
        if (isWithinHours(otherSlot.time, slot.time, serviceDuration) && otherSlot.time >= slot.time) {
          blockedSlots.push(otherSlot.time);
        }
      }
      
      blocks.push({
        startTime: slot.time,
        endTime: endTime,
        displayTime: `${formatTimeTo12Hour(slot.time)} - ${formatTimeTo12Hour(endTime)}`,
        available: true,
        artistId: slot.artistId,
        artistName: slot.artistName,
        blockedSlots
      });
    }
    
    return blocks;
  }, [timeSlots, serviceDuration]);

  // Check if a block is disabled (overlaps with selected block)
  const isBlockDisabled = (block: TimeBlock): boolean => {
    if (!selectedBlock) return false;
    
    // Check if this block's time overlaps with selected block's blocked times
    return selectedBlock.blockedSlots.includes(block.startTime) && 
           block.startTime !== selectedBlock.startTime;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD6269] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading available time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        Error loading time slots: {error}
      </div>
    );
  }

  if (timeBlocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-calendar-times text-3xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Available Times</h3>
        <p className="text-gray-500">There are no available time slots for this date.</p>
        <p className="text-gray-400 text-sm mt-2">Please select a different date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Select Your Appointment Time
        </h3>
        <p className="text-gray-500">
          Each appointment is a {serviceDuration}-hour session
        </p>
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-700">
          <i className="fas fa-info-circle"></i>
          <span>Selecting a time will block the next {serviceDuration} hours</span>
        </div>
      </div>

      {/* Time Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeBlocks.map((block, index) => {
          const isSelected = selectedBlock?.startTime === block.startTime;
          const isDisabled = isBlockDisabled(block);
          
          return (
            <button
              key={`${block.startTime}-${index}`}
              onClick={() => !isDisabled && onSelectBlock(block)}
              disabled={isDisabled}
              className={`
                relative p-5 rounded-xl border-2 transition-all duration-300 text-left
                ${isSelected 
                  ? 'border-[#AD6269] bg-[#AD6269] text-white shadow-lg scale-[1.02]' 
                  : isDisabled
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  : 'border-gray-200 bg-white hover:border-[#AD6269] hover:shadow-md hover:-translate-y-1'
                }
              `}
            >
              {/* Time Block Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                isSelected ? 'bg-white/20' : isDisabled ? 'bg-gray-200' : 'bg-[#AD6269]/10'
              }`}>
                <i className={`fas fa-clock text-xl ${
                  isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-[#AD6269]'
                }`}></i>
              </div>
              
              {/* Time Display */}
              <div className="mb-2">
                <span className={`text-lg font-bold ${isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                  {block.displayTime}
                </span>
              </div>
              
              {/* Duration Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : isDisabled 
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <i className="fas fa-hourglass-half"></i>
                {serviceDuration} hour session
              </div>
              
              {/* Artist Info */}
              <div className={`mt-3 pt-3 border-t ${isSelected ? 'border-white/20' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white/20' : 'bg-[#AD6269]/10'
                  }`}>
                    <i className={`fas fa-user text-sm ${isSelected ? 'text-white' : 'text-[#AD6269]'}`}></i>
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {block.artistName || 'Victoria'}
                  </span>
                </div>
              </div>
              
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-[#AD6269] text-sm"></i>
                  </div>
                </div>
              )}
              
              {/* Blocked Indicator */}
              {isDisabled && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <i className="fas fa-ban text-gray-500 text-sm"></i>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedBlock && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-lg"></i>
            </div>
            <div>
              <p className="font-semibold text-green-800">Time Selected</p>
              <p className="text-green-600 text-sm">
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedBlock.displayTime}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { TimeBlock, TimeSlot };
