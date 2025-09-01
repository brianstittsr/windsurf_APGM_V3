const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testReviewsRules() {
  console.log('🔍 Testing reviews collection rules...');
  console.log(`Project: ${firebaseConfig.projectId}\n`);
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Test 1: Read all reviews (should work if rules allow public read)
    console.log('📋 Testing public read access to reviews...');
    const reviewsRef = collection(db, 'reviews');
    const allReviewsQuery = query(reviewsRef, limit(5));
    
    const snapshot = await getDocs(allReviewsQuery);
    console.log(`✅ SUCCESS: Found ${snapshot.size} reviews`);
    
    if (snapshot.size > 0) {
      console.log('\n📝 Review samples:');
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.customerName || 'Anonymous'}: ${data.rating || 'N/A'} stars`);
        console.log(`     "${(data.reviewText || '').substring(0, 50)}..."`);
        console.log(`     Approved: ${data.isApproved}, Visible: ${data.isVisible}`);
      });
    }
    
    // Test 2: Try to read only approved and visible reviews
    console.log('\n⭐ Testing filtered read (approved + visible)...');
    const approvedQuery = query(
      reviewsRef, 
      where('isApproved', '==', true),
      where('isVisible', '==', true),
      limit(3)
    );
    
    const approvedSnapshot = await getDocs(approvedQuery);
    console.log(`✅ SUCCESS: Found ${approvedSnapshot.size} approved & visible reviews`);
    
    console.log('\n🎉 REVIEWS RULES STATUS: ✅ WORKING');
    console.log('- Public read access is enabled');
    console.log('- Reviews collection is accessible');
    console.log('- Filtering by approval/visibility works');
    
  } catch (error) {
    console.log(`❌ REVIEWS RULES STATUS: FAILED`);
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes('Missing or insufficient permissions')) {
      console.log('\n🚨 ISSUE: Reviews rules not deployed or incorrect');
      console.log('- Reviews collection is blocked');
      console.log('- Public read access not enabled');
      console.log('- Rules need to be deployed via Firebase Console');
    } else {
      console.log('\n⚠️  Other issue:', error.message);
    }
  }
}

// Set timeout to prevent hanging
const timeout = setTimeout(() => {
  console.log('\n⏰ Test timed out - likely connection or rules issue');
  process.exit(1);
}, 10000);

testReviewsRules().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error('Test failed:', error.message);
  process.exit(1);
});
