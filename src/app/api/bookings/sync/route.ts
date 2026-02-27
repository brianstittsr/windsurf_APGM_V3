import { NextResponse } from 'next/server';
import { calendarProviderService } from '@/services/calendarProviderService';

export async function POST(request: Request) {
  try {
    const { bookingId, bookingData } = await request.json();

    if (!bookingId || !bookingData) {
      return NextResponse.json(
        { error: 'Missing booking data' },
        { status: 400 }
      );
    }

    const settings = await calendarProviderService.getSettings();
    const results: any = {
      bookingId,
      synced: [],
      errors: []
    };

    // Sync to GoHighLevel if enabled
    if (settings.enableGHL) {
      try {
        const ghlResponse = await fetch(`${request.url.replace('/bookings/sync', '/calendar/sync-ghl')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, bookingData })
        });

        if (ghlResponse.ok) {
          results.synced.push('gohighlevel');
        } else {
          const error = await ghlResponse.json();
          results.errors.push({ provider: 'gohighlevel', error: error.error });
        }
      } catch (error) {
        results.errors.push({ provider: 'gohighlevel', error: 'Sync failed' });
      }
    }

    // Sync to Google Calendar if enabled
    if (settings.enableGoogle) {
      try {
        const googleResponse = await fetch(`${request.url.replace('/bookings/sync', '/calendar/sync-google')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, bookingData })
        });

        if (googleResponse.ok) {
          results.synced.push('google');
        } else {
          const error = await googleResponse.json();
          results.errors.push({ provider: 'google', error: error.error });
        }
      } catch (error) {
        results.errors.push({ provider: 'google', error: 'Sync failed' });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Booking sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync booking' },
      { status: 500 }
    );
  }
}
