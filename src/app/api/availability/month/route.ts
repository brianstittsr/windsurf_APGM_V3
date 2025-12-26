import { NextRequest, NextResponse } from 'next/server';

// No Firebase Admin dependency to avoid Turbopack symlink issues on Windows

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

    // Generate all dates in range with default availability
    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: d >= today,
      };
    }

    // Find next available date (before GHL check for fast response)
    let nextAvailable: string | null = null;
    const sortedDates = Object.keys(availability).sort();
    for (const dateStr of sortedDates) {
      const dateObj = new Date(dateStr + 'T00:00:00');
      if (dateObj >= today && availability[dateStr].isAvailable) {
        nextAvailable = dateStr;
        break;
      }
    }

    // Return default availability immediately
    // The MonthlyCalendar only needs to know which dates are in the past
    // Actual time slot availability is checked by the TimeSlotSelector via /api/availability/ghl
    // This avoids the slow GHL events API call that was causing timeouts
    return NextResponse.json({
      availability,
      nextAvailable,
      startDate,
      endDate,
      source: 'default'
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
