import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

async function fixBookingAvailability() {
  console.log('🔧 Fixing booking calendar availability...\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');

    // Check existing artistAvailability data
    console.log('\n📋 Checking existing artistAvailability data...');
    const availabilityRef = collection(db, 'artistAvailability');
    const snapshot = await getDocs(availabilityRef);
    
    console.log(`Found ${snapshot.docs.length} existing availability documents`);

    // Create default artist availability for Victoria
    const defaultArtistId = 'victoria-artist-id';
    const daysOfWeek = [
      { key: 'monday', enabled: true },
      { key: 'tuesday', enabled: true }, 
      { key: 'wednesday', enabled: true },
      { key: 'thursday', enabled: true },
      { key: 'friday', enabled: true },
      { key: 'saturday', enabled: true },
      { key: 'sunday', enabled: false }
    ];

    console.log('\n🏗️ Creating/updating artist availability...');

    for (const day of daysOfWeek) {
      const availabilityData = {
        artistId: defaultArtistId,
        dayOfWeek: day.key,
        isEnabled: day.enabled,
        timeRanges: day.enabled ? [
          {
            id: `${day.key}-range-1`,
            startTime: '9:00 AM',
            endTime: '5:00 PM',
            isActive: true
          }
        ] : [],
        servicesOffered: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(db, 'artistAvailability', `${defaultArtistId}-${day.key}`);
      await setDoc(docRef, availabilityData, { merge: true });
      console.log(`✅ ${day.enabled ? 'Enabled' : 'Disabled'} ${day.key}`);
    }

    // Verify the fix
    console.log('\n🔍 Verifying availability data...');
    const verifySnapshot = await getDocs(availabilityRef);
    let enabledDays = 0;
    let totalTimeSlots = 0;

    verifySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.isEnabled) {
        enabledDays++;
        totalTimeSlots += data.timeRanges?.length || 0;
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`- Total availability documents: ${verifySnapshot.docs.length}`);
    console.log(`- Enabled days: ${enabledDays}`);
    console.log(`- Total time ranges: ${totalTimeSlots}`);

    if (enabledDays > 0 && totalTimeSlots > 0) {
      console.log('\n✅ Booking calendar availability fixed!');
      console.log('📅 Available days: Monday-Saturday (9 AM - 5 PM)');
      console.log('🌐 Test at: https://aprettygirlmatter.com/book-now-custom');
    } else {
      console.log('\n❌ Issue still exists - no enabled days or time ranges found');
    }

  } catch (error) {
    console.error('❌ Error fixing booking calendar:', error);
  }
}

// Run the fix
fixBookingAvailability();
