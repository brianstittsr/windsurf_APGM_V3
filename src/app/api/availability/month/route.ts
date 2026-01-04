import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';

// Day name mapping
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * GET /api/availability/month
 * 
 * Fetch booking counts for each day in a date range
 * Query params: startDate, endDate (YYYY-MM-DD format)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch artist availability from Firestore
    let artistAvailability: any = null;
    let dateSpecificHours: any[] = [];
    try {
      const availabilitySnapshot = await adminDb.collection('artist-availability').get();
      if (!availabilitySnapshot.empty) {
        // Use the first artist's availability
        const doc = availabilitySnapshot.docs[0];
        const data = doc.data();
        artistAvailability = data?.availability || {};
        dateSpecificHours = data?.dateSpecificHours || [];
      }
    } catch (error) {
      console.error('[Month API] Error fetching artist availability:', error);
    }

    // Generate all dates in range with availability based on artist settings
    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayOfWeek = DAY_NAMES[d.getDay()];
      
      // Check if this day is available based on artist settings
      let isDayAvailable = d >= today;
      
      if (isDayAvailable) {
        // First, check for date-specific overrides
        const dateOverride = dateSpecificHours.find((override: any) => override.date === dateString);
        
        if (dateOverride) {
          // Date has a specific override
          if (dateOverride.type === 'blocked') {
            // Check if ALL slots are blocked
            const allBlocked = dateOverride.timeSlots.morning && 
                              dateOverride.timeSlots.afternoon && 
                              dateOverride.timeSlots.evening;
            isDayAvailable = !allBlocked;
          } else if (dateOverride.type === 'available') {
            // Check if at least one slot is available
            isDayAvailable = dateOverride.timeSlots.morning || 
                            dateOverride.timeSlots.afternoon || 
                            dateOverride.timeSlots.evening;
          }
        } else if (artistAvailability) {
          // No date-specific override, use weekly schedule
          const dayConfig = artistAvailability[dayOfWeek];
          
          if (dayConfig && dayConfig.enabled) {
            // Day is configured - check if at least one time slot is enabled
            const timeSlots = dayConfig.timeSlots || { morning: true, afternoon: true, evening: true };
            const hasAnySlotEnabled = timeSlots.morning === true || 
                                       timeSlots.afternoon === true || 
                                       timeSlots.evening === true;
            isDayAvailable = hasAnySlotEnabled;
          } else if (artistAvailability && Object.keys(artistAvailability).length > 0) {
            // Artist has some days configured but not this one - day is unavailable
            isDayAvailable = false;
          }
        }
      }
      
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: isDayAvailable,
      };
    }

    // Find next available date
    let nextAvailable: string | null = null;
    const sortedDates = Object.keys(availability).sort();
    for (const dateStr of sortedDates) {
      const dateObj = new Date(dateStr + 'T12:00:00');
      if (dateObj >= today && availability[dateStr].isAvailable) {
        nextAvailable = dateStr;
        break;
      }
    }

    return NextResponse.json({
      availability,
      nextAvailable,
      startDate,
      endDate,
      source: 'firestore'
    });

  } catch (error) {
    console.error('Error fetching month availability:', error);
    
    // Return empty availability on error so calendar still renders
    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate default availability for current month
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: d >= today,
      };
    }
    
    return NextResponse.json({
      availability,
      nextAvailable: today.toISOString().split('T')[0],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  }
}
