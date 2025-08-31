// Test script to verify Firestore permissions after rules deployment
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testFirestorePermissions() {
  try {
    console.log('🔥 Testing Firestore Permissions...\n');

    // Test 1: Try to access services (should work for authenticated users)
    console.log('📋 Testing services collection access...');
    try {
      const servicesRef = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesRef);
      console.log('✅ Services collection accessible');
      console.log(`   Found ${servicesSnapshot.size} services\n`);
    } catch (error) {
      console.log('❌ Services collection access failed:', error.message);
    }

    // Test 2: Try to access user activities (should require authentication)
    console.log('📊 Testing userActivities collection access...');
    try {
      const activitiesRef = collection(db, 'userActivities');
      const activitiesSnapshot = await getDocs(activitiesRef);
      console.log('✅ UserActivities collection accessible');
      console.log(`   Found ${activitiesSnapshot.size} activities\n`);
    } catch (error) {
      console.log('❌ UserActivities collection access failed:', error.message);
      console.log('   This is expected if not authenticated or no permission\n');
    }

    // Test 3: Try to access PDF documents (should require authentication)
    console.log('📄 Testing pdfDocuments collection access...');
    try {
      const pdfRef = collection(db, 'pdfDocuments');
      const pdfSnapshot = await getDocs(pdfRef);
      console.log('✅ PDFDocuments collection accessible');
      console.log(`   Found ${pdfSnapshot.size} documents\n`);
    } catch (error) {
      console.log('❌ PDFDocuments collection access failed:', error.message);
      console.log('   This is expected if not authenticated or no permission\n');
    }

    // Test 4: Try to access users collection (should require authentication)
    console.log('👥 Testing users collection access...');
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      console.log('✅ Users collection accessible');
      console.log(`   Found ${usersSnapshot.size} users\n`);
    } catch (error) {
      console.log('❌ Users collection access failed:', error.message);
      console.log('   This is expected if not authenticated or no permission\n');
    }

    console.log('🎉 Firestore permissions test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy the updated firestore.rules to Firebase Console');
    console.log('2. Test with authenticated user (admin@example.com)');
    console.log('3. Verify dashboard loads without permission errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFirestorePermissions();
