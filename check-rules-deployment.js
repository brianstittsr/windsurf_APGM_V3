const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, query, limit, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkRulesDeployment() {
  console.log('🔍 Checking Firestore rules deployment status...');
  console.log(`📡 Project: ${firebaseConfig.projectId}\n`);
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const tests = [
    {
      name: 'Services (Public Read)',
      test: async () => {
        const q = query(collection(db, 'services'), limit(1));
        const snapshot = await getDocs(q);
        return { success: true, count: snapshot.size };
      }
    },
    {
      name: 'Reviews (Public Read)',
      test: async () => {
        const q = query(collection(db, 'reviews'), limit(1));
        const snapshot = await getDocs(q);
        return { success: true, count: snapshot.size };
      }
    },
    {
      name: 'Coupons (Auth Required)',
      test: async () => {
        const q = query(collection(db, 'coupons'), limit(1));
        const snapshot = await getDocs(q);
        return { success: true, count: snapshot.size };
      }
    },
    {
      name: 'Users (Restricted)',
      test: async () => {
        const q = query(collection(db, 'users'), limit(1));
        const snapshot = await getDocs(q);
        return { success: false, message: 'Should be restricted', count: snapshot.size };
      }
    }
  ];

  for (const testCase of tests) {
    try {
      console.log(`Testing ${testCase.name}...`);
      const result = await testCase.test();
      
      if (testCase.name.includes('Restricted')) {
        console.log(`⚠️  ${testCase.name}: Accessible (${result.count} docs) - May need rule update`);
      } else {
        console.log(`✅ ${testCase.name}: Working (${result.count} docs)`);
      }
    } catch (error) {
      if (error.message.includes('Missing or insufficient permissions')) {
        if (testCase.name.includes('Restricted')) {
          console.log(`✅ ${testCase.name}: Properly secured`);
        } else {
          console.log(`❌ ${testCase.name}: Blocked (may need rule deployment)`);
        }
      } else {
        console.log(`❌ ${testCase.name}: Error - ${error.message}`);
      }
    }
  }

  console.log('\n📊 Rules Status Summary:');
  console.log('='.repeat(40));
  console.log('If public collections (Services, Reviews) are accessible');
  console.log('and restricted collections require permissions,');
  console.log('then rules are likely deployed correctly.');
}

require('dotenv').config({ path: '.env.local' });
checkRulesDeployment().catch(console.error);
