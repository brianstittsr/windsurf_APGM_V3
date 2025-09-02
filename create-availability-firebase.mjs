import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin using service account key
try {
  // Try to read the downloaded service account key file
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'aprettygirlmatterllc'
  });
  console.log('✅ Firebase Admin initialized with service account key');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function createArtistAvailability() {
  try {
    console.log('🔧 Creating artistAvailability collection...');

    const victoriaSchedule = [
      {
        id: 'victoria_monday',
        artistId: 'victoria',
        dayOfWeek: 'monday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
      },
      {
        id: 'victoria_tuesday',
        artistId: 'victoria',
        dayOfWeek: 'tuesday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
      },
      {
        id: 'victoria_wednesday',
        artistId: 'victoria',
        dayOfWeek: 'wednesday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
      },
      {
        id: 'victoria_thursday',
        artistId: 'victoria',
        dayOfWeek: 'thursday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
      },
      {
        id: 'victoria_friday',
        artistId: 'victoria',
        dayOfWeek: 'friday',
        isEnabled: false,
        timeRanges: [],
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
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
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
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
        servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
      }
    ];

    const batch = db.batch();
    
    for (const schedule of victoriaSchedule) {
      const docRef = db.collection('artistAvailability').doc(schedule.id);
      batch.set(docRef, {
        ...schedule,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
    
    await batch.commit();
    
    console.log('✅ artistAvailability collection created!');
    console.log('📅 Victoria: Saturday & Sunday only (9AM-1PM)');
    console.log('🚫 Tuesday availability removed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createArtistAvailability();
