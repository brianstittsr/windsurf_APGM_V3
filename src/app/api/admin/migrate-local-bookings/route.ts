import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * POST /api/admin/migrate-local-bookings
 * 
 * Migrates booking data from localStorage to Firestore.
 * This endpoint receives booking data from the client and saves it to Firestore.
 * 
 * Also marks past appointments as "skipped" for GHL sync.
 */

export async function POST(req: NextRequest) {
  try {
    const { localBookings } = await req.json();
    
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[]
    };
    
    if (localBookings && Array.isArray(localBookings)) {
      for (const booking of localBookings) {
        try {
          // Check if this booking already exists (by email + date + service)
          const existingQuery = await db.collection('bookings')
            .where('clientEmail', '==', booking.clientEmail)
            .where('date', '==', booking.date)
            .where('serviceName', '==', booking.serviceName)
            .get();
          
          if (!existingQuery.empty) {
            results.skipped++;
            continue;
          }
          
          // Create new booking
          const bookingData = {
            clientName: booking.clientName || 'Unknown',
            clientEmail: booking.clientEmail || '',
            clientPhone: booking.clientPhone || '',
            serviceName: booking.serviceName || 'Unknown Service',
            serviceId: booking.serviceId || '',
            date: booking.date,
            time: booking.time || booking.startTime || '10:00',
            endTime: booking.endTime || '',
            artistId: booking.artistId || 'default-artist',
            artistName: booking.artistName || 'Victoria Escobar',
            price: booking.price || 0,
            depositAmount: booking.depositAmount || 200,
            depositPaid: booking.depositPaid || false,
            status: booking.status || 'pending',
            notes: booking.notes || 'Migrated from localStorage',
            ghlContactId: null,
            ghlAppointmentId: null,
            ghlSyncError: null,
            migratedFromLocalStorage: true,
            migratedAt: new Date().toISOString(),
            createdAt: booking.createdAt || new Date(),
            updatedAt: new Date()
          };
          
          await db.collection('bookings').add(bookingData);
          results.migrated++;
        } catch (error) {
          results.errors.push(`Failed to migrate booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      ...results,
      message: `Migrated ${results.migrated} bookings, skipped ${results.skipped} duplicates`
    });
    
  } catch (error) {
    console.error('[Migrate] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/migrate-local-bookings
 * 
 * Marks all past appointments as "skipped" for GHL sync
 * so they don't show as failed.
 */
export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];
    let markedCount = 0;
    
    // Mark past bookings as skipped
    const bookingsSnapshot = await db.collection('bookings').get();
    for (const doc of bookingsSnapshot.docs) {
      const data = doc.data();
      const bookingDate = data.date || data.scheduledDate;
      
      // If past date and no GHL appointment ID and no skip reason
      if (bookingDate && bookingDate < today && !data.ghlAppointmentId && !data.ghlSkippedReason) {
        await db.collection('bookings').doc(doc.id).update({
          ghlSkippedReason: 'past_date',
          ghlSyncError: null // Clear error since it's intentionally skipped
        });
        markedCount++;
      }
    }
    
    // Mark past appointments as skipped
    const appointmentsSnapshot = await db.collection('appointments').get();
    for (const doc of appointmentsSnapshot.docs) {
      const data = doc.data();
      const apptDate = data.scheduledDate || data.date;
      
      // If past date and no GHL appointment ID and no skip reason
      if (apptDate && apptDate < today && !data.ghlAppointmentId && !data.ghlSkippedReason) {
        await db.collection('appointments').doc(doc.id).update({
          ghlSkippedReason: 'past_date',
          ghlSyncError: null // Clear error since it's intentionally skipped
        });
        markedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      markedAsPastDate: markedCount,
      message: `Marked ${markedCount} past appointments as skipped`
    });
    
  } catch (error) {
    console.error('[Mark Past] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to mark past appointments'
    }, { status: 500 });
  }
}
