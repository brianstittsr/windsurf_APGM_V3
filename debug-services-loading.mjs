import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration - using environment variables or fallback
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aprettygirlmatterllc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aprettygirlmatterllc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

console.log('🔧 Firebase Config Check:');
console.log('- API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Auth Domain:', firebaseConfig.authDomain);

async function testServicesLoading() {
  try {
    console.log('\n🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    console.log('\n📋 Testing services collection access...');
    
    // Test 1: Get all documents from services collection
    console.log('Test 1: Getting all services...');
    const servicesRef = collection(db, 'services');
    const allServicesSnapshot = await getDocs(servicesRef);
    
    console.log(`Found ${allServicesSnapshot.size} total services`);
    
    if (allServicesSnapshot.size > 0) {
      allServicesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`- Service: ${data.name} (Active: ${data.isActive})`);
      });
    }
    
    // Test 2: Get only active services (what the app uses)
    console.log('\nTest 2: Getting active services only...');
    const activeServicesQuery = query(servicesRef, where('isActive', '==', true));
    const activeServicesSnapshot = await getDocs(activeServicesQuery);
    
    console.log(`Found ${activeServicesSnapshot.size} active services`);
    
    if (activeServicesSnapshot.size > 0) {
      activeServicesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`- Active Service: ${data.name} - $${data.price}`);
      });
    } else {
      console.log('⚠️ No active services found! This is why services are not loading.');
    }
    
    console.log('\n✅ Service loading test completed');
    
  } catch (error) {
    console.error('❌ Error testing services loading:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔒 Permission denied - check Firestore security rules');
    } else if (error.code === 'unavailable') {
      console.log('\n🌐 Firebase unavailable - check internet connection');
    } else if (error.message.includes('Firebase')) {
      console.log('\n⚙️ Firebase configuration issue - check environment variables');
    }
  }
}

testServicesLoading();
