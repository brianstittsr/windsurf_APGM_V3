import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixVictoriaAvailability() {
  try {
    console.log('🔧 Fixing Victoria\'s availability - removing Tuesday...\n');

    // Get all Victoria's availability records
    const availabilityRef = collection(db, 'artistAvailability');
    const victoriaQuery = query(availabilityRef, where('artistId', '==', 'victoria'));
    const snapshot = await getDocs(victoriaQuery);

    console.log(`Found ${snapshot.docs.length} records for Victoria`);

    // Delete all existing records first
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'artistAvailability', docSnap.id));
      console.log(`Deleted: ${docSnap.id}`);
    }
    console.log('✅ Cleared all existing Victoria records');

    // Create correct availability - only Saturday and Sunday
    const correctSchedule = [
      {
        artistId: 'victoria',
        dayOfWeek: 'monday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        artistId: 'victoria',
        dayOfWeek: 'tuesday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        artistId: 'victoria',
        dayOfWeek: 'wednesday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        artistId: 'victoria',
        dayOfWeek: 'thursday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        artistId: 'victoria',
        dayOfWeek: 'friday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        artistId: 'victoria',
        dayOfWeek: 'saturday',
        isEnabled: true,
        timeRanges: [{
          id: 'sat-morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        }],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        artistId: 'victoria',
        dayOfWeek: 'sunday',
        isEnabled: true,
        timeRanges: [{
          id: 'sun-morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        }],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Create new records
    for (const schedule of correctSchedule) {
      const docId = `victoria_${schedule.dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      await setDoc(docRef, { id: docId, ...schedule });
      console.log(`✅ Set ${schedule.dayOfWeek}: ${schedule.isEnabled ? 'ENABLED' : 'DISABLED'}`);
    }
    
    console.log('\n🎉 Victoria\'s availability has been corrected!');
    console.log('📅 Victoria is now only available Saturday & Sunday 9AM-1PM');
    console.log('🚫 Tuesday availability has been removed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixVictoriaAvailability();
