import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase Config Check:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminAccount() {
  const email = 'admin@example.com';
  const password = 'admin123';
  
  try {
    console.log('🚀 Creating Firebase Authentication account...');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth account created!');
    console.log(`UID: ${user.uid}`);
    
    // Create Firestore profile
    console.log('📝 Creating Firestore profile...');
    
    const adminProfile = {
      role: 'admin',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        email: email,
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
    
    await setDoc(doc(db, 'users', user.uid), adminProfile);
    console.log('✅ Firestore profile created!');
    
    // Sign out
    await signOut(auth);
    
    console.log('\n🎉 Admin account created successfully!');
    console.log('\n📋 Login Details:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: admin`);
    console.log(`UID: ${user.uid}`);
    
    return { success: true, uid: user.uid, email, password };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Account already exists - this is OK!');
      console.log(`You can log in with: ${email} / ${password}`);
      return { success: true, message: 'Account already exists' };
    }
    
    console.error('❌ Error creating admin account:', error);
    throw error;
  }
}

createAdminAccount()
  .then((result) => {
    console.log('\n✅ Script completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });
