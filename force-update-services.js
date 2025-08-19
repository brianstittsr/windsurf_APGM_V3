require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, deleteDoc, getDocs, doc, setDoc } = require('firebase/firestore');

// Firebase config
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

async function forceUpdateServices() {
  try {
    console.log('Force updating services with correct order...');
    console.log('Firebase Config:', {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    });
    
    const servicesRef = collection(db, 'services');
    
    // Delete all existing services
    console.log('Deleting all existing services...');
    const snapshot = await getDocs(servicesRef);
    console.log(`Found ${snapshot.size} existing services to delete`);
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
      console.log(`Deleted service: ${docSnap.data().name}`);
    }
    
    // Add services with specific IDs to ensure order
    console.log('Adding services with correct order...');
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const serviceId = `service_${i.toString().padStart(2, '0')}`;
      
      await setDoc(doc(db, 'services', serviceId), {
        ...service,
        id: serviceId,
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
      
      console.log(`Added: ${service.name} - $${service.price} (Order: ${service.order}, ID: ${serviceId})`);
    }
    
    // Verify the services were added correctly
    console.log('\nVerifying services...');
    const verifySnapshot = await getDocs(servicesRef);
    console.log(`Total services in database: ${verifySnapshot.size}`);
    
    const servicesData = [];
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      servicesData.push({
        name: data.name,
        price: data.price,
        order: data.order,
        isActive: data.isActive
      });
    });
    
    // Sort by order to verify
    servicesData.sort((a, b) => a.order - b.order);
    console.log('\nServices in order:');
    servicesData.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - $${service.price} (Order: ${service.order})`);
    });
    
    console.log('\nServices updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating services:', error);
    process.exit(1);
  }
}

forceUpdateServices();
