// This script creates the user profile directly in Firestore
// Copy and paste this entire code into your browser console when logged in as admin

(async function() {
  // Make sure Firebase is initialized and available
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase not found. Make sure you run this on your site after Firebase has loaded.');
    return;
  }
  
  try {
    // Create reference to Firestore
    const db = firebase.firestore();
    
    // User data
    const uid = 'luFdSPKRuwd0OqKFu72adyoTQFr1';
    const email = 'admin@example.com';
    
    // Create user profile document
    await db.collection('users').doc(uid).set({
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        email: email,
        phone: ''
      },
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });
    
    console.log('✅ User profile successfully created!');
    console.log(`ID: ${uid}`);
    console.log(`Email: ${email}`);
    
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
  }
})();
