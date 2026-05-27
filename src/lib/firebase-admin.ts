import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      // Try to use service account file first
      const serviceAccountPath = './serviceAccountKey.json';
      const path = require('path');
      const fullPath = path.resolve(__dirname, '../../..', serviceAccountPath);
      
      try {
        // Check if service account file exists
        const fs = require('fs');
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require(serviceAccountPath);
          
          initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id,
            storageBucket: `${serviceAccount.project_id}.appspot.com`,
          });
          
          console.log('✅ Firebase Admin SDK initialized with service account file');
          return;
        }
      } catch (fileError) {
        console.log('Service account file not found, trying environment variables...');
      }
      
      // Fall back to environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!projectId || !clientEmail || !privateKey) {
        console.warn('⚠️ Firebase Admin not properly configured.');
        console.log('📝 Using minimal configuration for build compatibility.');
        
        initializeApp({
          projectId: projectId || 'demo-project',
        });
        return;
      }
      
      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };

      initializeApp({
        credential: cert(serviceAccount),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
      
      console.log('✅ Firebase Admin SDK initialized with environment variables');
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
