require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aprettygirlmatterllc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aprettygirlmatterllc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

async function fixVictoriaAvailability() {
  try {
    console.log('🔧 Fixing Victoria\'s availability data...\n');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get all Victoria's current availability
    const availabilityRef = collection(db, 'artistAvailability');
    const victoriaQuery = query(availabilityRef, where('artistId', '==', 'victoria'));
    const snapshot = await getDocs(victoriaQuery);

    console.log(`Found ${snapshot.docs.length} existing records for Victoria:`);
    
    // Show current state
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.dayOfWeek}: ${data.isEnabled ? 'ENABLED' : 'DISABLED'}`);
    });

    console.log('\n🗑️ Clearing all existing Victoria availability records...');
    
    // Delete all existing records
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'artistAvailability', docSnap.id));
      console.log(`Deleted: ${docSnap.id}`);
    }

    console.log('\n✅ Setting correct availability (Saturday & Sunday only)...');

    // Define correct schedule - only Saturday and Sunday
    const correctSchedule = {
      monday: { enabled: false },
      tuesday: { enabled: false },
      wednesday: { enabled: false },
      thursday: { enabled: false },
      friday: { enabled: false },
      saturday: { 
        enabled: true,
        timeRanges: [{
          id: 'sat-morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        }]
      },
      sunday: { 
        enabled: true,
        timeRanges: [{
          id: 'sun-morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        }]
      }
    };

    // Create new records with correct data
    for (const [dayOfWeek, config] of Object.entries(correctSchedule)) {
      const docId = `victoria_${dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      
      const availabilityData = {
        id: docId,
        artistId: 'victoria',
        dayOfWeek: dayOfWeek,
        isEnabled: config.enabled,
        timeRanges: config.timeRanges || [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(docRef, availabilityData);
      console.log(`✅ Set ${dayOfWeek}: ${config.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    console.log('\n🎉 Victoria\'s availability has been corrected!');
    console.log('📅 Victoria is now only available on Saturday and Sunday');
    console.log('🔄 The booking calendar should now match the admin interface');

  } catch (error) {
    console.error('❌ Error fixing availability:', error);
  }
}

fixVictoriaAvailability();
