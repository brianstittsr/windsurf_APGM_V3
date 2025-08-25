import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function createAdminUser() {
  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('👤 Creating admin user: admin@example.com');
    
    const adminProfile = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '(555) 000-0000',
      dateOfBirth: '1990-01-01',
      address: '123 Admin Street',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '(555) 000-0001',
      preferredContactMethod: 'email',
      hearAboutUs: 'System Administrator',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const userData = {
      profile: adminProfile,
      role: 'admin',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Create admin user document
    const adminUserId = 'admin-user-001';
    const userRef = doc(db, 'users', adminUserId);
    
    // Check if user already exists
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) {
      console.log('⚠️ Admin user already exists, updating role...');
      await setDoc(userRef, { 
        role: 'admin', 
        isActive: true,
        'profile.updatedAt': serverTimestamp(),
        updatedAt: serverTimestamp() 
      }, { merge: true });
    } else {
      console.log('📝 Creating new admin user...');
      await setDoc(userRef, userData);
    }

    console.log('✅ Admin user created/updated successfully!');
    console.log(`   User ID: ${adminUserId}`);
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);
    
    // Verify the user was created
    const verifyUser = await getDoc(userRef);
    if (verifyUser.exists()) {
      const userData = verifyUser.data();
      console.log('✅ Verification successful!');
      console.log(`   Name: ${userData.profile.firstName} ${userData.profile.lastName}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Active: ${userData.isActive}`);
      
      console.log('\n📋 Next Steps:');
      console.log('1. Admin user created in Firestore database');
      console.log('2. Use email: admin@example.com');
      console.log('3. Use password: admin123');
      console.log('4. You may need to create this user in Firebase Authentication console');
      console.log('5. Or implement Firebase Auth user creation in your login system');
      
      return true;
    } else {
      throw new Error('User verification failed');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return false;
  }
}

// Run the script
createAdminUser()
  .then(success => {
    if (success) {
      console.log('\n🎉 Admin user setup completed successfully!');
    } else {
      console.log('\n💥 Admin user setup failed!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
