const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();

// Updated services in correct order with new pricing
const services = [
  {
    name: "Bold Combo Eyebrows",
    price: 708,
    duration: "3-4 hours",
    description: "Experience the perfect blend of artistry combining microbladed strokes for natural texture and shaded areas for enhanced definition.",
    category: "eyebrows",
    image: "/images/services/BOLD-COMBO.png",
    isActive: true,
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

async function updateServices() {
  try {
    console.log('Starting service updates...');
    
    // Get all existing services
    const servicesRef = db.collection('services');
    const existingServices = await servicesRef.get();
    
    // Delete existing services
    console.log('Deleting existing services...');
    const batch = db.batch();
    existingServices.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Add updated services in new order
    console.log('Adding updated services...');
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const docRef = servicesRef.doc();
      await docRef.set({
        ...service,
        id: docRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        order: i // Add order field for consistent sorting
      });
      console.log(`Added: ${service.name} - $${service.price}`);
    }
    
    console.log('Service updates completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating services:', error);
    process.exit(1);
  }
}

updateServices();
