// Script to create Victoria user account
// Run this in your browser console while logged in as admin

(async function() {
  try {
    console.log('👤 Creating Victoria user account...');
    
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase not found. Run this on your website after Firebase loads.');
      return;
    }
    
    // Check if user is logged in as admin
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user logged in. Please log in as admin first.');
      return;
    }
    
    console.log(`🔑 Logged in as: ${user.email}`);
    
    // Check if the current user is an admin
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      console.error('❌ You must be logged in as an admin to create users.');
      return;
    }
    
    // We'll use the client API to create Victoria's user profile
    // Note: This won't create the Firebase Auth account (that needs Admin SDK)
    // But it will create the Firestore profile document
    
    // First check if the user already exists in Firestore
    const victoriaEmail = 'victoria@aprettygirlmatter.com';
    const usersSnapshot = await db.collection('users')
      .where('profile.email', '==', victoriaEmail)
      .get();
    
    if (!usersSnapshot.empty) {
      console.log('⚠️ User with this email already exists in Firestore.');
      console.log('Details:');
      usersSnapshot.forEach(doc => {
        console.log(`ID: ${doc.id}`);
        console.log('Data:', doc.data());
      });
      return;
    }
    
    // Create a random UID for Victoria
    const victoriaUid = 'victoria_' + Math.random().toString(36).substring(2, 10);
    
    // Create the user profile document
    await db.collection('users').doc(victoriaUid).set({
      profile: {
        firstName: 'Victoria',
        lastName: 'Admin',
        email: victoriaEmail,
        phone: ''
      },
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });
    
    console.log('✅ Victoria user profile created in Firestore!');
    console.log(`ID: ${victoriaUid}`);
    console.log(`Email: ${victoriaEmail}`);
    console.log('');
    console.log('⚠️ IMPORTANT: You still need to create the Firebase Auth user');
    console.log('To do that, go to Firebase Console -> Authentication -> Users');
    console.log('And add a new user with:');
    console.log(`Email: ${victoriaEmail}`);
    console.log('Password: [your-chosen-password]');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
})();
