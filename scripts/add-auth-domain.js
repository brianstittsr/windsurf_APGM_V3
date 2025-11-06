// Script to add domain to Firebase Auth authorized domains
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
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

// Domain to add
const domain = 'www.aprettygirlmatter.com';

async function addAuthDomain() {
  try {
    // This is a placeholder - Firebase Admin SDK doesn't directly support adding auth domains
    // You'll need to use the Firebase Management API or do it manually in the console
    console.log(`
============================================================
IMPORTANT: Add ${domain} to Firebase Auth domains manually:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add ${domain} to the list
============================================================
`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
addAuthDomain()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
