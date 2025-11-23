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

async function testGHLConnection() {
  console.log('🔍 Testing GoHighLevel Connection...\n');

  try {
    // Step 1: Check Firestore for GHL credentials
    console.log('📋 Step 1: Checking Firestore for GHL credentials...');
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    
    let apiKey = '';
    let locationId = '';

    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      apiKey = data?.apiKey || '';
      locationId = data?.locationId || '';
      
      if (apiKey && locationId) {
        console.log('✅ Found GHL credentials in Firestore');
        console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
        console.log(`   Location ID: ${locationId}`);
      } else {
        console.log('⚠️  GHL credentials incomplete in Firestore');
        if (!apiKey) console.log('   ❌ Missing API Key');
        if (!locationId) console.log('   ❌ Missing Location ID');
      }
    } else {
      console.log('⚠️  No GHL settings found in Firestore');
      console.log('   Checking environment variables...');
      
      apiKey = process.env.GHL_API_KEY || '';
      locationId = process.env.GHL_LOCATION_ID || '';
      
      if (apiKey && locationId) {
        console.log('✅ Found GHL credentials in environment variables');
        console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
        console.log(`   Location ID: ${locationId}`);
      } else {
        console.log('❌ No GHL credentials found in environment variables');
        if (!apiKey) console.log('   ❌ Missing GHL_API_KEY');
        if (!locationId) console.log('   ❌ Missing GHL_LOCATION_ID');
      }
    }

    if (!apiKey || !locationId) {
      console.log('\n❌ FAILED: GHL credentials not configured');
      console.log('\n📝 To fix this:');
      console.log('   1. Go to your website admin dashboard');
      console.log('   2. Navigate to GoHighLevel tab');
      console.log('   3. Enter your API Key and Location ID');
      console.log('   4. Click "Save Settings"');
      console.log('   5. Run this script again to verify');
      process.exit(1);
    }

    // Step 2: Test API Key by fetching locations
    console.log('\n📋 Step 2: Testing API Key with GHL API...');
    const locationsResponse = await fetch('https://services.leadconnectorhq.com/locations/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28'
      }
    });

    if (!locationsResponse.ok) {
      const errorText = await locationsResponse.text();
      console.log(`❌ API Key test failed: ${locationsResponse.status} ${locationsResponse.statusText}`);
      console.log(`   Error: ${errorText}`);
      console.log('\n📝 Possible issues:');
      console.log('   - API Key is invalid or expired');
      console.log('   - API Key doesn\'t have required permissions');
      console.log('   - Generate a new API key in GoHighLevel');
      process.exit(1);
    }

    const locationsData = await locationsResponse.json();
    console.log('✅ API Key is valid');
    console.log(`   Found ${locationsData.locations?.length || 0} location(s)`);

    // Step 3: Verify Location ID
    console.log('\n📋 Step 3: Verifying Location ID...');
    const locationExists = locationsData.locations?.some((loc: any) => loc.id === locationId);
    
    if (locationExists) {
      console.log('✅ Location ID is valid');
    } else {
      console.log('⚠️  Location ID not found in your locations');
      console.log('   Available locations:');
      locationsData.locations?.forEach((loc: any) => {
        console.log(`   - ${loc.name} (ID: ${loc.id})`);
      });
    }

    // Step 4: Test Contact Creation (dry run)
    console.log('\n📋 Step 4: Testing contact creation permissions...');
    const testContactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId,
        name: 'Test Contact (Delete Me)',
        email: `test-${Date.now()}@example.com`,
        phone: '+15551234567',
        tags: ['Test'],
        source: 'API Test'
      })
    });

    if (testContactResponse.ok) {
      const contactData = await testContactResponse.json();
      console.log('✅ Contact creation successful');
      console.log(`   Created test contact: ${contactData.contact.id}`);
      console.log('   ⚠️  Please delete this test contact from GHL');
    } else {
      const errorText = await testContactResponse.text();
      console.log(`⚠️  Contact creation failed: ${testContactResponse.status}`);
      console.log(`   Error: ${errorText}`);
      console.log('   Your API key may not have contacts.write permission');
    }

    // Step 5: Check for existing bookings
    console.log('\n📋 Step 5: Checking for bookings in Firestore...');
    const bookingsSnapshot = await db.collection('bookings').limit(5).get();
    
    if (bookingsSnapshot.empty) {
      console.log('⚠️  No bookings found in database');
      console.log('   Create a test booking to test sync:');
      console.log('   npm run create-sample-booking');
    } else {
      console.log(`✅ Found ${bookingsSnapshot.size} booking(s)`);
      bookingsSnapshot.forEach(doc => {
        const booking = doc.data();
        console.log(`   - ${booking.clientName} - ${booking.serviceName} (${booking.date})`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ GHL API Key: Valid');
    console.log(`${locationExists ? '✅' : '⚠️ '} Location ID: ${locationExists ? 'Valid' : 'Not found'}`);
    console.log(`${testContactResponse.ok ? '✅' : '⚠️ '} Contact Permissions: ${testContactResponse.ok ? 'Working' : 'Limited'}`);
    console.log(`${bookingsSnapshot.empty ? '⚠️ ' : '✅'} Bookings: ${bookingsSnapshot.empty ? 'None (create test booking)' : `${bookingsSnapshot.size} found`}`);
    console.log('='.repeat(60));

    if (locationExists && testContactResponse.ok && !bookingsSnapshot.empty) {
      console.log('\n🎉 SUCCESS! Your GHL integration is properly configured!');
      console.log('   You can now sync bookings from the Calendar tab.');
    } else {
      console.log('\n⚠️  Some issues detected. Review the messages above.');
    }

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    if (error instanceof Error) {
      console.error('   Details:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testGHLConnection()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
