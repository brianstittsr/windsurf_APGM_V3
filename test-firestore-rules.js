const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs, addDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirestoreRules() {
  console.log('🔥 Testing Firestore Rules...\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    console.log('✅ Firebase initialized successfully');

    // Test 1: Try to access userActivities collection (should fail without auth)
    console.log('\n📋 Test 1: Accessing userActivities without authentication...');
    try {
      const userActivitiesRef = collection(db, 'userActivities');
      const snapshot = await getDocs(userActivitiesRef);
      console.log('❌ UNEXPECTED: Access granted without authentication');
    } catch (error) {
      console.log('✅ EXPECTED: Access denied without authentication');
      console.log(`   Error: ${error.code}`);
    }

    // Test 2: Try to access pdfDocuments collection (should fail without auth)
    console.log('\n📄 Test 2: Accessing pdfDocuments without authentication...');
    try {
      const pdfDocsRef = collection(db, 'pdfDocuments');
      const snapshot = await getDocs(pdfDocsRef);
      console.log('❌ UNEXPECTED: Access granted without authentication');
    } catch (error) {
      console.log('✅ EXPECTED: Access denied without authentication');
      console.log(`   Error: ${error.code}`);
    }

    // Test 3: Try to access services collection (should fail without auth)
    console.log('\n🛠️ Test 3: Accessing services without authentication...');
    try {
      const servicesRef = collection(db, 'services');
      const snapshot = await getDocs(servicesRef);
      console.log('❌ UNEXPECTED: Access granted without authentication');
    } catch (error) {
      console.log('✅ EXPECTED: Access denied without authentication');
      console.log(`   Error: ${error.code}`);
    }

    console.log('\n🎯 Rules Test Summary:');
    console.log('- If all tests show "EXPECTED: Access denied", your rules are deployed correctly');
    console.log('- If any test shows "UNEXPECTED: Access granted", your rules may not be deployed');
    console.log('\n💡 Next step: Test with authentication by logging into your app');

  } catch (error) {
    console.error('❌ Error testing Firestore rules:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testFirestoreRules();
