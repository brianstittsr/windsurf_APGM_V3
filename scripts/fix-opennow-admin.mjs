import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aprettygirlmatterllc'
});

const db = admin.firestore();

async function fixOpenNowCoupon() {
  try {
    console.log('🔍 Finding OPENNOW coupon...');
    
    const couponsRef = db.collection('coupons');
    const snapshot = await couponsRef.where('code', '==', 'OPENNOW').get();

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
    
    await couponDoc.ref.update({
      value: 95,
      description: 'Grand Opening Special - 95% Off',
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('✅ OPENNOW coupon updated successfully!');
    console.log('💰 New discount: 95% off');
    
  } catch (error) {
    console.error('❌ Error updating coupon:', error);
  }
}

fixOpenNowCoupon();
