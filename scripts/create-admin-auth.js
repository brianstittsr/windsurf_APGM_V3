/**
 * Create admin@example.com with both Firebase Auth and Firestore profile
 * This ensures the admin user can actually log in
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createAdminUser() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  try {
    console.log('🚀 Creating complete admin user setup...');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    
    // Step 1: Create Firebase Authentication account
    console.log('\n1️⃣ Creating Firebase Auth account...');
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Firebase Auth account created successfully');
      console.log(`   UID: ${userCredential.user.uid}`);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('⚠️  Firebase Auth account already exists - this is OK');
        // We'll still update the Firestore profile
      } else {
        throw authError;
      }
    }
    
    // Step 2: Create/Update Firestore profile
    console.log('\n2️⃣ Creating Firestore user profile...');
    
    const adminProfile = {
      role: 'admin',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        phone: '(555) 000-0000',
        address: '123 Admin Street',
        city: 'Raleigh',
        state: 'NC',
        zipCode: '27601',
        dateOfBirth: '1990-01-01',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '(555) 000-0001',
        preferredContactMethod: 'email',
        hearAboutUs: 'System Administrator',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
    
    // Use the UID from auth or generate a consistent one for existing users
    const userId = userCredential ? userCredential.user.uid : 'admin-example-uid';
    
    await setDoc(doc(db, 'users', userId), adminProfile);
    console.log('✅ Firestore profile created successfully');
    console.log(`   Document ID: ${userId}`);
    
    // Sign out after creation
    if (userCredential) {
      await signOut(auth);
    }
    
    console.log('\n🎉 Admin user setup completed successfully!');
    console.log('\n📋 Login Instructions:');
    console.log(`   1. Go to your login page`);
    console.log(`   2. Email: ${adminEmail}`);
    console.log(`   3. Password: ${adminPassword}`);
    console.log(`   4. Role: admin (full access)`);
    
    console.log('\n🔧 Development Bypass:');
    console.log(`   The system also has a development bypass for ${adminEmail}`);
    console.log(`   This works even if Firebase Auth fails`);
    
    return {
      success: true,
      email: adminEmail,
      password: adminPassword,
      userId: userId
    };
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    console.error('Error details:', error.message);
    
    // Try to sign out in case of error
    try {
      await signOut(auth);
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    throw error;
  }
}

// Run the script
createAdminUser()
  .then((result) => {
    console.log('\n✅ Script completed successfully');
    console.log('Result:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });
