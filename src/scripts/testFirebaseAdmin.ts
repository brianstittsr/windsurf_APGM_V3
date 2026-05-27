import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getDb } from '../lib/firebase';

async function testFirebaseAdmin() {
  console.log('🔥 Testing Firebase Admin SDK and Firestore permissions...');
  
  try {
    // Test 1: Initialize Firebase Admin
    console.log('\n📋 1. Testing Firebase Admin initialization...');
    const db = getDb();
    console.log('✅ Firebase Admin initialized successfully');
    
    // Test 2: Test basic Firestore read access
    console.log('\n📋 2. Testing Firestore read access...');
    const testDoc = await getFirestore().collection('users').limit(1).get();
    console.log(`✅ Successfully read ${testDoc.size} documents from users collection`);
    
    // Test 3: Test specific user query
    console.log('\n📋 3. Testing client user query...');
    const clientsQuery = await getFirestore()
      .collection('users')
      .where('role', '==', 'client')
      .limit(3)
      .get();
    
    console.log(`✅ Found ${clientsQuery.size} client users`);
    
    if (clientsQuery.size > 0) {
      const firstClient = clientsQuery.docs[0].data();
      console.log(`✅ Sample client data: ${firstClient.profile?.firstName || 'N/A'} ${firstClient.profile?.lastName || 'N/A'}`);
    }
    
    // Test 4: Test write permissions
    console.log('\n📋 4. Testing Firestore write permissions...');
    const testRef = getFirestore().collection('test-permissions').doc('test-doc');
    await testRef.set({
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Successfully wrote test document');
    
    // Clean up test document
    await testRef.delete();
    console.log('✅ Successfully deleted test document');
    
    console.log('\n🎉 All Firebase Admin tests passed!');
    console.log('✅ Firebase permissions are properly configured');
    
  } catch (error) {
    console.error('\n❌ Firebase Admin test failed:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Permission denied - Check:');
      console.log('   1. Firebase project settings');
      console.log('   2. Service account permissions');
      console.log('   3. Firestore security rules');
    } else if (error.code === 'app/not-authorized') {
      console.log('\n🔧 Authorization failed - Check:');
      console.log('   1. Service account key file');
      console.log('   2. GOOGLE_APPLICATION_CREDENTIALS environment variable');
      console.log('   3. Firebase Admin SDK initialization');
    }
    
    process.exit(1);
  }
}

// Run the test
testFirebaseAdmin();
