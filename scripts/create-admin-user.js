// Script to create admin user and corresponding Firestore document
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Check for service account file
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath);
  console.error('Please place your Firebase Admin SDK service account key at this location.');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require(serviceAccountPath);
const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

// User data
const email = 'admin@example.com';
const password = 'admin123';
const uid = 'luFdSPKRuwd0OqKFu72adyoTQFr1';

// Create user function
async function createAdminUser() {
  try {
    // Create the user with a specific UID
    await auth.createUser({
      uid: uid,
      email: email,
      password: password,
      emailVerified: true,
    });
    
    console.log(`User ${email} created successfully with UID: ${uid}`);
    
    // Set custom claims to mark as admin
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`Admin claims set for user ${email}`);
    
    // Create the user profile document in Firestore
    await db.collection('users').doc(uid).set({
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        email: email,
        phone: '',
        role: 'admin'
      },
      createdAt: new Date(),
      role: 'admin',
      isActive: true
    });
    
    console.log(`User profile created in Firestore with ID: ${uid}`);
    console.log('Setup complete!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`User ${email} already exists. Updating Firestore document...`);
      
      // Just update the Firestore document
      await db.collection('users').doc(uid).set({
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          email: email,
          phone: '',
          role: 'admin'
        },
        createdAt: new Date(),
        role: 'admin',
        isActive: true
      });
      
      console.log(`User profile updated in Firestore with ID: ${uid}`);
      
    } else {
      console.error('Error creating user:', error);
    }
  }
}

// Run the function
createAdminUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
