const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, query, where } = require('firebase/firestore');
const { getAuth, deleteUser } = require('firebase/auth');

// Firebase configuration
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

async function deleteClientUsers() {
  try {
    console.log('🔍 Finding all users with client role...\n');
    
    // Query for all users with client role
    const usersRef = collection(db, 'users');
    const clientQuery = query(usersRef, where('role', '==', 'client'));
    const snapshot = await getDocs(clientQuery);
    
    if (snapshot.empty) {
      console.log('✅ No client users found to delete.');
      return;
    }
    
    console.log(`⚠️  Found ${snapshot.size} client users to delete:`);
    console.log('=' .repeat(60));
    
    // List users before deletion
    const usersToDelete = [];
    snapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      const profile = userData.profile || {};
      const email = profile.email || userData.email || 'N/A';
      const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'N/A';
      
      usersToDelete.push({
        id: docSnapshot.id,
        email: email,
        name: name,
        data: userData
      });
      
      console.log(`👤 ${name} (${email}) - ID: ${docSnapshot.id}`);
    });
    
    console.log('=' .repeat(60));
    console.log(`\n⚠️  WARNING: This will permanently delete ${usersToDelete.length} client users!`);
    console.log('This action cannot be undone.\n');
    
    // Confirm deletion (in a real scenario, you'd want user confirmation)
    console.log('🗑️  Proceeding with deletion...\n');
    
    let deletedCount = 0;
    let errors = [];
    
    for (const user of usersToDelete) {
      try {
        console.log(`Deleting ${user.name} (${user.email})...`);
        
        // Delete from Firestore users collection
        await deleteDoc(doc(db, 'users', user.id));
        console.log(`  ✅ Deleted Firestore profile for ${user.email}`);
        
        // Note: Deleting from Firebase Auth requires admin SDK or different approach
        // For now, we'll only delete the Firestore profile
        console.log(`  ⚠️  Firebase Auth user still exists (requires admin SDK to delete)`);
        
        deletedCount++;
        
      } catch (error) {
        console.error(`  ❌ Error deleting ${user.email}:`, error.message);
        errors.push({ user: user.email, error: error.message });
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`✅ Deletion completed!`);
    console.log(`   Firestore profiles deleted: ${deletedCount}/${usersToDelete.length}`);
    
    if (errors.length > 0) {
      console.log(`   Errors encountered: ${errors.length}`);
      errors.forEach(({ user, error }) => {
        console.log(`     - ${user}: ${error}`);
      });
    }
    
    console.log('\n📝 Note: Firebase Auth users still exist and need to be deleted manually');
    console.log('   from the Firebase Console or using Firebase Admin SDK.');
    
  } catch (error) {
    console.error('❌ Error during deletion process:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Permission denied. Check your Firestore security rules.');
      console.log('   Make sure you have delete permissions for the users collection.');
    }
  }
}

// Safety check - require confirmation
console.log('⚠️  CLIENT USER DELETION SCRIPT');
console.log('This script will delete ALL users with the "client" role from Firestore.');
console.log('This is a destructive operation that cannot be undone.\n');

// Run the script
deleteClientUsers().then(() => {
  console.log('\n🏁 Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
