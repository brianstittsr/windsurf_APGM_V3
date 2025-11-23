import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function createSampleBooking() {
  try {
    console.log('🚀 Creating sample booking...');

    // Create a sample booking for testing
    const sampleBooking = {
      clientName: 'Jane Smith',
      clientEmail: 'jane.smith@example.com',
      clientPhone: '555-123-4567',
      artistId: 'sample-artist-id',
      artistName: 'Victoria',
      serviceName: 'Microblading',
      date: '2025-12-15', // Future date
      time: '14:00',
      status: 'pending',
      price: 500,
      depositPaid: false,
      notes: 'Sample booking for testing',
      createdAt: Timestamp.now()
    };

    const bookingsRef = db.collection('bookings');
    const docRef = await bookingsRef.add(sampleBooking);

    console.log('✅ Sample booking created successfully!');
    console.log('📍 Booking ID:', docRef.id);
    console.log('📅 Date:', sampleBooking.date);
    console.log('⏰ Time:', sampleBooking.time);
    console.log('👤 Client:', sampleBooking.clientName);
    console.log('💅 Service:', sampleBooking.serviceName);
    console.log('\n🔗 You can now view this booking in the admin dashboard Calendar tab');

  } catch (error) {
    console.error('❌ Error creating sample booking:', error);
    throw error;
  }
}

// Run the script
createSampleBooking()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
