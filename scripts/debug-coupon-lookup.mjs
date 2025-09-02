import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aprettygirlmatterllc'
});

const db = admin.firestore();

async function debugCouponLookup() {
  try {
    console.log('🔍 Debugging coupon lookup for BIGED...');
    
    // Check all coupons
    const couponsRef = db.collection('coupons');
    const allCoupons = await couponsRef.get();
    
    console.log(`📋 Found ${allCoupons.size} total coupons:`);
    allCoupons.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.code}: ${data.description} (${data.type}, ${data.value}${data.type === 'percentage' ? '%' : '$'}) - Active: ${data.isActive}`);
    });

    // Test specific lookup for BIGED
    console.log('\n🔍 Testing BIGED lookup...');
    const bigedQuery = await couponsRef.where('code', '==', 'BIGED').get();
    
    if (bigedQuery.empty) {
      console.log('❌ BIGED coupon not found with exact match');
      
      // Try case variations
      const variations = ['biged', 'Biged', 'BIGED'];
      for (const variation of variations) {
        const varQuery = await couponsRef.where('code', '==', variation).get();
        if (!varQuery.empty) {
          console.log(`✅ Found coupon with code: ${variation}`);
          varQuery.docs.forEach(doc => {
            const data = doc.data();
            console.log(`  Data: ${JSON.stringify(data, null, 2)}`);
          });
        }
      }
    } else {
      console.log('✅ BIGED coupon found:');
      bigedQuery.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  Data: ${JSON.stringify(data, null, 2)}`);
      });
    }

    // Create BIGED coupon for testing
    console.log('\n🔧 Creating BIGED test coupon...');
    await couponsRef.add({
      code: 'BIGED',
      type: 'percentage',
      value: 10,
      description: 'Test Coupon - 10% Off',
      isActive: true,
      usageLimit: null,
      usageCount: 0,
      minOrderAmount: 0,
      expirationDate: admin.firestore.Timestamp.fromDate(new Date('2025-12-31')),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    console.log('✅ BIGED test coupon created successfully');
    
  } catch (error) {
    console.error('❌ Error debugging coupon lookup:', error);
  }
}

debugCouponLookup();
