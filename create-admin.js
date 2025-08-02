const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration - using the same config as your app
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

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const adminUser = {
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        phone: '555-0123',
        dateOfBirth: '1990-01-01',
        address: '123 Main St',
        city: 'Raleigh',
        state: 'NC',
        zipCode: '27601',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '555-0124',
        preferredContactMethod: 'email',
        hearAboutUs: 'Direct',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      role: 'admin',
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'users'), adminUser);
    console.log(' Admin user created successfully with ID:', docRef.id);
    console.log(' Email: admin@example.com');
    console.log(' Password: admin123 (for development bypass)');
    console.log(' You can now login at: http://localhost:3001/login');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
