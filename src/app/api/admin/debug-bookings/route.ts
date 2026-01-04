import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/admin/debug-bookings
 * 
 * Debug endpoint to see all bookings
 */
export async function GET(req: NextRequest) {
  try {
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.get();
    
    const bookings: any[] = [];
    
    snapshot.docs.forEach((doc) => {
      bookings.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    return NextResponse.json({
      count: bookings.length,
      bookings
    });
    
  } catch (error) {
    console.error('[Admin] Error fetching bookings:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
        success: false
      },
      { status: 500 }
    );
  }
}
