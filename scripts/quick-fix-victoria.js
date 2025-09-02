const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'aprettygirlmatterllc',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: 'https://aprettygirlmatterllc-default-rtdb.firebaseio.com'
  });
}

const db = admin.firestore();

async function fixVictoriaAvailability() {
  try {
    console.log('🔧 Fixing Victoria\'s availability - removing Tuesday...\n');

    // Get all Victoria's availability records
    const snapshot = await db.collection('artistAvailability')
      .where('artistId', '==', 'victoria')
      .get();

    console.log(`Found ${snapshot.docs.length} records for Victoria`);

    // Delete all existing records first
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('✅ Cleared all existing Victoria records');

    // Create correct availability - only Saturday and Sunday
    const correctSchedule = [
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

    // Create new records
    const newBatch = db.batch();
    correctSchedule.forEach(schedule => {
      const docRef = db.collection('artistAvailability').doc(schedule.id);
      newBatch.set(docRef, schedule);
    });
    
    await newBatch.commit();
    console.log('✅ Created correct Victoria availability');
    console.log('📅 Victoria is now only available Saturday & Sunday 9AM-1PM');
    console.log('🚫 Tuesday availability has been removed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixVictoriaAvailability();
