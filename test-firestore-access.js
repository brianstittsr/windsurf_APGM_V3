const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirestoreAccess() {
  console.log('🔍 Testing Firestore access...');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Test 1: Services collection (should be publicly readable)
  try {
    console.log('\n📋 Testing services collection...');
    const servicesQuery = query(collection(db, 'services'), limit(3));
    const servicesSnapshot = await getDocs(servicesQuery);
    console.log(`✅ Services: ${servicesSnapshot.size} documents found`);
    
    servicesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name}: $${data.price}`);
    });
  } catch (error) {
    console.log(`❌ Services error: ${error.message}`);
  }
  
  // Test 2: Reviews collection (should be publicly readable)
  try {
    console.log('\n⭐ Testing reviews collection...');
    const reviewsQuery = query(collection(db, 'reviews'), limit(3));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    console.log(`✅ Reviews: ${reviewsSnapshot.size} documents found`);
    
    reviewsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.customerName}: ${data.rating} stars`);
    });
  } catch (error) {
    console.log(`❌ Reviews error: ${error.message}`);
  }
  
  // Test 3: Coupons collection (authentication required)
  try {
    console.log('\n🎫 Testing coupons collection...');
    const couponsQuery = query(collection(db, 'coupons'), limit(3));
    const couponsSnapshot = await getDocs(couponsQuery);
    console.log(`⚠️  Coupons: ${couponsSnapshot.size} documents (should require auth)`);
    
    couponsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.code}: ${data.value}${data.type === 'percentage' ? '%' : '$'} off`);
    });
  } catch (error) {
    if (error.message.includes('Missing or insufficient permissions')) {
      console.log(`✅ Coupons properly secured: ${error.message}`);
    } else {
      console.log(`❌ Coupons error: ${error.message}`);
    }
  }
  
  // Test 4: Users collection (should be restricted)
  try {
    console.log('\n👤 Testing users collection...');
    const usersQuery = query(collection(db, 'users'), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    console.log(`⚠️  Users: ${usersSnapshot.size} documents (should be restricted)`);
  } catch (error) {
    if (error.message.includes('Missing or insufficient permissions')) {
      console.log(`✅ Users properly secured: ${error.message}`);
    } else {
      console.log(`❌ Users error: ${error.message}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('If services and reviews are accessible but users/coupons are restricted,');
  console.log('then Firestore rules are deployed correctly.');
}

require('dotenv').config({ path: '.env.local' });
testFirestoreAccess().catch(console.error);
