const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aprettygirlmatterllc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aprettygirlmatterllc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aprettygirlmatterllc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addVictoriaAsArtist() {
  try {
    console.log('👤 Adding Victoria Escobar as an artist...\n');
    
    const artistData = {
      displayName: 'Victoria Escobar',
      email: 'victoria@aprettygirlmatter.com',
      role: 'artist',
      isActive: true,
      specialties: ['Microblading', 'Lip Blushing', 'Eyeliner'],
      bio: 'Owner and lead artist at A Pretty Girl Matter, specializing in permanent makeup artistry.',
      phone: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profile: {
        firstName: 'Victoria',
        lastName: 'Escobar',
        email: 'victoria@aprettygirlmatter.com'
      }
    };
    
    // Use a consistent ID for Victoria as artist
    await setDoc(doc(db, 'users', 'victoria_escobar_artist'), artistData);
    
    console.log('✅ Victoria Escobar added as an artist successfully!');
    console.log('\n📋 Artist Details:');
    console.log('   Name: Victoria Escobar');
    console.log('   Email: victoria@aprettygirlmatter.com');
    console.log('   Role: artist');
    console.log('   Specialties: Microblading, Lip Blushing, Eyeliner');
    
  } catch (error) {
    console.error('❌ Failed to add Victoria as artist:', error.message);
  }
}

// Run the script
addVictoriaAsArtist().then(() => {
  console.log('\n✅ Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
