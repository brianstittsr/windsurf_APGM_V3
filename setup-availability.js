const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupArtistAvailability() {
  console.log('🚀 Setting up artist availability...');
  
  const artists = [
    { id: 'victoria', name: 'Victoria' },
    { id: 'admin', name: 'Admin' }
  ];
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Default business hours: 9 AM to 5 PM, Tuesday through Saturday
  const defaultSchedule = {
    monday: { isEnabled: false, timeRanges: [] },
    tuesday: { 
      isEnabled: true, 
      timeRanges: [
        {
          id: 'morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        },
        {
          id: 'afternoon',
          startTime: '2:00 PM',
          endTime: '5:00 PM',
          isActive: true
        }
      ]
    },
    wednesday: { 
      isEnabled: true, 
      timeRanges: [
        {
          id: 'morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        },
        {
          id: 'afternoon',
          startTime: '2:00 PM',
          endTime: '5:00 PM',
          isActive: true
        }
      ]
    },
    thursday: { 
      isEnabled: true, 
      timeRanges: [
        {
          id: 'morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        },
        {
          id: 'afternoon',
          startTime: '2:00 PM',
          endTime: '5:00 PM',
          isActive: true
        }
      ]
    },
    friday: { 
      isEnabled: true, 
      timeRanges: [
        {
          id: 'morning',
          startTime: '9:00 AM',
          endTime: '1:00 PM',
          isActive: true
        },
        {
          id: 'afternoon',
          startTime: '2:00 PM',
          endTime: '5:00 PM',
          isActive: true
        }
      ]
    },
    saturday: { 
      isEnabled: true, 
      timeRanges: [
        {
          id: 'morning',
          startTime: '10:00 AM',
          endTime: '2:00 PM',
          isActive: true
        }
      ]
    },
    sunday: { isEnabled: false, timeRanges: [] }
  };
  
  try {
    for (const artist of artists) {
      console.log(`📅 Setting up availability for ${artist.name}...`);
      
      for (const day of daysOfWeek) {
        const docId = `${artist.id}_${day}`;
        const docRef = doc(db, 'artistAvailability', docId);
        
        const daySchedule = defaultSchedule[day];
        
        await setDoc(docRef, {
          id: docId,
          artistId: artist.id,
          dayOfWeek: day,
          isEnabled: daySchedule.isEnabled,
          timeRanges: daySchedule.timeRanges,
          servicesOffered: ['all'],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        console.log(`   ✅ ${day}: ${daySchedule.isEnabled ? 'Available' : 'Closed'}`);
      }
    }
    
    console.log('🎉 Artist availability setup completed successfully!');
    console.log('📋 Default Schedule:');
    console.log('   • Monday: Closed');
    console.log('   • Tuesday-Friday: 9:00 AM - 1:00 PM, 2:00 PM - 5:00 PM');
    console.log('   • Saturday: 10:00 AM - 2:00 PM');
    console.log('   • Sunday: Closed');
    console.log('');
    console.log('💡 You can now use the booking system - dates should show as available!');
    
  } catch (error) {
    console.error('❌ Error setting up availability:', error);
    process.exit(1);
  }
}

// Run the setup
setupArtistAvailability()
  .then(() => {
    console.log('✨ Setup complete! Your calendar should now show available dates.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
