const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, query, where } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function fixBookingCalendar() {
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
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.dayOfWeek}, enabled: ${data.isEnabled}, timeRanges: ${data.timeRanges?.length || 0}`);
    });

    // Create default artist availability if none exists
    if (snapshot.docs.length === 0) {
      console.log('\n🏗️ Creating default artist availability...');
      
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
        await setDoc(docRef, availabilityData);
        console.log(`✅ Created availability for ${day.key}`);
      }
    } else {
      console.log('\n🔄 Updating existing availability data...');
      
      // Update existing documents to ensure they have proper time ranges
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const docRef = doc(db, 'artistAvailability', docSnapshot.id);
        
        // Ensure time ranges exist for enabled days
        if (data.isEnabled && (!data.timeRanges || data.timeRanges.length === 0)) {
          const updatedData = {
            ...data,
            timeRanges: [
              {
                id: `${data.dayOfWeek}-range-1`,
                startTime: '9:00 AM',
                endTime: '5:00 PM',
                isActive: true
              }
            ],
            updatedAt: new Date()
          };
          
          await setDoc(docRef, updatedData, { merge: true });
          console.log(`✅ Updated ${data.dayOfWeek} with default time range`);
        }
      }
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
      console.log('\n✅ Booking calendar should now work properly!');
      console.log('🌐 Test at: http://localhost:3000/book-now-custom');
    } else {
      console.log('\n❌ Issue still exists - no enabled days or time ranges found');
    }

  } catch (error) {
    console.error('❌ Error fixing booking calendar:', error);
  }
}

// Load environment variables and run
require('dotenv').config({ path: '.env.local' });
fixBookingCalendar();
