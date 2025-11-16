const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Example GHL API key - replace with your actual key
const GHL_API_KEY = 'YOUR_GHL_API_KEY_HERE'; 
const GHL_LOCATION_ID = 'YOUR_LOCATION_ID_HERE'; // Optional

async function setupGHLSettings() {
  try {
    console.log('Initializing Firebase app...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Creating crmSettings document...');
    
    // Create a document in the crmSettings collection
    const crmSettingsRef = doc(db, 'crmSettings', 'gohighlevel');
    
    // Check if document already exists
    const docSnap = await getDoc(crmSettingsRef);
    
    if (docSnap.exists()) {
      console.log('crmSettings document already exists:');
      console.log(docSnap.data());
      
      // Ask if we should update
      const update = process.argv.includes('--update');
      
      if (update) {
        console.log('Updating crmSettings document...');
        await setDoc(crmSettingsRef, {
          apiKey: GHL_API_KEY,
          locationId: GHL_LOCATION_ID,
          updatedAt: new Date(),
          ...docSnap.data() // Preserve other fields
        }, { merge: true });
        console.log('✅ crmSettings updated successfully!');
      } else {
        console.log('No changes made. Use --update flag to update existing settings.');
      }
    } else {
      // Create new document
      await setDoc(crmSettingsRef, {
        apiKey: GHL_API_KEY,
        locationId: GHL_LOCATION_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ crmSettings created successfully!');
    }
    
    console.log('\n==== NEXT STEPS ====');
    console.log('1. Update the GHL_API_KEY in this file with your actual API key');
    console.log('2. Run this script again with the --update flag');
    console.log('3. Update your Firestore security rules to allow access to crmSettings collection');
    console.log('\nFirestore Rules Example:');
    console.log(`
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          // Base rules - authenticated users can read their own data
          match /users/{userId} {
            allow read: if request.auth != null && request.auth.uid == userId;
            allow write: if request.auth != null && request.auth.uid == userId;
          }
          
          // Admin access to all collections
          match /{document=**} {
            allow read, write: if request.auth != null && 
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
          }
          
          // Allow all authenticated users to read crmSettings for GoHighLevel integration
          match /crmSettings/{document} {
            allow read: if request.auth != null;
          }
        }
      }
    `);
    
  } catch (error) {
    console.error('❌ Error setting up GHL settings:', error);
  }
}

setupGHLSettings();
