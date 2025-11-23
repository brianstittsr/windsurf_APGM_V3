import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

async function listGHLAppointments() {
  try {
    console.log('🔍 Fetching Appointments from ALL Calendars...\n');

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    if (!apiKey || !locationId) {
      console.error('❌ GHL API key or Location ID not configured');
      process.exit(1);
    }

    console.log('✅ GHL credentials found');
    console.log(`   Location ID: ${locationId}\n`);

    // All Calendar IDs
    const calendars = [
      { name: 'Service Calendar', id: 'JvcOyRMMYoIPbH5s1Bg1' },
      { name: "Victoria Escobar's Personal Calendar", id: 'apjAQhxGgapiXteQga42' },
      { name: 'Free Virtual Consultation', id: 'lrcO6wctZdKrnhb8iwye' }
    ];

    // Set date range (1 month back and 6 months forward)
    const now = new Date();
    const pastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const futureDate = new Date(now.getFullYear(), now.getMonth() + 6, 0);
    const startDate = pastDate.toISOString();
    const endDate = futureDate.toISOString();

    console.log(`📅 Fetching appointments from ${startDate.split('T')[0]} to ${endDate.split('T')[0]}...\n`);

    // Fetch appointments from ALL calendars
    let allAppointments: any[] = [];

    for (const calendar of calendars) {
      console.log(`📋 Checking "${calendar.name}"...`);
      
      // Try appointments endpoint first
      let response = await fetch(
        `https://services.leadconnectorhq.com/calendars/events/appointments?locationId=${locationId}&calendarId=${calendar.id}&startTime=${startDate}&endTime=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );

      // If that fails, try the events endpoint
      if (!response.ok) {
        response = await fetch(
          `https://services.leadconnectorhq.com/calendars/events?locationId=${locationId}&calendarId=${calendar.id}&startTime=${startDate}&endTime=${endDate}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Version': '2021-07-28'
            }
          }
        );
      }

      if (!response.ok) {
        console.warn(`   ⚠️  Failed to fetch from "${calendar.name}"`);
        continue;
      }

      const data = await response.json();
      const calendarAppointments = data.events || [];
      
      // Add calendar name to each appointment
      calendarAppointments.forEach((appt: any) => {
        appt.calendarName = calendar.name;
      });
      
      console.log(`   ✅ Found ${calendarAppointments.length} appointment(s)`);
      allAppointments = allAppointments.concat(calendarAppointments);
    }

    console.log();
    const appointments = allAppointments;

    if (appointments.length === 0) {
      console.log('ℹ️  No appointments found in ANY calendar for this date range');
      process.exit(0);
    }

    console.log('='.repeat(100));
    console.log(`📅 FOUND ${appointments.length} APPOINTMENT(S) ACROSS ALL CALENDARS`);
    console.log('='.repeat(100));
    console.log();

    appointments.forEach((appt: any, index: number) => {
      const startTime = new Date(appt.startTime);
      const endTime = new Date(appt.endTime);
      
      console.log(`Appointment ${index + 1}:`);
      console.log(`  Calendar:        ${appt.calendarName || 'Unknown'}`);
      console.log(`  Title:           ${appt.title || 'Untitled'}`);
      console.log(`  ID:              ${appt.id}`);
      console.log(`  Contact ID:      ${appt.contactId}`);
      console.log(`  Status:          ${appt.appointmentStatus}`);
      console.log(`  Start:           ${startTime.toLocaleString()}`);
      console.log(`  End:             ${endTime.toLocaleString()}`);
      console.log(`  Date:            ${startTime.toLocaleDateString()}`);
      console.log(`  Time:            ${startTime.toLocaleTimeString()}`);
      console.log(`  Assigned User:   ${appt.assignedUserId || 'N/A'}`);
      console.log(`  Calendar ID:     ${appt.calendarId}`);
      console.log(`  Notes:           ${appt.notes || 'N/A'}`);
      console.log();
    });

    console.log('='.repeat(100));
    console.log('📋 SUMMARY BY DATE:');
    console.log('='.repeat(100));
    console.log();

    // Group by date
    const byDate: { [key: string]: any[] } = {};
    appointments.forEach((appt: any) => {
      const date = new Date(appt.startTime).toLocaleDateString();
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push(appt);
    });

    Object.keys(byDate).sort().forEach(date => {
      console.log(`${date}: ${byDate[date].length} appointment(s)`);
      byDate[date].forEach((appt: any) => {
        const time = new Date(appt.startTime).toLocaleTimeString();
        console.log(`  - ${time}: ${appt.title} (${appt.appointmentStatus})`);
      });
      console.log();
    });

    console.log('✅ Done!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Details:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
listGHLAppointments()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
