const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function initBookingAvailability() {
  console.log('🔧 Initializing booking availability...');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

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
      await setDoc(docRef, availabilityData, { merge: true });
      console.log(`✅ ${day.enabled ? 'Enabled' : 'Disabled'} ${day.key}`);
    }

    console.log('\n✅ Booking availability initialized!');
    console.log('📅 Available: Monday-Saturday (9 AM - 5 PM)');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

require('dotenv').config({ path: '.env.local' });
initBookingAvailability();
