const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const adminEmail = 'admin@example.com'; // Replace with your admin email

async function updateAdminRole() {
  try {
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    console.log('Found user:', userRecord.uid, userRecord.email);
    
    // Set custom claims for admin access
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    console.log('Updated custom claims for admin user');
    
    // Update the user's document in Firestore
    const userRef = admin.firestore().collection('users').doc(userRecord.uid);
    await userRef.set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Successfully updated user to admin role');
    
    // Verify the update
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('Updated user claims:', updatedUser.customClaims);
    
    const updatedDoc = await userRef.get();
    console.log('Updated user document:', updatedDoc.data());
    
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
  } finally {
    process.exit();
  }
}

updateAdminRole();
