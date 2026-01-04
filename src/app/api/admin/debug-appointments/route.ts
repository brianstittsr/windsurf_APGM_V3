import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/admin/debug-appointments
 * 
 * Debug endpoint to see all appointments (legacy collection)
 */
export async function GET(req: NextRequest) {
  try {
    const appointmentsRef = db.collection('appointments');
    const snapshot = await appointmentsRef.get();
    
    const appointments: any[] = [];
    
    snapshot.docs.forEach((doc) => {
      appointments.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    return NextResponse.json({
      count: appointments.length,
      appointments
    });
    
  } catch (error) {
    console.error('[Admin] Error fetching appointments:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch appointments',
        success: false
      },
      { status: 500 }
    );
  }
}
