import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getDb } from '../../../../lib/firebase';

export async function POST(req: NextRequest) {
  try {
    // Fetch all bookings from Firestore
    const db = getDb();
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no bookings, return early with success
    if (bookings.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        failed: 0,
        total: 0,
        message: 'No bookings to sync'
      });
    }

    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Sync each booking with GHL
    for (const booking of bookings) {
      try {
        const response = await fetch(`${req.nextUrl.origin}/api/calendar/sync-ghl`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            booking,
            action: 'update'
          })
        });

        if (response.ok) {
          syncedCount++;
        } else {
          failedCount++;
          const error = await response.json();
          errors.push(`Booking ${booking.id}: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        failedCount++;
        errors.push(`Booking ${booking.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      failed: failedCount,
      total: bookings.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully synced ${syncedCount} out of ${bookings.length} bookings`
    });
  } catch (error) {
    console.error('Error syncing all bookings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync bookings with GHL', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
