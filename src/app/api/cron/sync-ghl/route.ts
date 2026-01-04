import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/cron/sync-ghl
 * 
 * Cron job endpoint to automatically retry failed GHL syncs.
 * This should be called periodically (e.g., every 15 minutes) by:
 * - Vercel Cron Jobs
 * - External cron service (e.g., cron-job.org)
 * - Or client-side interval in the dashboard
 * 
 * Security: Validates CRON_SECRET header for external calls
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const SERVICE_CALENDAR_ID = 'JvcOyRMMYoIPbH5s1Bg1';

async function getGHLCredentials() {
  let apiKey = process.env.GHL_API_KEY || '';
  let locationId = process.env.GHL_LOCATION_ID || '';
  
  if (!apiKey || !locationId) {
    try {
      const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        apiKey = data?.apiKey || apiKey;
        locationId = data?.locationId || locationId;
      }
    } catch (e) {
      console.error('[Cron] Error fetching GHL credentials:', e);
    }
  }
  
  return { apiKey, locationId };
}

async function findOrCreateContact(apiKey: string, locationId: string, appointment: any): Promise<string | null> {
  const clientEmail = appointment.clientEmail || '';
  const clientPhone = appointment.clientPhone || '';
  const clientName = appointment.clientName || 'Unknown Client';
  
  try {
    // Search by email first
    if (clientEmail) {
      const response = await fetch(
        `${GHL_API_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(clientEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': GHL_API_VERSION
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.contacts?.length > 0) {
          return data.contacts[0].id;
        }
      }
    }
    
    // Create new contact
    const nameParts = clientName.split(' ');
    const createResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId,
        firstName: nameParts[0] || 'Unknown',
        lastName: nameParts.slice(1).join(' ') || '',
        email: clientEmail || undefined,
        phone: clientPhone || undefined,
        source: 'Website Auto-Sync',
        tags: ['website-booking', 'auto-sync']
      })
    });
    
    if (createResponse.ok) {
      const data = await createResponse.json();
      return data.contact?.id || data.id;
    }
    
    return null;
  } catch (error) {
    console.error('[Cron] Error with contact:', error);
    return null;
  }
}

async function createAppointment(apiKey: string, locationId: string, contactId: string, appointment: any): Promise<string | null> {
  try {
    const date = appointment.date || appointment.scheduledDate;
    const time = appointment.time || appointment.scheduledTime || '10:00';
    
    if (!date) return null;
    
    // Skip past dates - GHL doesn't allow creating appointments in the past
    const appointmentDate = new Date(`${date}T${time}:00`);
    const now = new Date();
    if (appointmentDate < now) {
      console.log(`[Cron] Skipping past appointment: ${date}`);
      return 'SKIPPED_PAST_DATE';
    }
    
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (3 * 60 * 60 * 1000));
    
    const response = await fetch(`${GHL_API_BASE}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId,
        contactId,
        calendarId: SERVICE_CALENDAR_ID,
        title: `${appointment.serviceName || 'Appointment'} - ${appointment.clientName || 'Client'}`,
        appointmentStatus: appointment.status === 'confirmed' ? 'confirmed' : 'new',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: `Service: ${appointment.serviceName}\nPrice: $${appointment.price || appointment.totalAmount || 0}`,
        toNotify: true // Send notifications for new syncs
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.id || data.event?.id;
    }
    
    const errorText = await response.text();
    console.error('[Cron] GHL appointment error:', errorText);
    return null;
  } catch (error) {
    console.error('[Cron] Error creating appointment:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const cronSecret = req.headers.get('x-cron-secret') || req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, validate it (skip validation if not set for development)
    if (expectedSecret && cronSecret !== expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      // Allow internal calls without secret (from dashboard)
      const referer = req.headers.get('referer') || '';
      if (!referer.includes('localhost') && !referer.includes('aprettygirlmatter.com')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const { apiKey, locationId } = await getGHLCredentials();
    
    if (!apiKey || !locationId) {
      return NextResponse.json({ 
        error: 'GHL credentials not configured',
        synced: 0,
        failed: 0,
        skipped: 0
      }, { status: 503 });
    }
    
    const results = {
      synced: 0,
      failed: 0,
      skipped: 0,
      skippedPastDates: 0,
      details: [] as any[]
    };
    
    // Find unsynced appointments in both collections
    const collections = ['bookings', 'appointments'];
    
    for (const collectionName of collections) {
      // Get appointments without ghlAppointmentId (unsynced)
      const snapshot = await db.collection(collectionName).get();
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Skip if already synced
        if (data.ghlAppointmentId) {
          results.skipped++;
          continue;
        }
        
        // Skip if too many retry attempts (max 5)
        if ((data.ghlRetryCount || 0) >= 5) {
          results.skipped++;
          continue;
        }
        
        // Try to sync
        let contactId = data.ghlContactId;
        if (!contactId) {
          contactId = await findOrCreateContact(apiKey, locationId, data);
        }
        
        if (!contactId) {
          results.failed++;
          await db.collection(collectionName).doc(doc.id).update({
            ghlSyncError: 'Failed to create contact',
            ghlRetryCount: (data.ghlRetryCount || 0) + 1,
            ghlLastRetry: new Date().toISOString()
          });
          continue;
        }
        
        const appointmentId = await createAppointment(apiKey, locationId, contactId, data);
        
        if (appointmentId === 'SKIPPED_PAST_DATE') {
          results.skippedPastDates++;
          await db.collection(collectionName).doc(doc.id).update({
            ghlContactId: contactId,
            ghlSyncError: 'Past date - cannot sync to GHL calendar',
            ghlSkippedReason: 'past_date'
          });
          continue;
        }
        
        if (appointmentId) {
          results.synced++;
          await db.collection(collectionName).doc(doc.id).update({
            ghlContactId: contactId,
            ghlAppointmentId: appointmentId,
            lastSyncedAt: new Date().toISOString(),
            ghlSyncError: null
          });
          results.details.push({
            id: doc.id,
            collection: collectionName,
            clientName: data.clientName,
            status: 'synced'
          });
        } else {
          results.failed++;
          await db.collection(collectionName).doc(doc.id).update({
            ghlContactId: contactId,
            ghlSyncError: 'Failed to create appointment',
            ghlRetryCount: (data.ghlRetryCount || 0) + 1,
            ghlLastRetry: new Date().toISOString()
          });
        }
        
        // Rate limiting - small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`[Cron] Sync complete: ${results.synced} synced, ${results.failed} failed, ${results.skipped} skipped, ${results.skippedPastDates} past dates`);
    
    return NextResponse.json({
      success: true,
      ...results,
      message: `Synced: ${results.synced}, Failed: ${results.failed}, Skipped: ${results.skipped}, Past dates: ${results.skippedPastDates}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
      synced: 0,
      failed: 0
    }, { status: 500 });
  }
}
