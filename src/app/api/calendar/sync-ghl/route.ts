import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { getDb } from '../../../../lib/firebase';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  depositPaid: boolean;
  notes?: string;
  ghlContactId?: string;
  ghlAppointmentId?: string;
  couponCode?: string;
}

async function getGHLApiKey() {
  try {
    const db = getDb();
    
    // First try to get from the collection (any document)
    const settingsQuery = query(collection(db, 'crmSettings'), limit(1));
    const settingsSnapshot = await getDocs(settingsQuery);
    if (!settingsSnapshot.empty) {
      return settingsSnapshot.docs[0].data().apiKey;
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await getDoc(doc(db, 'crmSettings', 'gohighlevel'));
    if (settingsDoc.exists()) {
      return settingsDoc.data().apiKey;
    }
  } catch (error) {
    console.error('Error fetching GHL API key:', error);
  }
  return process.env.GHL_API_KEY || '';
}

async function getGHLLocationId() {
  try {
    const db = getDb();
    
    // First try to get from the collection (any document)
    const settingsQuery = query(collection(db, 'crmSettings'), limit(1));
    const settingsSnapshot = await getDocs(settingsQuery);
    if (!settingsSnapshot.empty) {
      return settingsSnapshot.docs[0].data().locationId;
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await getDoc(doc(db, 'crmSettings', 'gohighlevel'));
    if (settingsDoc.exists()) {
      return settingsDoc.data().locationId;
    }
  } catch (error) {
    console.error('Error fetching GHL location ID:', error);
  }
  return process.env.GHL_LOCATION_ID || '';
}

async function createOrUpdateGHLContact(booking: Booking, apiKey: string) {
  try {
    // Check if contact already exists
    if (booking.ghlContactId) {
      // Update existing contact
      const response = await fetch(`https://services.leadconnectorhq.com/contacts/${booking.ghlContactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.clientPhone,
          tags: [booking.serviceName, booking.status]
        })
      });

      if (response.ok) {
        return booking.ghlContactId;
      }
    }

    // Create new contact
    const locationId = await getGHLLocationId();
    
    if (!locationId) {
      throw new Error('GHL Location ID not configured. Please set GHL_LOCATION_ID environment variable or configure in Firebase crmSettings/gohighlevel');
    }
    
    // Split name into first and last name for GHL
    const nameParts = booking.clientName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const contactData = {
      locationId,
      firstName,
      lastName,
      name: booking.clientName,
      email: booking.clientEmail,
      phone: booking.clientPhone,
      tags: [booking.serviceName, booking.status],
      source: 'Website Booking'
    };
    
    console.log('Creating GHL contact with data:', JSON.stringify(contactData, null, 2));
    
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(contactData)
    });

    const responseText = await response.text();
    console.log('GHL contact response:', response.status, responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        return data.contact?.id || data.id;
      } catch {
        throw new Error('Invalid response from GHL contact creation');
      }
    }

    // Check if contact already exists (duplicate email/phone)
    if (response.status === 400 || response.status === 422) {
      // Try to search for existing contact
      const searchResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(booking.clientEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.contact?.id) {
          console.log('Found existing contact:', searchData.contact.id);
          return searchData.contact.id;
        }
      }
    }

    throw new Error(`Failed to create GHL contact: ${responseText}`);
  } catch (error) {
    console.error('Error creating/updating GHL contact:', error);
    throw error;
  }
}

async function createOrUpdateGHLAppointment(booking: Booking, contactId: string, apiKey: string) {
  try {
    const locationId = await getGHLLocationId();
    
    // APGM Calendar ID (primary calendar for all bookings)
    const APGM_CALENDAR_ID = process.env.GHL_CALENDAR_ID || 'C9kiOUUFTpnSSqGurWh1';
    
    // Alternative calendars
    const SERVICE_CALENDAR_ID = 'JvcOyRMMYoIPbH5s1Bg1'; // For MOELCALL200 coupon
    
    // Check if booking has MOELCALL200 coupon
    const couponCode = (booking as any).couponCode?.toUpperCase();
    const useServiceCalendar = couponCode === 'MOELCALL200' || couponCode === 'MODELCALL200';
    
    // Use APGM Calendar by default, Service Calendar only for MOELCALL200
    let calendarId = useServiceCalendar ? SERVICE_CALENDAR_ID : APGM_CALENDAR_ID;
    
    console.log(`[sync-ghl] Using calendar ID: ${calendarId} (${useServiceCalendar ? 'Service Calendar for MOELCALL200' : 'APGM Calendar'})`);
    
    // Parse date and add 3 hours for end time
    const startDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours

    const appointmentData = {
      locationId,
      contactId,
      calendarId,
      title: `${booking.serviceName} - ${booking.clientName}`,
      appointmentStatus: booking.status === 'confirmed' ? 'confirmed' : 'new',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: booking.notes || `Booking for ${booking.serviceName}. Price: $${booking.price}. Deposit Paid: ${booking.depositPaid ? 'Yes' : 'No'}`,
    };

    if (booking.ghlAppointmentId) {
      // Update existing appointment
      const response = await fetch(`https://services.leadconnectorhq.com/calendars/events/appointments/${booking.ghlAppointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        return booking.ghlAppointmentId;
      }
    }

    // Create new appointment
    console.log('Creating GHL appointment with data:', JSON.stringify(appointmentData, null, 2));
    
    const response = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(appointmentData)
    });

    const responseText = await response.text();
    console.log('GHL appointment response:', response.status, responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        return data.id;
      } catch {
        // Some successful responses may not have JSON body
        return null;
      }
    }

    // Parse error response for more details
    let errorDetails = responseText;
    try {
      const errorJson = JSON.parse(responseText);
      errorDetails = errorJson.message || errorJson.error || responseText;
    } catch {
      // Keep original text if not JSON
    }
    
    console.error('GHL appointment creation failed:', response.status, errorDetails);
    throw new Error(`GHL Error: ${errorDetails}`);
  } catch (error) {
    console.error('Error creating/updating GHL appointment:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, booking, action, collection: collectionParam } = body;

    if (!bookingId || !booking) {
      return NextResponse.json(
        { error: 'Booking ID and booking data are required' },
        { status: 400 }
      );
    }

    const apiKey = await getGHLApiKey();
    const locationId = await getGHLLocationId();
    
    console.log('[sync-ghl] Starting sync:', {
      bookingId,
      serviceName: booking.serviceName,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
      locationId: locationId || 'not configured'
    });
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GHL API key not configured' },
        { status: 503 }
      );
    }

    // Create or update contact in GHL
    let contactId: string | null = null;
    let appointmentId: string | null = null;
    let syncErrors: string[] = [];
    
    try {
      contactId = await createOrUpdateGHLContact(booking, apiKey);
      console.log('[sync-ghl] Contact created/updated:', contactId);
    } catch (contactError) {
      const errorMsg = contactError instanceof Error ? contactError.message : 'Unknown contact error';
      console.error('[sync-ghl] Contact creation failed:', errorMsg);
      syncErrors.push(`Contact: ${errorMsg}`);
    }

    // Create or update appointment in GHL (only if contact was created)
    if (contactId) {
      try {
        appointmentId = await createOrUpdateGHLAppointment(booking, contactId, apiKey);
        console.log('[sync-ghl] Appointment created/updated:', appointmentId);
      } catch (apptError) {
        const errorMsg = apptError instanceof Error ? apptError.message : 'Unknown appointment error';
        console.error('[sync-ghl] Appointment creation failed:', errorMsg);
        syncErrors.push(`Appointment: ${errorMsg}`);
      }
    } else {
      syncErrors.push('Appointment: Skipped - no contact ID');
    }

    // Update booking in Firestore with GHL IDs (even if partial success)
    const db = getDb();
    const collectionName = collectionParam === 'appointments' ? 'appointments' : 'bookings';
    const bookingRef = doc(db, collectionName, bookingId);
    
    const updateData: any = {
      lastSyncedAt: new Date().toISOString()
    };
    
    if (contactId) updateData.ghlContactId = contactId;
    if (appointmentId) updateData.ghlAppointmentId = appointmentId;
    if (syncErrors.length > 0) updateData.ghlSyncError = syncErrors.join('; ');
    else updateData.ghlSyncError = null;
    
    await updateDoc(bookingRef, updateData);

    // Return appropriate response based on success/partial success/failure
    if (contactId && appointmentId) {
      return NextResponse.json({
        success: true,
        contactId,
        appointmentId,
        message: 'Booking synced with GHL successfully'
      });
    } else if (contactId && !appointmentId) {
      return NextResponse.json({
        success: true,
        contactId,
        appointmentId: null,
        warning: 'Contact created but appointment failed',
        errors: syncErrors,
        message: 'Partial sync - contact created, appointment failed'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to sync with GHL',
        errors: syncErrors,
        message: 'GHL sync failed - check errors array'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing booking with GHL:', error);
    return NextResponse.json(
      { error: 'Failed to sync booking with GHL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const apiKey = await getGHLApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GHL API key not configured' },
        { status: 503 }
      );
    }

    // Delete appointment from GHL
    const response = await fetch(`https://services.leadconnectorhq.com/calendars/events/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete GHL appointment');
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted from GHL successfully'
    });
  } catch (error) {
    console.error('Error deleting GHL appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete GHL appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
