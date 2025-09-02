import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function fixOpenNowCoupon() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Finding OPENNOW coupon...');
    
    const couponsRef = collection(db, 'coupons');
    const openNowQuery = query(couponsRef, where('code', '==', 'OPENNOW'));
    const snapshot = await getDocs(openNowQuery);

    if (snapshot.empty) {
      console.log('❌ OPENNOW coupon not found');
      return;
    }

    const couponDoc = snapshot.docs[0];
    const currentData = couponDoc.data();
    
    console.log('📋 Current coupon data:');
    console.log(`  - Code: ${currentData.code}`);
    console.log(`  - Current discount: ${currentData.value}%`);
    console.log(`  - Description: ${currentData.description}`);

    console.log('🔧 Updating OPENNOW coupon to 95% discount...');
    
    await updateDoc(doc(db, 'coupons', couponDoc.id), {
      value: 95,
      description: 'Grand Opening Special - 95% Off',
      updatedAt: new Date()
    });

    console.log('✅ OPENNOW coupon updated successfully!');
    console.log('💰 New discount: 95% off');
    
  } catch (error) {
    console.error('❌ Error updating coupon:', error);
  }
}

fixOpenNowCoupon();
