import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

async function resetArtistAvailability() {
  try {
    console.log('🗑️ Deleting ALL records in artistAvailability collection...\n');

    // Get all documents in artistAvailability collection
    const availabilityRef = collection(db, 'artistAvailability');
    const snapshot = await getDocs(availabilityRef);

    console.log(`Found ${snapshot.docs.length} total records to delete`);

    // Delete all existing records
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'artistAvailability', docSnap.id));
      console.log(`Deleted: ${docSnap.id}`);
    }
    console.log('✅ All artistAvailability records deleted\n');

    console.log('🔧 Recreating Victoria\'s correct schedule...\n');

    // Create Victoria's correct availability - only Saturday and Sunday
    const victoriaSchedule = [
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

    // Create new records for Victoria
    for (const schedule of victoriaSchedule) {
      const docId = `victoria_${schedule.dayOfWeek}`;
      const docRef = doc(db, 'artistAvailability', docId);
      await setDoc(docRef, { id: docId, ...schedule });
      console.log(`✅ Created ${schedule.dayOfWeek}: ${schedule.isEnabled ? 'ENABLED' : 'DISABLED'}`);
      if (schedule.timeRanges.length > 0) {
        schedule.timeRanges.forEach(range => {
          console.log(`   Time: ${range.startTime} - ${range.endTime}`);
        });
      }
    }
    
    console.log('\n🎉 artistAvailability collection has been reset!');
    console.log('📅 Victoria is now correctly set to Saturday & Sunday only (9AM-1PM)');
    console.log('🚫 Tuesday availability has been completely removed');
    console.log('🔄 The booking calendar should now show correct availability');

  } catch (error) {
    console.error('❌ Error resetting artistAvailability:', error);
  }
}

resetArtistAvailability();
