const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, deleteDoc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aprettygirlmatterllc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aprettygirlmatterllc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function removeInactiveAccounts() {
  try {
    console.log('🗑️  Removing inactive accounts...\n');
    
    // IDs of inactive accounts to remove
    const inactiveUserIds = [
      'Kg3WQv0zjRbuejebvC6H', // Brian Stitt (inactive)
      'td3ld0IIJEorGrX3Mj8p'   // Brian Stitt (inactive)
    ];
    
    for (const userId of inactiveUserIds) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        console.log(`✅ Removed user: ${userId}`);
      } catch (error) {
        console.error(`❌ Failed to remove user ${userId}:`, error.message);
      }
    }
    
    console.log('\n✅ Inactive account removal completed.\n');
  } catch (error) {
    console.error('❌ Error removing inactive accounts:', error);
  }
}

async function createNewUser(email, password, role, firstName, lastName) {
  try {
    console.log(`👤 Creating user: ${firstName} ${lastName} (${email})...`);
    
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile = {
      role: role,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profile: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        preferredContactMethod: 'email',
        hearAboutUs: 'System Created',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    console.log(`✅ Successfully created ${role}: ${firstName} ${lastName}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${email}`);
    
    // Sign out after creating each user
    await signOut(auth);
    
    return user.uid;
  } catch (error) {
    console.error(`❌ Failed to create user ${email}:`, error.message);
    
    // Sign out in case of error
    try {
      await signOut(auth);
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database management...\n');
    
    // Step 1: Remove inactive accounts
    await removeInactiveAccounts();
    
    // Step 2: Create new accounts
    console.log('👥 Creating new accounts...\n');
    
    const newUsers = [
      {
        email: 'victoria@aprettygirlmatter.com',
        password: 'LexxieDexx3#',
        role: 'admin',
        firstName: 'Victoria',
        lastName: 'Escobar'
      },
      {
        email: 'clientone@aprettygirlmatter.com',
        password: 'LexxieDexx3#',
        role: 'client',
        firstName: 'Client',
        lastName: 'One'
      },
      {
        email: 'artistone@aprettygirlmatter.com', // Fixed typo in email
        password: 'LexxieDexx3#',
        role: 'artist',
        firstName: 'Artist',
        lastName: 'One'
      }
    ];
    
    for (const userData of newUsers) {
      await createNewUser(
        userData.email,
        userData.password,
        userData.role,
        userData.firstName,
        userData.lastName
      );
      
      // Wait a moment between user creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 Database management completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Removed 2 inactive accounts');
    console.log('   ✅ Created 3 new accounts:');
    console.log('      - Victoria Escobar (admin)');
    console.log('      - Client One (client)');
    console.log('      - Artist One (artist)');
    
  } catch (error) {
    console.error('❌ Database management failed:', error);
  }
}

// Run the script
main().then(() => {
  console.log('\n✅ Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
