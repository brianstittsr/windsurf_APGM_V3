// Manual service update script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

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

// Services in the correct order
const orderedServices = [
  {
    id: 'bold-combo-eyebrows',
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
    id: 'combo-eyebrows',
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
    id: 'blade-shade-eyebrows',
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
    id: 'strokes-eyebrows',
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
    id: 'ombre-eyebrows',
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
    id: 'powder-eyebrows',
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

async function updateServices() {
  try {
    console.log('Starting manual service update...');
    
    // Clear existing services
    const servicesRef = collection(db, 'services');
    const existingServices = await getDocs(servicesRef);
    
    console.log(`Deleting ${existingServices.size} existing services...`);
    for (const docSnap of existingServices.docs) {
      await deleteDoc(docSnap.ref);
    }
    
    // Add services with correct order
    console.log('Adding services in correct order...');
    for (const service of orderedServices) {
      const serviceDoc = doc(db, 'services', service.id);
      await setDoc(serviceDoc, {
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
    
    // Verify the update
    console.log('\nVerifying services...');
    const verifySnapshot = await getDocs(servicesRef);
    const services = [];
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      services.push({ name: data.name, price: data.price, order: data.order });
    });
    
    services.sort((a, b) => a.order - b.order);
    console.log('\nServices in database (sorted by order):');
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - $${service.price} (Order: ${service.order})`);
    });
    
    console.log('\n✅ Service update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating services:', error);
    process.exit(1);
  }
}

updateServices();
