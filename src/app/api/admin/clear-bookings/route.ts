import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * DELETE /api/admin/clear-bookings
 * 
 * Deletes all bookings from Firestore
 * WARNING: This is a destructive operation!
 */
export async function DELETE(req: NextRequest) {
  try {
    console.log('[Admin] Clearing all bookings from Firestore...');
    
    // Get all bookings
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.get();
    
    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No bookings to delete',
        deleted: 0
      });
    }
    
    // Delete all bookings in batches
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    
    console.log(`[Admin] Deleted ${count} bookings from Firestore`);
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${count} bookings`,
      deleted: count
    });
    
  } catch (error) {
    console.error('[Admin] Error clearing bookings:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to clear bookings',
        success: false
      },
      { status: 500 }
    );
  }
}
