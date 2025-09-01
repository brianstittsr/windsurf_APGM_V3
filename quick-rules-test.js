// Quick Firestore rules test
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

const db = getFirestore(app);

console.log('Testing Firestore rules...');

// Test public access to a service document
getDoc(doc(db, 'services', 'test')).then(() => {
  console.log('✅ Services accessible (rules likely deployed)');
}).catch(err => {
  if (err.message.includes('Missing or insufficient permissions')) {
    console.log('❌ Services blocked - rules may need deployment');
  } else {
    console.log('⚠️ Services test inconclusive:', err.message);
  }
}).finally(() => {
  process.exit(0);
});
