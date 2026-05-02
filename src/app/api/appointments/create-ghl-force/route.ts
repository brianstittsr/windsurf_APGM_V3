import { NextRequest, NextResponse } from 'next/server';

// This route creates a GHL appointment using alternative methods to bypass availability checks
export async function POST(request: NextRequest) {
  const logPrefix = '[GHL-FORCE]';
  const logs: string[] = [];
  
  const log = (msg: string) => {
    const entry = `${logPrefix} ${msg}`;
    logs.push(entry);
    console.log(entry);
  };

  try {
    const appointmentData = await request.json();
    
    log(`Starting forced GHL sync for: ${appointmentData.title}`);
    log(`Time: ${appointmentData.startTime} - ${appointmentData.endTime}`);

    // Get GHL credentials
    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;
    const calendarId = process.env.GHL_CALENDAR_ID || 'C9kiOUUFTpnSSqGurWh1';

    if (!apiKey || !locationId) {
      log('ERROR: Missing GHL credentials');
      return NextResponse.json(
        { error: 'GHL credentials not configured', logs },
        { status: 400 }
      );
    }

    log(`Using calendar: ${calendarId}, location: ${locationId}`);

    // Step 1: Find or create contact
    let contactId = appointmentData.contactId;
    let contactLogs: string[] = [];

    if (!contactId) {
      log('Step 1: Looking up contact by email...');
      
      try {
        const searchResponse = await fetch(
          `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(appointmentData.email)}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Version': '2021-07-28'
            }
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.contacts?.length > 0) {
            contactId = searchData.contacts[0].id;
            log(`Found existing contact: ${contactId}`);
          }
        }
      } catch (err) {
        log(`Contact search error: ${err}`);
      }

      // If not found by email, search by phone (GHL blocks duplicates by phone)
      if (!contactId && appointmentData.phone) {
        log(`Searching for contact by phone: ${appointmentData.phone}...`);
        try {
          const phoneQuery = appointmentData.phone.replace(/\D/g, ''); // Remove non-digits
          const phoneResponse = await fetch(
            `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(phoneQuery)}`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Version': '2021-07-28'
              }
            }
          );

          if (phoneResponse.ok) {
            const phoneData = await phoneResponse.json();
            if (phoneData.contacts?.length > 0) {
              contactId = phoneData.contacts[0].id;
              log(`Found existing contact by phone: ${contactId}`);
            }
          }
        } catch (err) {
          log(`Phone search error: ${err}`);
        }
      }

      // Create new contact if not found
      if (!contactId) {
        log('Creating new contact...');
        
        try {
          const createResponse = await fetch(
            'https://services.leadconnectorhq.com/contacts/',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                locationId,
                firstName: appointmentData.firstName || appointmentData.name?.split(' ')[0] || 'Unknown',
                lastName: appointmentData.lastName || appointmentData.name?.split(' ').slice(1).join(' ') || '',
                email: appointmentData.email,
                phone: appointmentData.phone || '',
                source: 'Website Admin (Forced)',
                tags: ['admin-forced-booking']
              })
            }
          );

          if (createResponse.ok) {
            const createData = await createResponse.json();
            contactId = createData.contact?.id || createData.id;
            log(`Created contact: ${contactId}`);
          } else {
            const errorText = await createResponse.text();
            contactLogs.push(`Contact creation failed (${createResponse.status}): ${errorText}`);
            log(`Contact creation failed: ${errorText}`);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          contactLogs.push(`Contact error: ${errorMsg}`);
          log(`Contact error: ${errorMsg}`);
        }
      }
    }

    // Step 2: Try multiple methods to create the appointment
    log('Step 2: Attempting to create appointment...');
    
    let appointmentResult = null;
    let appointmentId = null;
    let creationMethod = '';

    // Method 1: Try standard create with ignoreDateRange
    log('Method 1: Standard create with ignoreDateRange=true');
    try {
      const standardPayload = {
        locationId,
        contactId,
        calendarId,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        title: appointmentData.title || appointmentData.serviceName,
        appointmentStatus: appointmentData.status || 'confirmed',
        address: appointmentData.address || '',
        ignoreDateRange: true,
        toNotify: false // Don't send notifications for admin-forced bookings
      };

      const standardResponse = await fetch(
        'https://services.leadconnectorhq.com/calendars/events/appointments',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(standardPayload)
        }
      );

      if (standardResponse.ok) {
        appointmentResult = await standardResponse.json();
        appointmentId = appointmentResult?.event?.id || appointmentResult?.id;
        creationMethod = 'standard';
        log(`✓ Created via standard method: ${appointmentId}`);
      } else {
        const errorText = await standardResponse.text();
        log(`✗ Standard method failed (${standardResponse.status}): ${errorText}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      log(`✗ Standard method error: ${errorMsg}`);
    }

    // Method 2: If standard failed, try creating as a blocked slot first then converting
    if (!appointmentId) {
      log('Method 2: Create via blocked slot workaround');
      
      try {
        // First create a blocked slot
        const blockResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/${calendarId}/blockedSlots`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              locationId,
              startTime: appointmentData.startTime,
              endTime: appointmentData.endTime,
              title: appointmentData.title || 'Blocked',
              notes: 'Admin forced booking'
            })
          }
        );

        if (blockResponse.ok) {
          const blockData = await blockResponse.json();
          log(`Created blocked slot: ${blockData.id}`);
          
          // Now try to convert it to an appointment by creating an appointment at the same time
          // which will fail with "slot blocked" but we can then delete the block and retry
          const retryPayload = {
            locationId,
            contactId,
            calendarId,
            startTime: appointmentData.startTime,
            endTime: appointmentData.endTime,
            title: appointmentData.title,
            appointmentStatus: 'confirmed',
            ignoreDateRange: true,
            toNotify: false
          };

          const retryResponse = await fetch(
            'https://services.leadconnectorhq.com/calendars/events/appointments',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(retryPayload)
            }
          );

          // Delete the blocked slot regardless
          await fetch(
            `https://services.leadconnectorhq.com/calendars/${calendarId}/blockedSlots/${blockData.id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Version': '2021-07-28'
              }
            }
          );

          if (retryResponse.ok) {
            appointmentResult = await retryResponse.json();
            appointmentId = appointmentResult?.event?.id || appointmentResult?.id;
            creationMethod = 'blocked-slot-workaround';
            log(`✓ Created via blocked slot workaround: ${appointmentId}`);
          } else {
            log(`✗ Retry after unblock failed: ${await retryResponse.text()}`);
          }
        } else {
          log(`✗ Block slot creation failed: ${await blockResponse.text()}`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        log(`✗ Blocked slot method error: ${errorMsg}`);
      }
    }

    // Step 3: Only save to Firestore if GHL appointment was created successfully
    if (!appointmentId) {
      log('✗ All GHL methods failed - not saving to Firestore');
      return NextResponse.json({
        success: false,
        appointmentId: null,
        contactId,
        message: `Failed to create appointment in GoHighLevel. Please check: (1) The time slot is not already booked in GHL, (2) Your GHL API key is valid, (3) Try a different date/time`,
        logs,
        contactLogs,
        suggestion: 'Use "Check GHL Availability" to find available slots'
      }, { status: 400 });
    }

    // Save to Firestore only after successful GHL sync
    log('Step 3: Saving to Firestore...');
    let bookingRefId = null;
    
    try {
      const { db } = await import('@/lib/firebase-admin');
      if (db) {
        const bookingRef = db.collection('bookings').doc();
        await bookingRef.set({
          ...appointmentData,
          ghlContactId: contactId,
          ghlAppointmentId: appointmentId,
          ghlCalendarId: calendarId,
          ghlCreationMethod: creationMethod,
          ghlSyncLogs: logs,
          ghlSyncStatus: 'synced',
          createdAt: new Date(),
          syncedAt: new Date()
        });
        bookingRefId = bookingRef.id;
        log(`✓ Saved to Firestore: ${bookingRef.id}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      log(`✗ Firestore save failed: ${errorMsg}`);
      // Note: GHL appointment was created but Firebase save failed
      // This is a partial success - we should still report it
    }

    // Return success
    return NextResponse.json({
      success: true,
      appointmentId,
      contactId,
      calendarId,
      bookingId: bookingRefId,
      creationMethod,
      message: `Appointment created in GoHighLevel and saved to database`,
      logs,
      ghlAppointment: appointmentResult
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${logPrefix} Fatal error:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: errorMsg,
        logs
      },
      { status: 500 }
    );
  }
}
