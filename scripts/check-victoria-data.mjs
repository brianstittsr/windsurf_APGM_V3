import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
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

async function checkVictoriaData() {
  try {
    console.log('🔍 Checking Victoria\'s availability data...\n');

    // Check artistAvailability collection
    const availabilityRef = collection(db, 'artistAvailability');
    const victoriaQuery = query(availabilityRef, where('artistId', '==', 'victoria'));
    const snapshot = await getDocs(victoriaQuery);

    console.log(`Found ${snapshot.docs.length} records in artistAvailability:`);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.dayOfWeek}: ${data.isEnabled ? 'ENABLED' : 'DISABLED'} (ID: ${doc.id})`);
      if (data.timeRanges && data.timeRanges.length > 0) {
        data.timeRanges.forEach(range => {
          console.log(`  Time: ${range.startTime} - ${range.endTime}`);
        });
      }
    });

    // Also check if there are any bookings for Tuesday
    console.log('\n🔍 Checking bookings collection...');
    const bookingsRef = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    
    console.log(`Found ${bookingsSnapshot.docs.length} total bookings`);
    bookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.date && data.date.includes('2024-09-03') || data.date && data.date.includes('Tuesday')) {
        console.log(`- Booking on ${data.date} at ${data.time} for ${data.artistId}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkVictoriaData();
