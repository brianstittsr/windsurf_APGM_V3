// Script to fix Victoria's availability data
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - you'll need to replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
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

async function fixVictoriaAvailability() {
  console.log('🔧 Fixing Victoria\'s availability data...');
  
  const artistId = 'victoria';
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Correct working hours for Victoria
  const correctSchedule = {
    monday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
    tuesday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
    wednesday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
    thursday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
    friday: { start: "9:00 AM", end: "5:00 PM", isWorking: true },
    saturday: { start: "10:00 AM", end: "4:00 PM", isWorking: true },
    sunday: { start: "10:00 AM", end: "4:00 PM", isWorking: false }
  };
  
  try {
    for (const day of daysOfWeek) {
      const docId = `${artistId}_${day}`;
      const docRef = doc(db, 'artistAvailability', docId);
      const daySchedule = correctSchedule[day];
      
      const timeRanges = daySchedule.isWorking ? [{
        id: `${day}_default`,
        startTime: daySchedule.start,
        endTime: daySchedule.end,
        isActive: true
      }] : [];
      
      const availabilityData = {
        id: docId,
        artistId,
        dayOfWeek: day,
        isEnabled: daySchedule.isWorking,
        timeRanges,
        servicesOffered: ['all'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, availabilityData);
      console.log(`✅ Updated ${day}: ${daySchedule.isWorking ? `${daySchedule.start} - ${daySchedule.end}` : 'Not working'}`);
    }
    
    console.log('🎉 Victoria\'s availability has been fixed!');
    console.log('📅 Saturday is now correctly set to 10:00 AM - 4:00 PM');
    console.log('🔄 Please refresh your booking page to see the changes');
    
  } catch (error) {
    console.error('❌ Error fixing availability:', error);
  }
}

// Load environment variables if running in Node.js
if (typeof process !== 'undefined' && process.env) {
  require('dotenv').config({ path: '.env.local' });
}

// Run the fix
fixVictoriaAvailability()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
