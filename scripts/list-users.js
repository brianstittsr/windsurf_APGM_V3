const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration - using the same config as the app
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

async function listUsers() {
  try {
    console.log('🔍 Querying users collection...\n');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    if (snapshot.empty) {
      console.log('❌ No users found in the database.');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} users:\n`);
    console.log('=' .repeat(80));
    
    let userIndex = 1;
    snapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 User ${userIndex}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Email: ${userData.email || 'N/A'}`);
      console.log(`   Name: ${userData.firstName || 'N/A'} ${userData.lastName || 'N/A'}`);
      console.log(`   Role: ${userData.role || 'N/A'}`);
      console.log(`   Phone: ${userData.phone || 'N/A'}`);
      
      // Handle timestamp conversion more safely
      let createdDate = 'N/A';
      if (userData.createdAt) {
        try {
          if (userData.createdAt.seconds) {
            createdDate = new Date(userData.createdAt.seconds * 1000).toLocaleDateString();
          } else if (userData.createdAt.toDate) {
            createdDate = userData.createdAt.toDate().toLocaleDateString();
          }
        } catch (e) {
          createdDate = 'Invalid Date';
        }
      }
      
      let lastLoginDate = 'N/A';
      if (userData.lastLogin) {
        try {
          if (userData.lastLogin.seconds) {
            lastLoginDate = new Date(userData.lastLogin.seconds * 1000).toLocaleDateString();
          } else if (userData.lastLogin.toDate) {
            lastLoginDate = userData.lastLogin.toDate().toLocaleDateString();
          }
        } catch (e) {
          lastLoginDate = 'Invalid Date';
        }
      }
      
      console.log(`   Created: ${createdDate}`);
      console.log(`   Last Login: ${lastLoginDate}`);
      
      // Show all available fields with better formatting
      console.log('   All Data:');
      Object.keys(userData).forEach(key => {
        if (!['createdAt', 'lastLogin'].includes(key)) {
          let value = userData[key];
          
          // Handle nested objects like profile
          if (typeof value === 'object' && value !== null) {
            if (key === 'profile' && value) {
              console.log(`     ${key}:`);
              Object.keys(value).forEach(profileKey => {
                console.log(`       ${profileKey}: ${value[profileKey]}`);
              });
            } else {
              console.log(`     ${key}: ${JSON.stringify(value, null, 2)}`);
            }
          } else {
            console.log(`     ${key}: ${value}`);
          }
        }
      });
      
      console.log('-'.repeat(40));
      userIndex++;
    });
    
    // Summary by role
    const roleCount = {};
    snapshot.forEach((doc) => {
      const role = doc.data().role || 'unknown';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    console.log('\n📊 Users by Role:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 This might be due to Firestore security rules.');
      console.log('   Make sure you have read permissions for the users collection.');
    }
  }
}

// Run the script
listUsers().then(() => {
  console.log('\n✅ Query completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
