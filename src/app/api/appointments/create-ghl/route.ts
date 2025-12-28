import { NextRequest, NextResponse } from 'next/server';

// Lazy load Firebase Admin to prevent Turbopack symlink errors on Windows
async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch (error) {
    console.warn('Firebase Admin not available:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    
    // Get GHL credentials from Firestore
    const credentials = await getGHLCredentials();
    
    if (!credentials.apiKey || !credentials.locationId) {
      return NextResponse.json(
        { error: 'GHL credentials not configured' },
        { status: 400 }
      );
    }

    // First, create or get the contact
    let contactId = appointmentData.contactId;
    
    if (!contactId) {
      // Search for existing contact by email
      const contactsResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/?locationId=${credentials.locationId}&query=${encodeURIComponent(appointmentData.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        if (contactsData.contacts && contactsData.contacts.length > 0) {
          contactId = contactsData.contacts[0].id;
        }
      }

      // If contact doesn't exist, create it
      if (!contactId) {
        const createContactResponse = await fetch(
          'https://services.leadconnectorhq.com/contacts/',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              locationId: credentials.locationId,
              firstName: appointmentData.firstName || appointmentData.name?.split(' ')[0] || '',
              lastName: appointmentData.lastName || appointmentData.name?.split(' ').slice(1).join(' ') || '',
              email: appointmentData.email,
              phone: appointmentData.phone || '',
              source: 'Website Admin'
            })
          }
        );

        if (!createContactResponse.ok) {
          throw new Error('Failed to create contact in GHL');
        }

        const contactResult = await createContactResponse.json();
        contactId = contactResult.contact.id;
      }
    }

    // Service Calendar ID (for MOELCALL200 coupon)
    const SERVICE_CALENDAR_ID = 'JvcOyRMMYoIPbH5s1Bg1';
    
    // Check if MOELCALL200 coupon is applied
    const couponCode = appointmentData.couponCode?.toUpperCase();
    const useServiceCalendar = couponCode === 'MOELCALL200' || couponCode === 'MODELCALL200';
    
    // Use Service Calendar if MOELCALL200 is applied, otherwise use provided calendarId
    let calendarId = useServiceCalendar ? SERVICE_CALENDAR_ID : appointmentData.calendarId;
    
    // If no calendarId provided, fetch the first available calendar
    if (!calendarId) {
      console.log('No calendarId provided, fetching available calendars...');
      const calendarsResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/?locationId=${credentials.locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );
      
      if (calendarsResponse.ok) {
        const calendarsData = await calendarsResponse.json();
        if (calendarsData.calendars && calendarsData.calendars.length > 0) {
          calendarId = calendarsData.calendars[0].id;
          console.log('Using first available calendar:', calendarId);
        }
      }
      
      if (!calendarId) {
        // Use the known Service Calendar as fallback
        calendarId = SERVICE_CALENDAR_ID;
        console.log('Using fallback Service Calendar:', calendarId);
      }
    }
    
    // Create the appointment in GHL
    const appointmentPayload = {
      locationId: credentials.locationId,
      contactId: contactId,
      calendarId: calendarId,
      startTime: appointmentData.startTime, // ISO format: "2025-11-25T11:00:00.000Z"
      endTime: appointmentData.endTime,
      title: appointmentData.title || appointmentData.serviceName,
      appointmentStatus: appointmentData.status || 'new',
      address: appointmentData.address || '',
      ignoreDateRange: false,
      toNotify: true
    };

    const createAppointmentResponse = await fetch(
      'https://services.leadconnectorhq.com/calendars/events/appointments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      }
    );

    let appointmentResult = null;
    let ghlAppointmentId = null;
    
    if (!createAppointmentResponse.ok) {
      const errorText = await createAppointmentResponse.text();
      console.error('GHL appointment creation failed:', createAppointmentResponse.status, errorText);
      console.error('Appointment payload:', JSON.stringify(appointmentPayload, null, 2));
      // Continue without GHL - we'll still create the booking in Firestore
      console.log('Continuing without GHL appointment - will create local booking only');
    } else {
      appointmentResult = await createAppointmentResponse.json();
      ghlAppointmentId = appointmentResult?.event?.id || appointmentResult?.id || null;
    }

    // Also create the appointment in the website's database
    const bookingData = {
      clientName: appointmentData.name || `${appointmentData.firstName || ''} ${appointmentData.lastName || ''}`.trim(),
      clientEmail: appointmentData.email,
      clientPhone: appointmentData.phone || '',
      artistId: appointmentData.artistId || 'default-artist',
      artistName: appointmentData.artistName || 'Victoria Escobar',
      serviceName: appointmentData.serviceName || appointmentData.title,
      date: new Date(appointmentData.startTime).toISOString().split('T')[0],
      time: new Date(appointmentData.startTime).toTimeString().slice(0, 5),
      status: appointmentData.status || 'pending',
      price: appointmentData.price || 0,
      depositPaid: appointmentData.depositPaid || false,
      notes: appointmentData.notes || '',
      ghlContactId: contactId || null,
      ghlAppointmentId: ghlAppointmentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const db = await getFirebaseDb();
    if (db) {
      await db.collection('bookings').add(bookingData);
    }

    return NextResponse.json({
      success: true,
      appointment: appointmentResult,
      appointmentId: ghlAppointmentId,
      contactId: contactId,
      message: ghlAppointmentId 
        ? 'Appointment created successfully in GHL and website'
        : 'Booking created in website (GHL sync pending)'
    });

  } catch (error) {
    console.error('Error creating GHL appointment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

async function getGHLCredentials() {
  try {
    const db = await getFirebaseDb();
    if (db) {
      // First try to get from the collection (any document)
      const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
      if (!settingsSnapshot.empty) {
        const data = settingsSnapshot.docs[0].data();
        return {
          apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
          locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
        };
      }
      
      // Fallback: try specific document ID for backwards compatibility
      const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        return {
          apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
          locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || ''
  };
}
