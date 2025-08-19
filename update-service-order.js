const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Services in correct order with updated pricing
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

async function updateServiceOrder() {
  try {
    console.log('Updating service order in Firebase...');
    
    // Get all existing services
    const servicesSnapshot = await db.collection('services').get();
    console.log(`Found ${servicesSnapshot.size} existing services`);
    
    // Delete all existing services
    const batch = db.batch();
    servicesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Deleted all existing services');
    
    // Add services with correct order
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const docRef = db.collection('services').doc();
      
      await docRef.set({
        ...service,
        id: docRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    
    // Verify the services
    const verifySnapshot = await db.collection('services').orderBy('order').get();
    console.log('\nServices in database (ordered):');
    verifySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name} - $${data.price} (Order: ${data.order})`);
    });
    
    console.log('\n✅ Service order updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating service order:', error);
    process.exit(1);
  }
}

updateServiceOrder();
