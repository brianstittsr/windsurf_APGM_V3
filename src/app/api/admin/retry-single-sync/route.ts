import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * POST /api/admin/retry-single-sync
 * 
 * Retries syncing a single appointment to GHL.
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
        source: 'Website Manual Retry',
        tags: ['website-booking', 'manual-retry']
      })
    });
    
    if (createResponse.ok) {
      const data = await createResponse.json();
      return data.contact?.id || data.id;
    }
    
    return null;
  } catch (error) {
    console.error('[Retry Single] Error with contact:', error);
    return null;
  }
}

async function createAppointment(apiKey: string, locationId: string, contactId: string, appointment: any): Promise<{ id: string | null; error?: string }> {
  try {
    const date = appointment.date || appointment.scheduledDate;
    const time = appointment.time || appointment.scheduledTime || '10:00';
    
    if (!date) {
      return { id: null, error: 'No date found' };
    }
    
    // Check if past date
    const appointmentDate = new Date(`${date}T${time}:00`);
    const now = new Date();
    if (appointmentDate < now) {
      return { id: null, error: 'Past date - GHL does not allow past appointments' };
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
        toNotify: true
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { id: data.id || data.event?.id };
    }
    
    const errorText = await response.text();
    let errorMessage = 'Failed to create appointment';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText.substring(0, 100);
    }
    
    return { id: null, error: errorMessage };
  } catch (error) {
    console.error('[Retry Single] Error creating appointment:', error);
    return { id: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, collection } = await req.json();
    
    if (!id || !collection) {
      return NextResponse.json({ error: 'ID and collection are required' }, { status: 400 });
    }
    
    const { apiKey, locationId } = await getGHLCredentials();
    
    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 503 });
    }
    
    // Get the appointment data
    const docRef = db.collection(collection).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    const data = doc.data()!;
    
    // Find or create contact
    let contactId = data.ghlContactId;
    if (!contactId) {
      contactId = await findOrCreateContact(apiKey, locationId, data);
    }
    
    if (!contactId) {
      await docRef.update({
        ghlSyncError: 'Failed to create/find contact',
        ghlRetryCount: (data.ghlRetryCount || 0) + 1,
        ghlLastRetry: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create/find GHL contact'
      });
    }
    
    // Create appointment
    const result = await createAppointment(apiKey, locationId, contactId, data);
    
    if (result.id) {
      await docRef.update({
        ghlContactId: contactId,
        ghlAppointmentId: result.id,
        lastSyncedAt: new Date().toISOString(),
        ghlSyncError: null
      });
      
      return NextResponse.json({
        success: true,
        ghlAppointmentId: result.id,
        ghlContactId: contactId,
        message: 'Successfully synced to GHL'
      });
    } else {
      await docRef.update({
        ghlContactId: contactId,
        ghlSyncError: result.error || 'Failed to create appointment',
        ghlRetryCount: (data.ghlRetryCount || 0) + 1,
        ghlLastRetry: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: false,
        ghlContactId: contactId,
        error: result.error || 'Failed to create GHL appointment'
      });
    }
    
  } catch (error) {
    console.error('[Retry Single] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Retry failed'
    }, { status: 500 });
  }
}
