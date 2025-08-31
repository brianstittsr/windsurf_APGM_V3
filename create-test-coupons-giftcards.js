const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function createTestData() {
  console.log('🔧 Creating test coupons and gift cards...');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Check if OPENNOW coupon exists
    const couponsRef = collection(db, 'coupons');
    const openNowQuery = query(couponsRef, where('code', '==', 'OPENNOW'));
    const openNowSnapshot = await getDocs(openNowQuery);

    if (openNowSnapshot.empty) {
      console.log('📝 Creating OPENNOW coupon...');
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
      console.log('✅ OPENNOW coupon created successfully');
    } else {
      console.log('✅ OPENNOW coupon already exists');
    }

    // Check if test gift card exists
    const giftCardsRef = collection(db, 'giftCards');
    const testGiftQuery = query(giftCardsRef, where('code', '==', 'TESTGIFT100'));
    const testGiftSnapshot = await getDocs(testGiftQuery);

    if (testGiftSnapshot.empty) {
      console.log('🎁 Creating test gift card...');
      await addDoc(giftCardsRef, {
        code: 'TESTGIFT100',
        originalAmount: 10000, // $100.00 in cents
        remainingAmount: 10000,
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        purchaserName: 'Admin',
        purchaserEmail: 'admin@aprettygirlmatter.com',
        message: 'Test Gift Card for Discount Testing',
        isActive: true,
        isRedeemed: false,
        expirationDate: Timestamp.fromDate(new Date('2025-12-31')),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Test gift card created successfully');
    } else {
      console.log('✅ Test gift card already exists');
    }

    // Test discount calculations
    console.log('\n🧮 Testing discount calculations:');
    
    const servicePrice = 500; // $500 service
    console.log(`Service price: $${servicePrice}`);
    
    // Test coupon discount (20% off)
    const couponDiscount = (servicePrice * 20) / 100;
    console.log(`Coupon discount (20%): $${couponDiscount}`);
    
    // Test gift card discount ($100)
    const giftCardDiscount = Math.min(100, servicePrice);
    console.log(`Gift card discount: $${giftCardDiscount}`);
    
    const totalDiscounts = couponDiscount + giftCardDiscount;
    const discountedPrice = Math.max(0, servicePrice - totalDiscounts);
    
    console.log(`Total discounts: $${totalDiscounts}`);
    console.log(`Final discounted price: $${discountedPrice}`);
    
    const taxRate = 0.0775;
    const tax = Math.round(discountedPrice * taxRate * 100) / 100;
    const depositAmount = 200;
    
    // Calculate correct Stripe fee using the same logic as the app
    const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9%
    const STRIPE_FIXED_FEE = 0.30; // $0.30
    const chargedAmount = (depositAmount + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
    const stripeFee = Math.round((chargedAmount - depositAmount) * 100) / 100;
    
    const totalAmount = discountedPrice + tax + stripeFee;
    const remainingAmount = Math.max(0, discountedPrice + tax - depositAmount);
    
    console.log(`\n💰 Final calculation:`);
    console.log(`   Discounted service: $${discountedPrice}`);
    console.log(`   Tax (7.75%): $${tax}`);
    console.log(`   Stripe fee: $${stripeFee}`);
    console.log(`   Total: $${totalAmount}`);
    console.log(`   Due today: $${depositAmount + stripeFee}`);
    console.log(`   Remaining: $${remainingAmount}`);
    
    console.log('\n🎉 Test data creation and calculations complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestData();
