import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      // Check if we have the required environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      // If we're missing any of the required fields, use a demo configuration
      if (!projectId || !clientEmail || !privateKey) {
        console.warn('⚠️ Firebase Admin environment variables not configured properly.');
        console.log('📝 Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.');
        
        // For build time, use a minimal configuration that won't throw errors
        initializeApp({
          projectId: projectId || 'demo-project',
        });
        return;
      }
      
      // Initialize with full service account credentials
      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };

      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }
}

// Initialize on import
initializeFirebaseAdmin();

// Export the Firebase Admin services
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();

export default { auth, db, storage };
