const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration - you'll need to update these values
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
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser() {
  const email = 'clientone@aprettygirlmatter.com';
  const password = 'admin123';
  
  try {
    console.log('Creating Firebase user account...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase user created:', user.uid);
    
    // Create user profile in Firestore
    const userProfile = {
      profile: {
        firstName: 'Client',
        lastName: 'One',
        email: email,
        phone: '(555) 123-4567',
        dateOfBirth: '1990-01-01',
        address: '123 Main Street',
        city: 'Raleigh',
        state: 'NC',
        zipCode: '27601',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '(555) 987-6543',
        preferredContactMethod: 'email',
        hearAboutUs: 'Website',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      role: 'client',
      isActive: true
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('✅ User profile created in Firestore');
    
    console.log('\n🎉 Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('UID:', user.uid);
    console.log('\nYou can now log in with these credentials.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 User already exists. Try logging in with:');
      console.log('Email:', email);
      console.log('Password:', password);
    }
    
    process.exit(1);
  }
}

// Run the script
createTestUser();
