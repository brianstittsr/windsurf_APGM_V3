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

async function createTestAppointment() {
  try {
    console.log('🚀 Creating Test Appointment in GHL...\n');

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    if (!apiKey || !locationId) {
      console.error('❌ GHL API key or Location ID not configured');
      process.exit(1);
    }

    console.log('✅ GHL credentials found');
    console.log(`   Location ID: ${locationId}\n`);

    // Step 1: Create a test contact
    console.log('📋 Step 1: Creating test contact...');
    
    const contactData = {
      firstName: 'Jane',
      lastName: 'Test',
      name: 'Jane Test',
      email: 'jane.test@example.com',
      phone: '+15555551234',
      source: 'Website Test',
      tags: ['test-appointment', 'microblading']
    };

    const contactResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contactData,
          locationId
        })
      }
    );

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      throw new Error(`Failed to create contact: ${contactResponse.status} - ${errorText}`);
    }

    const contactResult = await contactResponse.json();
    const contactId = contactResult.contact.id;
    
    console.log(`   ✅ Contact created: ${contactId}`);
    console.log(`   Name: ${contactData.name}`);
    console.log(`   Email: ${contactData.email}\n`);

    // Step 2: Create appointment
    console.log('📅 Step 2: Creating test appointment...');

    // Set appointment for tomorrow at 2:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 30, 0, 0); // 1.5 hour appointment

    const appointmentData = {
      locationId,
      contactId,
      calendarId: 'JvcOyRMMYoIPbH5s1Bg1', // Service Calendar
      title: 'Microblading - Jane Test',
      appointmentStatus: 'confirmed',
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      notes: 'Test appointment created via import script. Service: Microblading, Price: $450, Deposit: Paid'
    };

    const appointmentResponse = await fetch(
      `https://services.leadconnectorhq.com/calendars/events/appointments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      }
    );

    if (!appointmentResponse.ok) {
      const errorText = await appointmentResponse.text();
      throw new Error(`Failed to create appointment: ${appointmentResponse.status} - ${errorText}`);
    }

    const appointmentResult = await appointmentResponse.json();
    const appointmentId = appointmentResult.id;

    console.log(`   ✅ Appointment created: ${appointmentId}`);
    console.log(`   Title: ${appointmentData.title}`);
    console.log(`   Date: ${tomorrow.toLocaleDateString()}`);
    console.log(`   Time: ${tomorrow.toLocaleTimeString()}`);
    console.log(`   Duration: 1.5 hours`);
    console.log(`   Calendar: Service Calendar\n`);

    console.log('='.repeat(80));
    console.log('✅ TEST APPOINTMENT CREATED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log();
    console.log('📋 Details:');
    console.log(`   Contact ID: ${contactId}`);
    console.log(`   Appointment ID: ${appointmentId}`);
    console.log(`   Service: Microblading`);
    console.log(`   Client: Jane Test`);
    console.log(`   Date: ${tomorrow.toLocaleDateString()}`);
    console.log(`   Time: ${tomorrow.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
    console.log();
    console.log('🎯 Next Steps:');
    console.log('   1. Run: npm run list-ghl-appointments');
    console.log('      (You should see the test appointment)');
    console.log();
    console.log('   2. Run: npm run import-ghl-appointments');
    console.log('      (This will import the appointment to your website)');
    console.log();
    console.log('   3. Check your admin dashboard → Calendar tab');
    console.log('      (The appointment should appear there)');
    console.log();
    console.log('💡 Tip: You can also view this appointment in your GHL calendar!');
    console.log();

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Details:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
createTestAppointment()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
