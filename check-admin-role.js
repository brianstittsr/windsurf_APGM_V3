const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = 'admin@example.com'; // Replace with your admin email

async function checkAdminRole() {
  try {
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('User found:', userRecord.uid, userRecord.email);
    
    // Check custom claims
    const { customClaims } = await admin.auth().getUser(userRecord.uid);
    console.log('Custom claims:', customClaims);
    
    // Get user document from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    console.log('User document data:', userDoc.data());
    
  } catch (error) {
    console.error('Error checking admin role:', error);
  }
}

checkAdminRole();
