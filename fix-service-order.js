// Simple script to fix service order using Firebase client SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } = require('firebase/firestore');

// Firebase config from environment
const firebaseConfig = {
  apiKey: "AIzaSyDvQJKOQQQQQQQQQQQQQQQQQQQQQQQQQQQ", // Replace with actual key
  authDomain: "apgm-v3.firebaseapp.com",
  projectId: "apgm-v3",
  storageBucket: "apgm-v3.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Correct service order with updated pricing
const correctServices = [
  {
    name: "Bold Combo Eyebrows",
    price: 708,
    duration: "3-4 hours",
    description: "Experience the perfect blend of artistry combining microbladed strokes for natural texture and shaded areas for enhanced definition.",
    category: "eyebrows",
    image: "/images/services/BOLD-COMBO.png",
    isActive: true,
    order: 0
  },
  {
    name: "Combo Eyebrows",
    price: 640,
    duration: "3-4 hours", 
    description: "Combo brows combine the precision of microbladed strokes with a shaded body and tail, creating a beautifully defined look.",
    category: "eyebrows",
    image: "/images/services/COMBO.png",
    isActive: true,
    order: 1
  },
  {
    name: "Blade & Shade Eyebrows",
    price: 640,
    duration: "3-4 hours",
    description: "Incorporating both microbladed strokes for added texture and a shaded body and tail for enhanced definition.", 
    category: "eyebrows",
    image: "/images/services/BLADE+SHADE.png",
    isActive: true,
    order: 2
  },
  {
    name: "Strokes Eyebrows",
    price: 600,
    duration: "2-3 hours",
    description: "Hair-stroke technique that creates natural-looking eyebrows with precise individual strokes.",
    category: "eyebrows",
    image: "/images/services/STROKES.png", 
    isActive: true,
    order: 3
  },
  {
    name: "Ombre Eyebrows",
    price: 620,
    duration: "2-3 hours",
    description: "Ombré powder brows create a soft, airy look or a more intense, defined appearance based on your preferences.",
    category: "eyebrows",
    image: "/images/services/OMBRE.png",
    isActive: true,
    order: 4
  },
  {
    name: "Powder Eyebrows", 
    price: 600,
    duration: "2-3 hours",
    description: "Powder brows offer a semi-permanent cosmetic tattoo solution that delivers soft, shaded, and natural-looking eyebrows, replicating the effect of makeup.",
    category: "eyebrows",
    image: "/images/services/POWDER.png",
    isActive: true,
    order: 5
  }
];

async function fixServiceOrder() {
  try {
    console.log('Fixing service order...');
    
    // Get existing services
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    
    console.log(`Found ${snapshot.size} existing services`);
    
    // Delete existing services
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
      console.log(`Deleted: ${docSnap.data().name}`);
    }
    
    // Add services in correct order
    for (const service of correctServices) {
      await addDoc(servicesRef, {
        ...service,
        createdAt: new Date(),
        updatedAt: new Date(),
        requirements: [
          "Must be 18 years or older",
          "Not pregnant or breastfeeding",
          "No blood-thinning medications 48 hours prior"
        ],
        contraindications: [
          "Pregnancy or breastfeeding", 
          "Active skin conditions in treatment area",
          "Recent Botox or facial treatments (within 2 weeks)"
        ]
      });
      console.log(`✓ Added: ${service.name} - $${service.price} (Order: ${service.order})`);
    }
    
    console.log('\n✅ Service order fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixServiceOrder();
