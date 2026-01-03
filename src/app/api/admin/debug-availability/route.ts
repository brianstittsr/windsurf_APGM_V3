import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/admin/debug-availability
 * 
 * Debug endpoint to see all artist availability documents
 */
export async function GET(req: NextRequest) {
  try {
    const availabilityRef = db.collection('artist-availability');
    const snapshot = await availabilityRef.get();
    
    const documents: any[] = [];
    
    snapshot.docs.forEach((doc) => {
      documents.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    return NextResponse.json({
      count: documents.length,
      documents
    });
    
  } catch (error) {
    console.error('[Admin] Error fetching availability:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch availability',
        success: false
      },
      { status: 500 }
    );
  }
}
