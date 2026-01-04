import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/admin/failed-syncs
 * 
 * Fetches all appointments that failed to sync with GHL.
 * Returns detailed information about each failed appointment.
 */
export async function GET(req: NextRequest) {
  try {
    const failed: any[] = [];
    
    // Check bookings collection for failed syncs
    const bookingsSnapshot = await db.collection('bookings').get();
    
    for (const doc of bookingsSnapshot.docs) {
      const data = doc.data();
      
      // Skip if marked as skipped (past date)
      if (data.ghlSkippedReason === 'past_date') continue;
      
      // Include if has sync error OR no ghlAppointmentId (unsynced)
      if (data.ghlSyncError || !data.ghlAppointmentId) {
        failed.push({
          id: doc.id,
          collection: 'bookings',
          clientName: data.clientName || 'Unknown',
          clientEmail: data.clientEmail || '',
          clientPhone: data.clientPhone || '',
          serviceName: data.serviceName || '',
          date: data.date || 'Unknown',
          time: data.time || '',
          error: data.ghlSyncError || 'Not synced to GHL',
          retryCount: data.ghlRetryCount || 0,
          lastRetry: data.ghlLastRetry || null,
          ghlContactId: data.ghlContactId || null,
          skippedReason: data.ghlSkippedReason || null
        });
      }
    }
    
    // Check appointments collection for failed syncs
    const appointmentsSnapshot = await db.collection('appointments').get();
    
    for (const doc of appointmentsSnapshot.docs) {
      const data = doc.data();
      
      // Skip if marked as skipped (past date)
      if (data.ghlSkippedReason === 'past_date') continue;
      
      // Include if has sync error OR no ghlAppointmentId (unsynced)
      if (data.ghlSyncError || !data.ghlAppointmentId) {
        failed.push({
          id: doc.id,
          collection: 'appointments',
          clientName: data.clientName || 'Unknown',
          clientEmail: data.clientEmail || '',
          clientPhone: data.clientPhone || '',
          serviceName: data.serviceName || '',
          date: data.scheduledDate || data.date || 'Unknown',
          time: data.scheduledTime || data.time || '',
          error: data.ghlSyncError || 'Not synced to GHL',
          retryCount: data.ghlRetryCount || 0,
          lastRetry: data.ghlLastRetry || null,
          ghlContactId: data.ghlContactId || null,
          skippedReason: data.ghlSkippedReason || null
        });
      }
    }
    
    // Sort by date (most recent first)
    failed.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return NextResponse.json({
      failed,
      count: failed.length,
      bookingsCount: failed.filter(f => f.collection === 'bookings').length,
      appointmentsCount: failed.filter(f => f.collection === 'appointments').length
    });
    
  } catch (error) {
    console.error('[Failed Syncs] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch failed syncs',
      failed: []
    }, { status: 500 });
  }
}
