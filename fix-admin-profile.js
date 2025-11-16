const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin with service account credentials
function initializeFirebaseAdmin() {
  // Try to use environment variables first
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
  } else {
    // Fallback to service account file if it exists
    console.log('Environment variables not found. Checking for service account file...');
    try {
      const serviceAccount = require('./service-account.json');
      return initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (error) {
      console.error('❌ No Firebase Admin credentials found. Please set environment variables or provide a service-account.json file.');
      process.exit(1);
    }
  }
}

const app = initializeFirebaseAdmin();
const db = getFirestore(app);

// Victoria's Firebase Auth UID from the error logs
// Change this to match the actual UID from the error logs
const VICTORIA_UID = 'jmE5ylH4bJXWZQapzYw2twvEYzG3';
const VICTORIA_EMAIL = 'victoria@aprettygirlmatter.com';

async function fixAdminProfile() {
  try {
    console.log(`Fixing admin profile for UID: ${VICTORIA_UID}`);
    
    // Check if user profile exists
    const userRef = db.collection('users').doc(VICTORIA_UID);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log('Existing user profile found:', userDoc.data());
      
      // Update the profile with admin role and ensure profile object exists
      await userRef.set({
        ...userDoc.data(),
        role: 'admin',
        updatedAt: new Date(),
        profile: {
          ...(userDoc.data().profile || {}),
          firstName: 'Victoria',
          lastName: 'Escobar',
          email: VICTORIA_EMAIL
        }
      }, { merge: true });
      
      console.log('✅ Updated existing profile with admin role');
    } else {
      console.log('No user profile found. Creating new admin profile...');
      
      // Create a new profile with admin role
      const newProfile = {
        uid: VICTORIA_UID,
        email: VICTORIA_EMAIL,
        displayName: 'Victoria Escobar',
        firstName: 'Victoria',
        lastName: 'Escobar',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Victoria',
          lastName: 'Escobar',
          email: VICTORIA_EMAIL,
          phone: '', // Add phone if available
        }
      };
      
      await userRef.set(newProfile);
      console.log('✅ Created new admin profile for Victoria Escobar');
    }
    
    // Verify the update
    const updatedDoc = await userRef.get();
    console.log('Updated profile:', updatedDoc.data());
    
    console.log('\n✅ ADMIN ACCESS SUCCESSFULLY CONFIGURED');
    console.log(`Victoria Escobar can now log in as admin with email: ${VICTORIA_EMAIL}`);
    
  } catch (error) {
    console.error('❌ Error fixing admin profile:', error);
  } finally {
    process.exit(0);
  }
}

fixAdminProfile();
