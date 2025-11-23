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

async function listGHLCalendars() {
  try {
    console.log('🔍 Fetching GHL Calendars...\n');

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

    // Fetch calendars from GHL
    console.log('📋 Fetching calendars from GoHighLevel...\n');
    
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
    const calendars = data.calendars || [];

    if (calendars.length === 0) {
      console.log('ℹ️  No calendars found in GHL');
      process.exit(0);
    }

    console.log('='.repeat(80));
    console.log(`📅 FOUND ${calendars.length} CALENDAR(S)`);
    console.log('='.repeat(80));
    console.log();

    calendars.forEach((calendar: any, index: number) => {
      console.log(`Calendar ${index + 1}:`);
      console.log(`  Name:        ${calendar.name || 'Unnamed'}`);
      console.log(`  ID:          ${calendar.id}`);
      console.log(`  Description: ${calendar.description || 'N/A'}`);
      console.log(`  Status:      ${calendar.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`  Slug:        ${calendar.slug || 'N/A'}`);
      console.log();
    });

    console.log('='.repeat(80));
    console.log('📋 CALENDAR IDS (for easy copy/paste):');
    console.log('='.repeat(80));
    console.log();

    calendars.forEach((calendar: any) => {
      console.log(`${calendar.name}: ${calendar.id}`);
    });

    console.log();
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
listGHLCalendars()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
