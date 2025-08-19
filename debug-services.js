const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();

async function debugServices() {
  try {
    console.log('Checking services in Firebase...');
    
    const servicesRef = db.collection('services');
    const snapshot = await servicesRef.get();
    
    console.log(`Found ${snapshot.size} services in database`);
    
    if (snapshot.empty) {
      console.log('No services found in database');
    } else {
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Service: ${data.name} - Price: $${data.price} - Active: ${data.isActive} - Order: ${data.order || 'N/A'}`);
      });
    }
    
    // Check active services specifically
    const activeSnapshot = await servicesRef.where('isActive', '==', true).get();
    console.log(`\nActive services: ${activeSnapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking services:', error);
    process.exit(1);
  }
}

debugServices();
