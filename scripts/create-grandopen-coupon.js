const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  // Make sure to use environment variables in production
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createGrandOpenCoupon() {
  try {
    // Set expiration date to 3 months from now
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

    const couponData = {
      code: 'GRANDOPEN250',
      description: 'Grand Opening Special - Any service for $250',
      type: 'exact_amount',
      value: 250, // This will be the exact amount to charge
      exactAmount: 250, // This will set the price to exactly $250
      minOrderAmount: 0, // No minimum order amount
      usageLimit: 100, // Limit to 100 uses
      usageCount: 0,
      isActive: true,
      expirationDate: expirationDate,
      applicableServices: [], // Empty array means it applies to all services
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'coupons'), couponData);
    console.log('✅ Coupon created with ID: ', docRef.id);
    console.log('Coupon Code: GRANDOPEN250');
    console.log('Description:', couponData.description);
    console.log('Expires on:', expirationDate.toDateString());
    console.log('Usage Limit:', couponData.usageLimit);
    console.log('\n🎉 Coupon created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    process.exit(1);
  }
}

// Run the function
createGrandOpenCoupon();
