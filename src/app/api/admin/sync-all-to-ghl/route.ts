import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * POST /api/admin/sync-all-to-ghl
 * 
 * Syncs ALL appointments from Firebase (both 'bookings' and 'appointments' collections) to GHL.
 * This ensures no appointments are lost and all are permanently stored in GHL.
 * 
 * Features:
 * - Syncs from both 'bookings' and 'appointments' collections
 * - Creates contacts in GHL if they don't exist
 * - Creates appointments in GHL calendar
 * - Updates Firebase records with GHL IDs
 * - Tracks sync failures for retry
 * - Returns detailed sync report
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

// Service Calendar ID (default)
const SERVICE_CALENDAR_ID = 'JvcOyRMMYoIPbH5s1Bg1';

interface SyncResult {
  id: string;
  collection: string;
  clientName: string;
  date: string;
  status: 'synced' | 'failed' | 'skipped';
  ghlContactId?: string;
  ghlAppointmentId?: string;
  error?: string;
}

async function getGHLCredentials() {
  // Try environment variables first
  let apiKey = process.env.GHL_API_KEY || '';
  let locationId = process.env.GHL_LOCATION_ID || '';
  
  // If not in env, try Firestore
  if (!apiKey || !locationId) {
    try {
      const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        apiKey = data?.apiKey || apiKey;
        locationId = data?.locationId || locationId;
      }
    } catch (e) {
      console.error('Error fetching GHL credentials from Firestore:', e);
    }
  }
  
  return { apiKey, locationId };
}

async function findOrCreateGHLContact(
  apiKey: string, 
  locationId: string, 
  clientName: string, 
  clientEmail: string, 
  clientPhone: string
): Promise<string | null> {
  try {
    // First, search for existing contact by email
    if (clientEmail) {
      const searchResponse = await fetch(
        `${GHL_API_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(clientEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': GHL_API_VERSION
          }
        }
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.contacts && searchData.contacts.length > 0) {
          console.log(`[GHL Sync] Found existing contact for ${clientEmail}: ${searchData.contacts[0].id}`);
          return searchData.contacts[0].id;
        }
      }
    }
    
    // If not found by email, try phone
    if (clientPhone) {
      const phoneSearch = await fetch(
        `${GHL_API_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(clientPhone)}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': GHL_API_VERSION
          }
        }
      );
      
      if (phoneSearch.ok) {
        const phoneData = await phoneSearch.json();
        if (phoneData.contacts && phoneData.contacts.length > 0) {
          console.log(`[GHL Sync] Found existing contact by phone for ${clientName}: ${phoneData.contacts[0].id}`);
          return phoneData.contacts[0].id;
        }
      }
    }
    
    // Create new contact
    const nameParts = clientName.split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const createResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId,
        firstName,
        lastName,
        email: clientEmail || undefined,
        phone: clientPhone || undefined,
        source: 'Website Sync',
        tags: ['website-booking', 'synced-from-firebase']
      })
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      const contactId = createData.contact?.id || createData.id;
      console.log(`[GHL Sync] Created new contact for ${clientName}: ${contactId}`);
      return contactId;
    } else {
      const errorText = await createResponse.text();
      console.error(`[GHL Sync] Failed to create contact for ${clientName}:`, errorText);
      return null;
    }
  } catch (error) {
    console.error(`[GHL Sync] Error finding/creating contact for ${clientName}:`, error);
    return null;
  }
}

async function createGHLAppointment(
  apiKey: string,
  locationId: string,
  contactId: string,
  appointment: any
): Promise<string | null> {
  try {
    // Parse date and time
    const date = appointment.date || appointment.scheduledDate;
    const time = appointment.time || appointment.scheduledTime || '10:00';
    
    if (!date) {
      console.error('[GHL Sync] No date found for appointment');
      return null;
    }
    
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (3 * 60 * 60 * 1000)); // 3 hours
    
    const serviceName = appointment.serviceName || 'Appointment';
    const clientName = appointment.clientName || 'Unknown Client';
    const price = appointment.price || appointment.totalAmount || 0;
    const notes = appointment.notes || appointment.specialRequests || '';
    
    const appointmentPayload = {
      locationId,
      contactId,
      calendarId: SERVICE_CALENDAR_ID,
      title: `${serviceName} - ${clientName}`,
      appointmentStatus: appointment.status === 'confirmed' ? 'confirmed' : 'new',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: `Service: ${serviceName}\nPrice: $${price}\n${notes}`.trim(),
      toNotify: false // Don't send notifications for historical syncs
    };
    
    const response = await fetch(`${GHL_API_BASE}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      const appointmentId = data.id || data.event?.id;
      console.log(`[GHL Sync] Created appointment for ${clientName} on ${date}: ${appointmentId}`);
      return appointmentId;
    } else {
      const errorText = await response.text();
      console.error(`[GHL Sync] Failed to create appointment:`, errorText);
      return null;
    }
  } catch (error) {
    console.error('[GHL Sync] Error creating appointment:', error);
    return null;
  }
}

async function syncAppointmentToGHL(
  apiKey: string,
  locationId: string,
  appointment: any,
  docId: string,
  collectionName: string
): Promise<SyncResult> {
  const clientName = appointment.clientName || 'Unknown Client';
  const date = appointment.date || appointment.scheduledDate || 'Unknown';
  
  // Skip if already synced
  if (appointment.ghlAppointmentId) {
    return {
      id: docId,
      collection: collectionName,
      clientName,
      date,
      status: 'skipped',
      ghlAppointmentId: appointment.ghlAppointmentId,
      ghlContactId: appointment.ghlContactId
    };
  }
  
  try {
    // Find or create contact
    const clientEmail = appointment.clientEmail || '';
    const clientPhone = appointment.clientPhone || '';
    
    let contactId = appointment.ghlContactId;
    if (!contactId) {
      contactId = await findOrCreateGHLContact(apiKey, locationId, clientName, clientEmail, clientPhone);
    }
    
    if (!contactId) {
      return {
        id: docId,
        collection: collectionName,
        clientName,
        date,
        status: 'failed',
        error: 'Failed to create/find GHL contact'
      };
    }
    
    // Create appointment in GHL
    const appointmentId = await createGHLAppointment(apiKey, locationId, contactId, appointment);
    
    if (!appointmentId) {
      // Still update contact ID even if appointment fails
      await db.collection(collectionName).doc(docId).update({
        ghlContactId: contactId,
        ghlSyncAttempted: new Date().toISOString(),
        ghlSyncError: 'Failed to create appointment'
      });
      
      return {
        id: docId,
        collection: collectionName,
        clientName,
        date,
        status: 'failed',
        ghlContactId: contactId,
        error: 'Failed to create GHL appointment'
      };
    }
    
    // Update Firebase with GHL IDs
    await db.collection(collectionName).doc(docId).update({
      ghlContactId: contactId,
      ghlAppointmentId: appointmentId,
      lastSyncedAt: new Date().toISOString(),
      ghlSyncError: null
    });
    
    return {
      id: docId,
      collection: collectionName,
      clientName,
      date,
      status: 'synced',
      ghlContactId: contactId,
      ghlAppointmentId: appointmentId
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log the failure in Firebase for retry
    try {
      await db.collection(collectionName).doc(docId).update({
        ghlSyncAttempted: new Date().toISOString(),
        ghlSyncError: errorMessage
      });
    } catch (e) {
      console.error('[GHL Sync] Failed to update sync error:', e);
    }
    
    return {
      id: docId,
      collection: collectionName,
      clientName,
      date,
      status: 'failed',
      error: errorMessage
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { forceResync } = await req.json().catch(() => ({ forceResync: false }));
    
    const { apiKey, locationId } = await getGHLCredentials();
    
    if (!apiKey || !locationId) {
      return NextResponse.json({
        error: 'GHL credentials not configured',
        message: 'Please set GHL_API_KEY and GHL_LOCATION_ID environment variables or configure in dashboard'
      }, { status: 503 });
    }
    
    const results: SyncResult[] = [];
    
    // Sync from 'bookings' collection
    console.log('[GHL Sync] Fetching bookings collection...');
    const bookingsSnapshot = await db.collection('bookings').get();
    console.log(`[GHL Sync] Found ${bookingsSnapshot.size} bookings`);
    
    for (const doc of bookingsSnapshot.docs) {
      const data = doc.data();
      
      // Skip if already synced (unless forceResync)
      if (data.ghlAppointmentId && !forceResync) {
        results.push({
          id: doc.id,
          collection: 'bookings',
          clientName: data.clientName || 'Unknown',
          date: data.date || 'Unknown',
          status: 'skipped',
          ghlAppointmentId: data.ghlAppointmentId,
          ghlContactId: data.ghlContactId
        });
        continue;
      }
      
      const result = await syncAppointmentToGHL(apiKey, locationId, data, doc.id, 'bookings');
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Sync from 'appointments' collection (legacy)
    console.log('[GHL Sync] Fetching appointments collection...');
    const appointmentsSnapshot = await db.collection('appointments').get();
    console.log(`[GHL Sync] Found ${appointmentsSnapshot.size} appointments`);
    
    for (const doc of appointmentsSnapshot.docs) {
      const data = doc.data();
      
      // Skip if already synced (unless forceResync)
      if (data.ghlAppointmentId && !forceResync) {
        results.push({
          id: doc.id,
          collection: 'appointments',
          clientName: data.clientName || 'Unknown',
          date: data.scheduledDate || data.date || 'Unknown',
          status: 'skipped',
          ghlAppointmentId: data.ghlAppointmentId,
          ghlContactId: data.ghlContactId
        });
        continue;
      }
      
      const result = await syncAppointmentToGHL(apiKey, locationId, data, doc.id, 'appointments');
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Calculate summary
    const synced = results.filter(r => r.status === 'synced').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    
    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        synced,
        failed,
        skipped
      },
      results,
      message: `Sync complete: ${synced} synced, ${failed} failed, ${skipped} already synced`
    });
    
  } catch (error) {
    console.error('[GHL Sync] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
      success: false
    }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET(req: NextRequest) {
  try {
    // Count unsynced appointments
    const bookingsSnapshot = await db.collection('bookings').get();
    const appointmentsSnapshot = await db.collection('appointments').get();
    
    let unsyncedBookings = 0;
    let syncedBookings = 0;
    let failedBookings = 0;
    let skippedBookings = 0;
    
    bookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.ghlAppointmentId) {
        syncedBookings++;
      } else if (data.ghlSkippedReason === 'past_date') {
        skippedBookings++;
        syncedBookings++; // Count skipped as "synced" for progress bar
      } else if (data.ghlSyncError) {
        failedBookings++;
      } else {
        unsyncedBookings++;
      }
    });
    
    let unsyncedAppointments = 0;
    let syncedAppointments = 0;
    let failedAppointments = 0;
    let skippedAppointments = 0;
    
    appointmentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.ghlAppointmentId) {
        syncedAppointments++;
      } else if (data.ghlSkippedReason === 'past_date') {
        skippedAppointments++;
        syncedAppointments++; // Count skipped as "synced" for progress bar
      } else if (data.ghlSyncError) {
        failedAppointments++;
      } else {
        unsyncedAppointments++;
      }
    });
    
    return NextResponse.json({
      bookings: {
        total: bookingsSnapshot.size,
        synced: syncedBookings,
        unsynced: unsyncedBookings,
        failed: failedBookings,
        skipped: skippedBookings
      },
      appointments: {
        total: appointmentsSnapshot.size,
        synced: syncedAppointments,
        unsynced: unsyncedAppointments,
        failed: failedAppointments,
        skipped: skippedAppointments
      },
      totalUnsynced: unsyncedBookings + unsyncedAppointments,
      totalFailed: failedBookings + failedAppointments,
      totalSkipped: skippedBookings + skippedAppointments
    });
    
  } catch (error) {
    console.error('[GHL Sync Status] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to get sync status'
    }, { status: 500 });
  }
}
