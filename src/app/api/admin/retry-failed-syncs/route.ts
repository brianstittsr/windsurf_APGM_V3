import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * POST /api/admin/retry-failed-syncs
 * 
 * Retries syncing appointments that previously failed to sync with GHL.
 * This is a failover mechanism to ensure no appointments are lost.
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
      console.error('Error fetching GHL credentials:', e);
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
        source: 'Website Retry Sync',
        tags: ['website-booking', 'retry-sync']
      })
    });
    
    if (createResponse.ok) {
      const data = await createResponse.json();
      return data.contact?.id || data.id;
    }
    
    return null;
  } catch (error) {
    console.error('[Retry Sync] Error with contact:', error);
    return null;
  }
}

async function createAppointment(apiKey: string, locationId: string, contactId: string, appointment: any): Promise<string | null> {
  try {
    const date = appointment.date || appointment.scheduledDate;
    const time = appointment.time || appointment.scheduledTime || '10:00';
    
    if (!date) return null;
    
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
        toNotify: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.id || data.event?.id;
    }
    
    return null;
  } catch (error) {
    console.error('[Retry Sync] Error creating appointment:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, locationId } = await getGHLCredentials();
    
    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 503 });
    }
    
    const results: any[] = [];
    
    // Find failed syncs in bookings
    const failedBookings = await db.collection('bookings')
      .where('ghlSyncError', '!=', null)
      .get();
    
    console.log(`[Retry Sync] Found ${failedBookings.size} failed bookings`);
    
    for (const doc of failedBookings.docs) {
      const data = doc.data();
      
      // Skip if already has appointment ID
      if (data.ghlAppointmentId) {
        await db.collection('bookings').doc(doc.id).update({ ghlSyncError: null });
        continue;
      }
      
      let contactId = data.ghlContactId;
      if (!contactId) {
        contactId = await findOrCreateContact(apiKey, locationId, data);
      }
      
      if (!contactId) {
        results.push({ id: doc.id, collection: 'bookings', status: 'failed', error: 'Could not create contact' });
        continue;
      }
      
      const appointmentId = await createAppointment(apiKey, locationId, contactId, data);
      
      if (appointmentId) {
        await db.collection('bookings').doc(doc.id).update({
          ghlContactId: contactId,
          ghlAppointmentId: appointmentId,
          lastSyncedAt: new Date().toISOString(),
          ghlSyncError: null,
          ghlRetryCount: (data.ghlRetryCount || 0) + 1
        });
        results.push({ id: doc.id, collection: 'bookings', status: 'synced', ghlAppointmentId: appointmentId });
      } else {
        await db.collection('bookings').doc(doc.id).update({
          ghlContactId: contactId,
          ghlRetryCount: (data.ghlRetryCount || 0) + 1,
          ghlLastRetry: new Date().toISOString()
        });
        results.push({ id: doc.id, collection: 'bookings', status: 'failed', error: 'Could not create appointment' });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Find failed syncs in appointments
    const failedAppointments = await db.collection('appointments')
      .where('ghlSyncError', '!=', null)
      .get();
    
    console.log(`[Retry Sync] Found ${failedAppointments.size} failed appointments`);
    
    for (const doc of failedAppointments.docs) {
      const data = doc.data();
      
      if (data.ghlAppointmentId) {
        await db.collection('appointments').doc(doc.id).update({ ghlSyncError: null });
        continue;
      }
      
      let contactId = data.ghlContactId;
      if (!contactId) {
        contactId = await findOrCreateContact(apiKey, locationId, data);
      }
      
      if (!contactId) {
        results.push({ id: doc.id, collection: 'appointments', status: 'failed', error: 'Could not create contact' });
        continue;
      }
      
      const appointmentId = await createAppointment(apiKey, locationId, contactId, data);
      
      if (appointmentId) {
        await db.collection('appointments').doc(doc.id).update({
          ghlContactId: contactId,
          ghlAppointmentId: appointmentId,
          lastSyncedAt: new Date().toISOString(),
          ghlSyncError: null,
          ghlRetryCount: (data.ghlRetryCount || 0) + 1
        });
        results.push({ id: doc.id, collection: 'appointments', status: 'synced', ghlAppointmentId: appointmentId });
      } else {
        await db.collection('appointments').doc(doc.id).update({
          ghlContactId: contactId,
          ghlRetryCount: (data.ghlRetryCount || 0) + 1,
          ghlLastRetry: new Date().toISOString()
        });
        results.push({ id: doc.id, collection: 'appointments', status: 'failed', error: 'Could not create appointment' });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const synced = results.filter(r => r.status === 'synced').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    return NextResponse.json({
      success: true,
      summary: { total: results.length, synced, failed },
      results,
      message: `Retry complete: ${synced} synced, ${failed} still failing`
    });
    
  } catch (error) {
    console.error('[Retry Sync] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Retry failed'
    }, { status: 500 });
  }
}
