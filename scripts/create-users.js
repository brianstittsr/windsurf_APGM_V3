const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

async function createUserDocument(userId, email, role, firstName, lastName) {
  try {
    console.log(`👤 Creating user document for: ${firstName} ${lastName}...`);
    
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
    
    await setDoc(doc(db, 'users', userId), userProfile);
    console.log(`✅ Created user document for ${firstName} ${lastName} (${role})`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to create user document for ${email}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('👥 Creating user documents...\n');
    
    // Create user documents with placeholder UIDs
    // These will need to be updated with actual Firebase Auth UIDs
    const users = [
      {
        id: 'victoria_escobar_temp',
        email: 'victoria@aprettygirlmatter.com',
        role: 'admin',
        firstName: 'Victoria',
        lastName: 'Escobar'
      },
      {
        id: 'client_one_temp',
        email: 'clientone@aprettygirlmatter.com',
        role: 'client',
        firstName: 'Client',
        lastName: 'One'
      },
      {
        id: 'artist_one_temp',
        email: 'artistone@aprettygirlmatter.com',
        role: 'artist',
        firstName: 'Artist',
        lastName: 'One'
      }
    ];
    
    for (const user of users) {
      await createUserDocument(
        user.id,
        user.email,
        user.role,
        user.firstName,
        user.lastName
      );
    }
    
    console.log('\n🎉 User documents created successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('   2. Navigate to Authentication > Users');
    console.log('   3. Click "Add user" for each account:');
    console.log('');
    console.log('   👤 Victoria Escobar (Admin):');
    console.log('      Email: victoria@aprettygirlmatter.com');
    console.log('      Password: LexxieDexx3#');
    console.log('      Then update user document ID: victoria_escobar_temp → [new UID]');
    console.log('');
    console.log('   👤 Client One:');
    console.log('      Email: clientone@aprettygirlmatter.com');
    console.log('      Password: LexxieDexx3#');
    console.log('      Then update user document ID: client_one_temp → [new UID]');
    console.log('');
    console.log('   👤 Artist One:');
    console.log('      Email: artistone@aprettygirlmatter.com');
    console.log('      Password: LexxieDexx3#');
    console.log('      Then update user document ID: artist_one_temp → [new UID]');
    console.log('');
    console.log('   4. Update the Firestore user document IDs to match the Auth UIDs');
    console.log('   5. Delete the temporary documents with "_temp" IDs');
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
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
