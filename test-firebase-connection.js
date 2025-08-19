require('dotenv').config({ path: '.env.local' });

console.log('Environment variables:');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testConnection() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Testing connection to services collection...');
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    
    console.log(`Found ${snapshot.size} services`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name}: $${data.price} (Order: ${data.order || 'N/A'}, Active: ${data.isActive})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Firebase connection error:', error);
    process.exit(1);
  }
}

testConnection();
