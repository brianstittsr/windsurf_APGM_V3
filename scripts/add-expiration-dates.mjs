import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aprettygirlmatterllc'
});

const db = admin.firestore();

async function addExpirationDates() {
  try {
    console.log('🔍 Adding expiration dates to existing coupons...');
    
    const couponsRef = db.collection('coupons');
    const snapshot = await couponsRef.get();

    if (snapshot.empty) {
      console.log('❌ No coupons found');
      return;
    }

    // Set expiration date to 30 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    console.log(`📅 Setting expiration date to: ${expirationDate.toLocaleDateString()}`);

    const batch = db.batch();
    let updateCount = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`📋 Updating coupon: ${data.code}`);
      
      batch.update(doc.ref, {
        expirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
        updatedAt: admin.firestore.Timestamp.now()
      });
      updateCount++;
    });

    await batch.commit();
    console.log(`✅ Updated ${updateCount} coupons with expiration dates`);
    
  } catch (error) {
    console.error('❌ Error adding expiration dates:', error);
  }
}

addExpirationDates();
