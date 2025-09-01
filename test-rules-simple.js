const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testRules() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Test public collections
    console.log('Testing services collection (should be public)...');
    const servicesRef = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesRef);
    console.log(`✅ Services: ${servicesSnapshot.size} documents`);

    console.log('Testing reviews collection (should be public)...');
    const reviewsRef = collection(db, 'reviews');
    const reviewsSnapshot = await getDocs(reviewsRef);
    console.log(`✅ Reviews: ${reviewsSnapshot.size} documents`);

    console.log('Testing users collection (should be restricted)...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    console.log(`⚠️ Users: ${usersSnapshot.size} documents (should be restricted)`);

  } catch (error) {
    if (error.message.includes('Missing or insufficient permissions')) {
      console.log('✅ Security working - permissions required');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

require('dotenv').config({ path: '.env.local' });
testRules();
