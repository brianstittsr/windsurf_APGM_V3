const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc'}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();

async function createArtistAvailabilityCollection() {
  try {
    console.log('🔧 Creating artistAvailability collection with Victoria\'s schedule...\n');

    // Victoria's correct schedule - only Saturday and Sunday
    const victoriaSchedule = [
      {
        id: 'victoria_monday',
        artistId: 'victoria',
        dayOfWeek: 'monday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'victoria_tuesday',
        artistId: 'victoria',
        dayOfWeek: 'tuesday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'victoria_wednesday',
        artistId: 'victoria',
        dayOfWeek: 'wednesday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'victoria_thursday',
        artistId: 'victoria',
        dayOfWeek: 'thursday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'victoria_friday',
        artistId: 'victoria',
        dayOfWeek: 'friday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner'],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'victoria_saturday',
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
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'victoria_sunday',
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
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    // Create documents using batch write for better performance
    const batch = db.batch();
    
    victoriaSchedule.forEach(schedule => {
      const docRef = db.collection('artistAvailability').doc(schedule.id);
      batch.set(docRef, schedule);
    });
    
    await batch.commit();
    
    console.log('✅ artistAvailability collection created successfully!');
    console.log('\n📅 Victoria\'s Schedule:');
    victoriaSchedule.forEach(schedule => {
      console.log(`- ${schedule.dayOfWeek}: ${schedule.isEnabled ? 'ENABLED' : 'DISABLED'}`);
      if (schedule.timeRanges.length > 0) {
        schedule.timeRanges.forEach(range => {
          console.log(`   Time: ${range.startTime} - ${range.endTime}`);
        });
      }
    });
    
    console.log('\n🎉 Collection created! Victoria is only available Saturday & Sunday (9AM-1PM)');
    console.log('🚫 No Tuesday availability - booking calendar will now be correct');

  } catch (error) {
    console.error('❌ Error creating artistAvailability collection:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Permission denied. Make sure you have:');
      console.log('1. FIREBASE_CLIENT_EMAIL environment variable set');
      console.log('2. FIREBASE_PRIVATE_KEY environment variable set');
      console.log('3. Service account has Firestore Admin permissions');
    }
  }
}

createArtistAvailabilityCollection();
