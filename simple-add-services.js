const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, deleteDoc, getDocs } = require('firebase/firestore');

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const services = [
  {
    name: "Bold Combo Eyebrows",
    price: 708,
    duration: "3-4 hours",
    description: "Experience the perfect blend of artistry combining microbladed strokes for natural texture and shaded areas for enhanced definition.",
    category: "eyebrows",
    image: "/images/services/BOLD-COMBO.png",
    isActive: true,
    order: 0,
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
  },
  {
    name: "Combo Eyebrows",
    price: 640,
    duration: "3-4 hours",
    description: "Combo brows combine the precision of microbladed strokes with a shaded body and tail, creating a beautifully defined look.",
    category: "eyebrows",
    image: "/images/services/COMBO.png",
    isActive: true,
    order: 1,
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
  },
  {
    name: "Blade & Shade Eyebrows",
    price: 640,
    duration: "3-4 hours",
    description: "Incorporating both microbladed strokes for added texture and a shaded body and tail for enhanced definition.",
    category: "eyebrows",
    image: "/images/services/BLADE+SHADE.png",
    isActive: true,
    order: 2,
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
  },
  {
    name: "Strokes Eyebrows",
    price: 600,
    duration: "2-3 hours",
    description: "Hair-stroke technique that creates natural-looking eyebrows with precise individual strokes.",
    category: "eyebrows",
    image: "/images/services/STROKES.png",
    isActive: true,
    order: 3,
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
  },
  {
    name: "Ombre Eyebrows",
    price: 620,
    duration: "2-3 hours",
    description: "Ombré powder brows create a soft, airy look or a more intense, defined appearance based on your preferences.",
    category: "eyebrows",
    image: "/images/services/OMBRE.png",
    isActive: true,
    order: 4,
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
  },
  {
    name: "Powder Eyebrows",
    price: 600,
    duration: "2-3 hours",
    description: "Powder brows offer a semi-permanent cosmetic tattoo solution that delivers soft, shaded, and natural-looking eyebrows, replicating the effect of makeup.",
    category: "eyebrows",
    image: "/images/services/POWDER.png",
    isActive: true,
    order: 5,
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
  }
];

async function addServices() {
  try {
    console.log('Starting to add services...');
    
    // Clear existing services
    const servicesRef = collection(db, 'services');
    const existingServices = await getDocs(servicesRef);
    
    console.log(`Deleting ${existingServices.size} existing services...`);
    for (const doc of existingServices.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Add new services
    console.log('Adding new services...');
    for (const service of services) {
      const docRef = await addDoc(servicesRef, {
        ...service,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added: ${service.name} - $${service.price} (ID: ${docRef.id})`);
    }
    
    console.log('Services added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding services:', error);
    process.exit(1);
  }
}

addServices();
