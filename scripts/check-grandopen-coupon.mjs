import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aprettygirlmatterllc'
});

const db = admin.firestore();

async function checkGrandOpenCoupon() {
  try {
    console.log('🔍 Checking GRANDOPEN coupon...');
    
    const couponsRef = db.collection('coupons');
    const snapshot = await couponsRef.where('code', '==', 'GRANDOPEN').get();

    if (snapshot.empty) {
      console.log('❌ GRANDOPEN coupon not found in database');
      console.log('🔧 Creating GRANDOPEN coupon...');
      
      await couponsRef.add({
        code: 'GRANDOPEN',
        type: 'percentage',
        value: 95,
        description: 'Grand Opening Special - 95% Off',
        isActive: true,
        usageLimit: null,
        usageCount: 0,
        expirationDate: null,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      console.log('✅ GRANDOPEN coupon created with 95% discount');
      return;
    }

    const couponDoc = snapshot.docs[0];
    const data = couponDoc.data();
    
    console.log('📋 GRANDOPEN coupon found:');
    console.log(`  - Code: ${data.code}`);
    console.log(`  - Type: ${data.type}`);
    console.log(`  - Value: ${data.value}%`);
    console.log(`  - Description: ${data.description}`);
    console.log(`  - Active: ${data.isActive}`);
    console.log(`  - Usage Count: ${data.usageCount || 0}`);
    console.log(`  - Usage Limit: ${data.usageLimit || 'Unlimited'}`);
    console.log(`  - Expires: ${data.expirationDate ? data.expirationDate.toDate() : 'Never'}`);

    // Check if it needs updating
    if (data.value !== 95) {
      console.log('🔧 Updating discount to 95%...');
      await couponDoc.ref.update({
        value: 95,
        description: 'Grand Opening Special - 95% Off',
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log('✅ GRANDOPEN coupon updated to 95% discount');
    }

    if (data.isActive === false) {
      console.log('⚠️  GRANDOPEN coupon is INACTIVE');
      console.log('🔧 Activating coupon...');
      await couponDoc.ref.update({
        isActive: true,
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log('✅ GRANDOPEN coupon activated');
    }
    
  } catch (error) {
    console.error('❌ Error checking coupon:', error);
  }
}

checkGrandOpenCoupon();
