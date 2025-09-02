const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDwjCBWHQvVQnFQs8wO8QvQQvQQvQQvQQv",
  authDomain: "aprettygirlmatterllc.firebaseapp.com",
  projectId: "aprettygirlmatterllc",
  storageBucket: "aprettygirlmatterllc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

async function checkArtistAvailabilityData() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Checking artistAvailability collection...\n');

    // Get all artistAvailability documents
    const availabilityRef = collection(db, 'artistAvailability');
    const snapshot = await getDocs(availabilityRef);

    console.log(`Found ${snapshot.docs.length} documents in artistAvailability collection:\n`);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Document ID: ${doc.id}`);
      console.log(`Artist ID: ${data.artistId}`);
      console.log(`Day of Week: ${data.dayOfWeek}`);
      console.log(`Is Enabled: ${data.isEnabled}`);
      console.log(`Time Ranges:`, data.timeRanges);
      console.log('---');
    });

    // Check specifically for Victoria's data
    console.log('\n🎯 Looking for Victoria\'s availability...');
    const victoriaQuery = query(availabilityRef, where('artistId', '==', 'victoria'));
    const victoriaSnapshot = await getDocs(victoriaQuery);

    if (victoriaSnapshot.empty) {
      console.log('❌ No availability data found for Victoria');
    } else {
      console.log(`✅ Found ${victoriaSnapshot.docs.length} availability records for Victoria:`);
      victoriaSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.dayOfWeek}: ${data.isEnabled ? 'ENABLED' : 'DISABLED'}`);
        if (data.isEnabled && data.timeRanges) {
          data.timeRanges.forEach(range => {
            console.log(`  Time: ${range.startTime} - ${range.endTime}`);
          });
        }
      });
    }

  } catch (error) {
    console.error('Error checking availability data:', error);
  }
}

checkArtistAvailabilityData();
