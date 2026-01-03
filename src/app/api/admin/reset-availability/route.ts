import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * POST /api/admin/reset-availability
 * 
 * Resets artist availability to match the provided configuration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { artistId, availability } = body;
    
    if (!artistId) {
      return NextResponse.json(
        { error: 'artistId is required' },
        { status: 400 }
      );
    }
    
    console.log('[Admin] Resetting availability for artist:', artistId);
    console.log('[Admin] New availability:', JSON.stringify(availability, null, 2));
    
    // Save the new availability
    const docRef = db.collection('artist-availability').doc(artistId);
    await docRef.set({
      availability: availability || {},
      breakTime: 15,
      updatedAt: new Date()
    });
    
    console.log('[Admin] Availability reset successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Availability reset successfully',
      artistId,
      days: Object.keys(availability || {})
    });
    
  } catch (error) {
    console.error('[Admin] Error resetting availability:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to reset availability',
        success: false
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reset-availability
 * 
 * Clears all artist availability data
 */
export async function DELETE(req: NextRequest) {
  try {
    console.log('[Admin] Clearing all artist availability...');
    
    const availabilityRef = db.collection('artist-availability');
    const snapshot = await availabilityRef.get();
    
    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No availability data to delete',
        deleted: 0
      });
    }
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    
    console.log(`[Admin] Deleted ${count} availability documents`);
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${count} availability documents`,
      deleted: count
    });
    
  } catch (error) {
    console.error('[Admin] Error clearing availability:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to clear availability',
        success: false
      },
      { status: 500 }
    );
  }
}
