// Script to populate initial customer reviews in Firestore
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

const initialReviews = [
  {
    name: "Sarah Johnson",
    service: "Microblading Eyebrows",
    rating: 5,
    text: "Victoria is absolutely amazing! My eyebrows look so natural and perfect. I wake up every morning feeling confident and beautiful. The whole process was comfortable and professional. I couldn't be happier with the results!",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    beforeAfter: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
    isApproved: true,
    isVisible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Emily Chen",
    service: "Semi-Permanent Eyeliner",
    rating: 5,
    text: "I was nervous about getting semi-permanent eyeliner, but Victoria made me feel so comfortable. The results are exactly what I wanted - subtle but defined. I save so much time in the morning now!",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    beforeAfter: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
    isApproved: true,
    isVisible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Maria Rodriguez",
    service: "Lip Blushing",
    rating: 5,
    text: "My lips have never looked better! The color is perfect for my skin tone and looks so natural. Victoria is a true artist. I get compliments every day and people can't believe it's semi-permanent makeup.",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    beforeAfter: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
    isApproved: true,
    isVisible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Jessica Williams",
    service: "Full Package",
    rating: 5,
    text: "I got eyebrows, eyeliner, and lips done by Victoria. The transformation is incredible! I feel like the best version of myself. Victoria's attention to detail and artistry is unmatched.",
    image: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    beforeAfter: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
    isApproved: true,
    isVisible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Amanda Davis",
    service: "Microblading Touch-up",
    rating: 5,
    text: "Victoria did my touch-up perfectly. She's so professional and really cares about getting the best results. My eyebrows still look amazing after 2 years. Highly recommend!",
    image: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    beforeAfter: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
    isApproved: true,
    isVisible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Rachel Thompson",
    service: "Microblading Eyebrows",
    rating: 5,
    text: "Best decision I ever made! Victoria is so talented and professional. My eyebrows are perfect every single day. No more filling them in with makeup!",
    image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    beforeAfter: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
    isApproved: true,
    isVisible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function populateReviews() {
  console.log('🌟 Populating initial customer reviews...\n');

  try {
    for (const review of initialReviews) {
      const docRef = await addDoc(collection(db, 'reviews'), review);
      console.log(`✅ Added review by ${review.name} (${review.service}) - ID: ${docRef.id}`);
    }

    console.log('\n🎉 Successfully populated all initial reviews!');
    console.log('\n📋 Summary:');
    console.log(`• Total reviews added: ${initialReviews.length}`);
    console.log('• All reviews are approved and visible');
    console.log('• Reviews will appear on homepage and in admin dashboard');
    console.log('\n🔧 Next steps:');
    console.log('• Visit admin dashboard to manage reviews');
    console.log('• Add more reviews through the admin interface');
    console.log('• Homepage will now display database reviews');

  } catch (error) {
    console.error('❌ Error populating reviews:', error);
    console.error('\n🔍 Troubleshooting:');
    console.error('• Check Firebase configuration in .env.local');
    console.error('• Ensure Firestore rules allow admin access');
    console.error('• Verify you have admin permissions');
  }
}

populateReviews();
