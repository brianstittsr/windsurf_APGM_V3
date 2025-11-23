import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function getGHLCredentials() {
  try {
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || ''
  };
}

interface GHLAppointment {
  id: string;
  calendarId: string;
  contactId: string;
  locationId: string;
  title: string;
  appointmentStatus: string;
  assignedUserId?: string;
  address?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  source?: string;
}

interface GHLContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

async function fetchGHLCalendars(apiKey: string, locationId: string) {
  try {
    console.log('📋 Fetching calendars from GHL...');
    
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch calendars: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.calendars?.length || 0} calendars`);
    return data.calendars || [];
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
}

async function fetchGHLAppointments(apiKey: string, locationId: string, calendarId: string, startDate: string, endDate: string) {
  try {
    console.log(`📅 Fetching appointments from ${startDate} to ${endDate}...`);
    
    // Fetch appointments from GHL for specific calendar
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/events/appointments?locationId=${locationId}&calendarId=${calendarId}&startTime=${startDate}&endTime=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch appointments: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.events?.length || 0} appointments in calendar`);
    return data.events || [];
  } catch (error) {
    console.error('Error fetching GHL appointments:', error);
    throw error;
  }
}

async function fetchGHLContact(apiKey: string, contactId: string): Promise<GHLContact | null> {
  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      console.warn(`⚠️  Could not fetch contact ${contactId}`);
      return null;
    }

    const data = await response.json();
    return {
      id: data.contact.id,
      name: data.contact.name || 'Unknown Client',
      email: data.contact.email || '',
      phone: data.contact.phone || ''
    };
  } catch (error) {
    console.error(`Error fetching contact ${contactId}:`, error);
    return null;
  }
}

function parseAppointmentTitle(title: string) {
  // Try to extract service name from title
  // Format might be: "Service Name - Client Name" or just "Service Name"
  const parts = title.split(' - ');
  if (parts.length >= 2) {
    return {
      serviceName: parts[0].trim(),
      clientName: parts[1].trim()
    };
  }
  return {
    serviceName: title.trim(),
    clientName: null
  };
}

function formatDateForFirestore(isoDateTime: string) {
  const date = new Date(isoDateTime);
  return {
    date: date.toISOString().split('T')[0], // YYYY-MM-DD
    time: date.toTimeString().split(' ')[0].substring(0, 5) // HH:MM
  };
}

async function importGHLAppointments() {
  try {
    console.log('🚀 Starting GHL Appointment Import...\n');

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    if (!apiKey || !locationId) {
      console.error('❌ GHL API key or Location ID not configured');
      console.log('\n📝 To fix this:');
      console.log('   1. Go to your website admin dashboard');
      console.log('   2. Navigate to GoHighLevel tab');
      console.log('   3. Enter your API Key and Location ID');
      console.log('   4. Click "Save Settings"');
      process.exit(1);
    }

    console.log('✅ GHL credentials found');
    console.log(`   Location ID: ${locationId}\n`);

    // Fetch calendars and find "Service" calendar
    const calendars = await fetchGHLCalendars(apiKey, locationId);
    
    if (calendars.length === 0) {
      console.error('❌ No calendars found in GHL');
      process.exit(1);
    }

    // Display available calendars
    console.log('📋 Available calendars:');
    calendars.forEach((cal: any) => {
      console.log(`   - ${cal.name} (ID: ${cal.id})`);
    });

    // Find "Service" calendar (case-insensitive)
    const serviceCalendar = calendars.find((cal: any) => 
      cal.name.toLowerCase().includes('service')
    );

    if (!serviceCalendar) {
      console.error('\n❌ "Service" calendar not found');
      console.log('   Available calendars listed above');
      console.log('   Please ensure you have a calendar with "Service" in the name');
      process.exit(1);
    }

    console.log(`\n✅ Using calendar: "${serviceCalendar.name}" (ID: ${serviceCalendar.id})\n`);

    // Set date range (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startDate = startOfMonth.toISOString();
    const endDate = endOfMonth.toISOString();

    // Fetch appointments from GHL Service calendar only
    const ghlAppointments: GHLAppointment[] = await fetchGHLAppointments(apiKey, locationId, serviceCalendar.id, startDate, endDate);

    if (ghlAppointments.length === 0) {
      console.log('ℹ️  No appointments found in GHL for this date range');
      process.exit(0);
    }

    console.log(`\n📥 Importing ${ghlAppointments.length} appointments...\n`);

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const appointment of ghlAppointments) {
      try {
        // Check if appointment already exists
        const existingBookings = await db.collection('bookings')
          .where('ghlAppointmentId', '==', appointment.id)
          .get();

        if (!existingBookings.empty) {
          console.log(`⏭️  Skipping: ${appointment.title} (already imported)`);
          skipped++;
          continue;
        }

        // Fetch contact details
        const contact = await fetchGHLContact(apiKey, appointment.contactId);
        
        if (!contact) {
          console.warn(`⚠️  Skipping: ${appointment.title} (could not fetch contact)`);
          skipped++;
          continue;
        }

        // Parse appointment details
        const { serviceName, clientName } = parseAppointmentTitle(appointment.title);
        const { date, time } = formatDateForFirestore(appointment.startTime);

        // Map GHL status to our status
        let status: 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'pending';
        if (appointment.appointmentStatus === 'confirmed') status = 'confirmed';
        else if (appointment.appointmentStatus === 'showed') status = 'completed';
        else if (appointment.appointmentStatus === 'cancelled') status = 'cancelled';
        else if (appointment.appointmentStatus === 'noshow') status = 'cancelled';

        // Create booking object
        const booking = {
          clientName: clientName || contact.name,
          clientEmail: contact.email,
          clientPhone: contact.phone,
          artistId: appointment.assignedUserId || 'imported-from-ghl',
          artistName: 'Imported from GHL',
          serviceName: serviceName,
          date: date,
          time: time,
          status: status,
          price: 0, // Price not available from GHL appointment
          depositPaid: false,
          notes: appointment.notes || `Imported from GHL. Calendar: ${appointment.calendarId}`,
          ghlContactId: contact.id,
          ghlAppointmentId: appointment.id,
          lastSyncedAt: new Date().toISOString(),
          createdAt: Timestamp.now(),
          importedFromGHL: true
        };

        // Save to Firestore
        await db.collection('bookings').add(booking);

        console.log(`✅ Imported: ${serviceName} - ${contact.name} (${date} ${time})`);
        imported++;

      } catch (error) {
        console.error(`❌ Failed to import: ${appointment.title}`, error);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped} (already exist)`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📅 Total: ${ghlAppointments.length}`);
    console.log('='.repeat(60));

    if (imported > 0) {
      console.log('\n🎉 Success! Appointments have been imported to your website.');
      console.log('   View them in: Admin Dashboard → Calendar tab');
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    if (error instanceof Error) {
      console.error('   Details:', error.message);
    }
    process.exit(1);
  }
}

// Run the import
importGHLAppointments()
  .then(() => {
    console.log('\n✅ Import script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import script failed:', error);
    process.exit(1);
  });
