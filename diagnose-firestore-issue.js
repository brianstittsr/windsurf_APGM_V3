const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Diagnosing Firestore connection issue...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
console.log(`Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);
console.log(`API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing'}`);
console.log(`App ID: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Present' : 'Missing'}\n`);

// Check if we're accidentally connecting to emulator
console.log('🔧 Checking for emulator configuration...');
const isEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
console.log(`Emulator Host: ${isEmulatorHost || 'Not set'}\n`);

// Initialize Firebase
try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  console.log('🚀 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
  console.log(`Database instance: ${db.app.name}`);
  
  // Check if this might be a project ID issue
  if (firebaseConfig.projectId !== 'aprettygirlmatterllc') {
    console.log(`⚠️  Project ID mismatch: Expected 'aprettygirlmatterllc', got '${firebaseConfig.projectId}'`);
  }
  
} catch (error) {
  console.log('❌ Firebase initialization error:', error.message);
}

console.log('\n🔍 Possible causes of "Invalid resource field value":');
console.log('1. Project ID mismatch or incorrect');
console.log('2. Firestore database not created in Firebase Console');
console.log('3. API keys for wrong project');
console.log('4. Firestore emulator accidentally enabled');
console.log('5. Regional database location issue');

console.log('\n🛠️  Next steps:');
console.log('1. Verify project ID in Firebase Console matches .env.local');
console.log('2. Check Firestore database exists in Firebase Console');
console.log('3. Ensure API keys are for the correct project');
console.log('4. Try creating a simple document via Firebase Console');
