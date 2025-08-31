const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkAndCreateCoupons() {
  console.log('🔍 Checking existing coupons...');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Check existing coupons
    const couponsRef = collection(db, 'coupons');
    const snapshot = await getDocs(couponsRef);
    
    console.log(`📊 Found ${snapshot.size} existing coupons:`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.code}: ${data.description} (${data.type}, ${data.value}${data.type === 'percentage' ? '%' : '$'})`);
    });

    // Check if OPENNOW exists
    const openNowExists = snapshot.docs.some(doc => doc.data().code === 'OPENNOW');
    const grandOpenExists = snapshot.docs.some(doc => doc.data().code === 'GRANDOPEN');

    if (!openNowExists) {
      console.log('\n🆕 Creating OPENNOW coupon...');
      await addDoc(couponsRef, {
        code: 'OPENNOW',
        type: 'percentage',
        value: 20,
        description: 'Grand Opening Special - 20% Off',
        minOrderAmount: 0,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        expirationDate: Timestamp.fromDate(new Date('2025-12-31')),
        applicableServices: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ OPENNOW coupon created');
    } else {
      console.log('✅ OPENNOW coupon already exists');
    }

    if (!grandOpenExists) {
      console.log('\n🆕 Creating GRANDOPEN coupon...');
      await addDoc(couponsRef, {
        code: 'GRANDOPEN',
        type: 'percentage', 
        value: 25,
        description: 'Grand Opening Special - 25% Off',
        minOrderAmount: 0,
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
        expirationDate: Timestamp.fromDate(new Date('2025-12-31')),
        applicableServices: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ GRANDOPEN coupon created');
    } else {
      console.log('✅ GRANDOPEN coupon already exists');
    }

    // Check gift cards too
    const giftCardsRef = collection(db, 'giftCards');
    const giftSnapshot = await getDocs(giftCardsRef);
    
    console.log(`\n🎁 Found ${giftSnapshot.size} existing gift cards:`);
    
    giftSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.code}: $${(data.remainingAmount / 100).toFixed(2)} remaining`);
    });

    // Check if GRANDOPEN gift card exists
    const grandOpenGiftExists = giftSnapshot.docs.some(doc => doc.data().code === 'GRANDOPEN');

    if (!grandOpenGiftExists) {
      console.log('\n🆕 Creating GRANDOPEN gift card...');
      await addDoc(giftCardsRef, {
        code: 'GRANDOPEN',
        originalAmount: 10000, // $100.00 in cents
        remainingAmount: 10000,
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        purchaserName: 'Admin',
        purchaserEmail: 'admin@aprettygirlmatter.com',
        message: 'Grand Opening Gift Card',
        isActive: true,
        isRedeemed: false,
        expirationDate: Timestamp.fromDate(new Date('2025-12-31')),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ GRANDOPEN gift card created');
    } else {
      console.log('✅ GRANDOPEN gift card already exists');
    }

    console.log('\n🎉 Coupon and gift card check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

require('dotenv').config({ path: '.env.local' });
checkAndCreateCoupons();
