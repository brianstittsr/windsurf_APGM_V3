import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Check if Firebase environment variables are configured
const isFirebaseConfigured = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  // Check if we have real Firebase config (not demo values)
  const hasRealConfig = !!(apiKey && 
    authDomain && 
    projectId && 
    apiKey !== 'demo-api-key' &&
    authDomain !== 'aprettygirlmatterllc.firebaseapp.com' &&
    projectId !== 'aprettygirlmatterllc');
    
  return hasRealConfig;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aprettygirlmatterllc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aprettygirlmatterllc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// Initialize Firebase app (only once)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services with error handling
let db, auth, storage;

try {
  // Always initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  if (!isFirebaseConfigured()) {
    // Development mode warning
    console.warn('⚠️ Firebase environment variables not configured. Using demo configuration.');
    console.log('📝 Please copy env-template.txt to .env.local and configure your Firebase project.');
    console.log('🔗 Project setup: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc');
    
    // Connect to emulators in development if available
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        // Emulators already connected or not available
        console.log('Firebase emulators not available or already connected.');
      }
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Re-throw the error so it can be handled by the calling code
  throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

export { db, auth, storage, isFirebaseConfigured };
export default app;
