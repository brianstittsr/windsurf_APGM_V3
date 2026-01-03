import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * DELETE /api/admin/cleanup-availability
 * 
 * Deletes all artist availability documents except the specified one
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keepId = searchParams.get('keep') || 'victoria';
    
    console.log('[Admin] Cleaning up availability, keeping:', keepId);
    
    const availabilityRef = db.collection('artist-availability');
    const snapshot = await availabilityRef.get();
    
    const batch = db.batch();
    let deleteCount = 0;
    const deleted: string[] = [];
    
    snapshot.docs.forEach((doc) => {
      if (doc.id !== keepId) {
        batch.delete(doc.ref);
        deleteCount++;
        deleted.push(doc.id);
      }
    });
    
    if (deleteCount > 0) {
      await batch.commit();
    }
    
    console.log(`[Admin] Deleted ${deleteCount} documents:`, deleted);
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteCount} documents, kept ${keepId}`,
      deleted,
      kept: keepId
    });
    
  } catch (error) {
    console.error('[Admin] Error cleaning up availability:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to cleanup availability',
        success: false
      },
      { status: 500 }
    );
  }
}
