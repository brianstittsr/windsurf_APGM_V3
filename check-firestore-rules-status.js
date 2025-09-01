/**
 * Check Firestore rules deployment status
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkFirestoreRulesStatus() {
  console.log('🔍 Checking Firestore rules deployment status...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Test collections that should be accessible with new rules
    const testResults = {
      reviews: { accessible: false, error: null },
      coupons: { accessible: false, error: null },
      giftCards: { accessible: false, error: null },
      services: { accessible: false, error: null },
      users: { accessible: false, error: null }
    };

    // Test reviews collection (should be publicly readable for approved reviews)
    try {
      console.log('📋 Testing reviews collection access...');
      const reviewsRef = collection(db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsRef);
      testResults.reviews.accessible = true;
      console.log(`✅ Reviews: ${reviewsSnapshot.size} documents accessible`);
    } catch (error) {
      testResults.reviews.error = error.message;
      console.log(`❌ Reviews: ${error.message}`);
    }

    // Test coupons collection (should be readable by authenticated users)
    try {
      console.log('🎫 Testing coupons collection access...');
      const couponsRef = collection(db, 'coupons');
      const couponsSnapshot = await getDocs(couponsRef);
      testResults.coupons.accessible = true;
      console.log(`✅ Coupons: ${couponsSnapshot.size} documents accessible`);
    } catch (error) {
      testResults.coupons.error = error.message;
      console.log(`❌ Coupons: ${error.message}`);
    }

    // Test gift cards collection
    try {
      console.log('🎁 Testing gift cards collection access...');
      const giftCardsRef = collection(db, 'giftCards');
      const giftCardsSnapshot = await getDocs(giftCardsRef);
      testResults.giftCards.accessible = true;
      console.log(`✅ Gift Cards: ${giftCardsSnapshot.size} documents accessible`);
    } catch (error) {
      testResults.giftCards.error = error.message;
      console.log(`❌ Gift Cards: ${error.message}`);
    }

    // Test services collection (should be publicly readable)
    try {
      console.log('💄 Testing services collection access...');
      const servicesRef = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesRef);
      testResults.services.accessible = true;
      console.log(`✅ Services: ${servicesSnapshot.size} documents accessible`);
    } catch (error) {
      testResults.services.error = error.message;
      console.log(`❌ Services: ${error.message}`);
    }

    // Test users collection (should require authentication)
    try {
      console.log('👤 Testing users collection access...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      testResults.users.accessible = true;
      console.log(`⚠️  Users: ${usersSnapshot.size} documents accessible (should require auth)`);
    } catch (error) {
      testResults.users.error = error.message;
      console.log(`✅ Users: Properly secured - ${error.message}`);
    }

    console.log('\n📊 Summary:');
    console.log('='.repeat(50));
    
    const accessibleCount = Object.values(testResults).filter(r => r.accessible).length;
    const totalTests = Object.keys(testResults).length;
    
    if (testResults.reviews.accessible && testResults.services.accessible) {
      console.log('✅ PUBLIC COLLECTIONS: Working correctly');
    } else {
      console.log('❌ PUBLIC COLLECTIONS: Issues detected');
    }
    
    if (testResults.users.error && testResults.users.error.includes('Missing or insufficient permissions')) {
      console.log('✅ SECURITY: User collection properly secured');
    } else {
      console.log('⚠️  SECURITY: User collection may not be properly secured');
    }

    console.log(`\n📈 Overall Status: ${accessibleCount}/${totalTests} collections accessible`);
    
    if (testResults.reviews.accessible && testResults.services.accessible && testResults.users.error) {
      console.log('🎉 FIRESTORE RULES APPEAR TO BE DEPLOYED CORRECTLY!');
    } else {
      console.log('⚠️  FIRESTORE RULES MAY NEED DEPLOYMENT OR UPDATES');
    }

  } catch (error) {
    console.error('❌ Error checking Firestore rules:', error);
  }
}

require('dotenv').config({ path: '.env.local' });
checkFirestoreRulesStatus();
