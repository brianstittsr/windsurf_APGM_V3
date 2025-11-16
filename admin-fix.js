const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin User Email
const ADMIN_EMAIL = 'victoria@aprettygirlmatter.com';
const ADMIN_PASSWORD = 'your-temporary-password-here'; // Replace with actual password

async function createAdminUser() {
  try {
    console.log(`Attempting to sign in as ${ADMIN_EMAIL}...`);
    
    // Sign in to get user credentials
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;
    
    console.log(`Successfully authenticated user: ${user.email} (${user.uid})`);
    
    // Check if user profile exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('Existing user profile found:', userDoc.data());
      
      // Update the profile with admin role
      await setDoc(userDocRef, {
        ...userDoc.data(),
        role: 'admin',
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ Updated existing profile with admin role');
    } else {
      console.log('No user profile found. Creating new admin profile...');
      
      // Create a new profile with admin role
      const newProfile = {
        uid: user.uid,
        email: user.email,
        displayName: 'Victoria Escobar',
        firstName: 'Victoria',
        lastName: 'Escobar',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Victoria',
          lastName: 'Escobar',
          email: user.email,
          phone: '',  // Add phone if available
        }
      };
      
      await setDoc(userDocRef, newProfile);
      console.log('✅ Created new admin profile for Victoria Escobar');
    }
    
    // Verify the update
    const updatedDoc = await getDoc(userDocRef);
    console.log('Updated profile:', updatedDoc.data());
    
    console.log('\n✅ ADMIN ACCESS SUCCESSFULLY CONFIGURED');
    console.log(`User can now log in as admin with email: ${ADMIN_EMAIL}`);
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

createAdminUser();
