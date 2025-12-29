import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Check if Firebase environment variables are configured
const isFirebaseConfigured = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  // Check if we have real Firebase config (not demo/placeholder values)
  const hasRealConfig = !!(apiKey && 
    authDomain && 
    projectId && 
    apiKey !== 'demo-api-key' &&
    apiKey !== 'your_api_key_here' &&
    authDomain !== 'your_project_id.firebaseapp.com' &&
    projectId !== 'your_project_id');
    
  return hasRealConfig;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aprettygirlmatterllc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aprettygirlmatterllc.firebasestorage.app',
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
const auth = getAuth(app);
const storage = getStorage(app);

// Export a function to get the Firestore instance, preventing singleton issues
const getDb = () => getFirestore(app);

try {
  // Connect to emulators in development if configured
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    const db = getDb();
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔥 Connected to Firebase emulators');
  }
} catch (error) {
  // This will catch if emulators are already running, which is fine.
  console.log('ℹ️ Firebase emulators not available or already connected.');
}

export { getDb, auth, storage, isFirebaseConfigured };
export default app;
