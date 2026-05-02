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
      console.log(`[GHL] Searching for contact by email: ${appointmentData.email}`);
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
          console.log(`[GHL] Found existing contact by email: ${contactId}`);
        }
      }

      // If not found by email, search by phone (GHL blocks duplicates by phone)
      if (!contactId && appointmentData.phone) {
        console.log(`[GHL] Searching for contact by phone: ${appointmentData.phone}`);
        const phoneQuery = appointmentData.phone.replace(/\D/g, ''); // Remove non-digits
        const phoneResponse = await fetch(
          `https://services.leadconnectorhq.com/contacts/?locationId=${credentials.locationId}&query=${encodeURIComponent(phoneQuery)}`,
          {
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Version': '2021-07-28'
            }
          }
        );

        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          if (phoneData.contacts && phoneData.contacts.length > 0) {
            contactId = phoneData.contacts[0].id;
            console.log(`[GHL] Found existing contact by phone: ${contactId}`);
          }
        }
      }

      // If contact doesn't exist, create it
      if (!contactId) {
        try {
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
            const errorText = await createContactResponse.text();
            console.error('GHL contact creation failed:', createContactResponse.status, errorText);
            console.log('Continuing without GHL contact - will create local booking only');
            // Don't throw - continue without GHL contact
          } else {
            const contactResult = await createContactResponse.json();
            contactId = contactResult.contact?.id || contactResult.id || null;
          }
        } catch (contactError) {
          console.error('Error creating GHL contact:', contactError);
          // Continue without GHL contact
        }
      }
    }

    // Service Calendar ID (for MOELCALL200 coupon)
    const SERVICE_CALENDAR_ID = process.env.GHL_CALENDAR_ID || 'C9kiOUUFTpnSSqGurWh1'; // APGM_Calendar
    
    // Check if MOELCALL200 coupon is applied
    const couponCode = appointmentData.couponCode?.toUpperCase();
    const useServiceCalendar = couponCode === 'MOELCALL200' || couponCode === 'MODELCALL200';
    
    // Use Service Calendar if MOELCALL200 is applied, otherwise use provided calendarId
    let calendarId = useServiceCalendar ? SERVICE_CALENDAR_ID : appointmentData.calendarId;
    
    // Default to APGM_Calendar when no calendarId provided
    if (!calendarId) {
      calendarId = SERVICE_CALENDAR_ID;
      console.log('Defaulting to APGM_Calendar:', calendarId);
    }
    
    // Create the appointment in GHL
    const appointmentPayload = {
      locationId: credentials.locationId,
      contactId: contactId,
      calendarId: calendarId,
      startTime: appointmentData.startTime, // ISO format: "2025-11-25T11:00:00.000Z"
      endTime: appointmentData.endTime,
      title: appointmentData.title || appointmentData.serviceName,
      appointmentStatus: 'confirmed', // Must be "confirmed" to trigger GHL workflows
      address: appointmentData.address || '',
      ignoreDateRange: true,
      toNotify: true // Triggers GHL confirmation email + reminder workflows
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
      
      // Parse error for better messaging
      let errorMessage = errorText;
      let userMessage = `GHL sync failed (${createAppointmentResponse.status}): ${errorText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message?.includes('slot') || errorJson.message?.includes('available')) {
          userMessage = 'This time slot is already booked in GoHighLevel. Please select a different date/time or check the GHL calendar directly.';
        } else if (errorJson.message?.includes('contact')) {
          userMessage = 'Contact creation failed in GoHighLevel. Please verify the client email and phone number.';
        } else {
          userMessage = `GHL sync failed: ${errorJson.message || errorText}`;
        }
      } catch {}
      
      return NextResponse.json({
        success: false,
        appointment: null,
        appointmentId: null,
        contactId: contactId || null,
        ghlError: { status: createAppointmentResponse.status, message: errorMessage },
        message: userMessage
      }, { status: 400 });
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
  // Env vars take priority — Firestore values only used as last resort
  const envApiKey = process.env.GHL_API_KEY || '';
  const envLocationId = process.env.GHL_LOCATION_ID || '';

  if (envApiKey && envLocationId) {
    return { apiKey: envApiKey, locationId: envLocationId };
  }

  try {
    const db = await getFirebaseDb();
    if (db) {
      const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
      if (!settingsSnapshot.empty) {
        const data = settingsSnapshot.docs[0].data();
        return {
          apiKey: envApiKey || data?.apiKey || '',
          locationId: envLocationId || data?.locationId || ''
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }

  return { apiKey: envApiKey, locationId: envLocationId };
}
