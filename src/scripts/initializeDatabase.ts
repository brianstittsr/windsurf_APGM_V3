import { Timestamp } from 'firebase/firestore';
import { ServiceService, BusinessSettingsService } from '@/services/database';
import { Service, BusinessSettings } from '@/types/database';

// Initialize default services
const defaultServices: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>[] = [
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

// Initialize default business settings
const defaultBusinessSettings: BusinessSettings = {
  general: {
    businessName: "A Pretty Girl Matter",
    address: "Raleigh, NC",
    phone: "(555) 123-4567",
    email: "info@aprettygirl.com",
    workingHours: {
      monday: { start: "09:00", end: "17:00", isWorking: true },
      tuesday: { start: "09:00", end: "17:00", isWorking: true },
      wednesday: { start: "09:00", end: "17:00", isWorking: true },
      thursday: { start: "09:00", end: "17:00", isWorking: true },
      friday: { start: "09:00", end: "17:00", isWorking: true },
      saturday: { start: "10:00", end: "16:00", isWorking: true },
      sunday: { start: "10:00", end: "16:00", isWorking: false }
    },
    timezone: "America/New_York",
    depositPercentage: 30,
    cancellationPolicy: "Clients are requested to arrive on time for their appointments. A grace period of 15 minutes is permitted for appointments exceeding one hour; however, if you arrive more than 15 minutes late, we cannot guarantee your service and will need to reschedule, incurring a $50.00 rebooking fee. All deposits are nonrefundable and will be applied towards the service. Only one reschedule is permitted per appointment.",
    rebookingFee: 50
  },
  booking: {
    advanceBookingDays: 90,
    minNoticeHours: 48,
    maxReschedules: 1,
    autoConfirm: false,
    requireDeposit: true
  },
  payments: {
    stripePublicKey: "",
    acceptedMethods: ["card", "cash", "cherry", "klarna", "paypal"],
    taxRate: 0.0775,
    currency: "USD"
  }
};

// Health form questions
export const healthQuestions = [
  "Are you currently pregnant or breastfeeding?",
  "Do you have any known allergies to cosmetics, pigments, or topical anesthetics?",
  "Are you currently taking any blood-thinning medications (aspirin, warfarin, etc.)?",
  "Do you have a history of keloids or hypertrophic scarring?",
  "Have you had any facial cosmetic procedures in the past 30 days?",
  "Do you have any active skin conditions in the treatment area?",
  "Have you had Botox or facial fillers in the past 2 weeks?",
  "Do you have diabetes?",
  "Do you have any autoimmune disorders?",
  "Are you currently undergoing chemotherapy or radiation treatment?",
  "Do you have a history of cold sores or fever blisters?",
  "Are you taking any medications for acne (Accutane, Retin-A, etc.)?",
  "Do you have any heart conditions or take heart medications?",
  "Have you had any recent sun exposure or tanning?",
  "Do you have any concerns or questions about the procedure?"
];

// Time slots for appointments
export const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Clean up existing services
    console.log('Cleaning up existing services...');
    await ServiceService.deleteAllServices();
    
    // Also specifically remove any "Microbladed Eyebrows" entries that might exist
    console.log('Removing old "Microbladed Eyebrows" entries...');
    await ServiceService.deleteServicesByName('Microbladed Eyebrows');
    await ServiceService.deleteServicesByName('Microblading');

    // Initialize services
    console.log('Creating default services...');
    for (const service of defaultServices) {
      await ServiceService.createService(service);
    }

    // Initialize business settings
    console.log('Creating business settings...');
    await BusinessSettingsService.createOrUpdateSettings(defaultBusinessSettings);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Function to calculate candidate assessment score
export function calculateAssessmentScore(responses: any): {
  isGoodCandidate: boolean;
  score: number;
  recommendations: string[];
  warnings: string[];
  requiresConsultation: boolean;
} {
  let score = 100;
  const recommendations: string[] = [];
  const warnings: string[] = [];
  let requiresConsultation = false;

  // Basic health checks
  if (responses.basic_health.includes('under_18')) {
    score -= 100;
    warnings.push('Must be 18 years or older for permanent makeup procedures');
  }

  if (responses.basic_health.includes('pregnant')) {
    score -= 100;
    warnings.push('Permanent makeup is not recommended during pregnancy');
  }

  if (responses.basic_health.includes('breastfeeding')) {
    score -= 100;
    warnings.push('Permanent makeup is not recommended while breastfeeding');
  }

  // Medical treatments
  if (responses.medical_treatments.includes('blood_thinners')) {
    score -= 30;
    warnings.push('Blood-thinning medications may affect healing');
    requiresConsultation = true;
  }

  if (responses.medical_treatments.includes('accutane')) {
    score -= 50;
    warnings.push('Accutane use requires waiting period before treatment');
    requiresConsultation = true;
  }

  // Medical history
  if (responses.medical_history.includes('keloids')) {
    score -= 40;
    warnings.push('History of keloids may affect healing');
    requiresConsultation = true;
  }

  if (responses.medical_history.includes('autoimmune')) {
    score -= 30;
    warnings.push('Autoimmune conditions may affect healing');
    requiresConsultation = true;
  }

  // Recent treatments
  if (responses.recent_treatments.includes('botox_2weeks')) {
    score -= 20;
    warnings.push('Recent Botox requires waiting period');
  }

  if (responses.recent_treatments.includes('facial_treatments')) {
    score -= 15;
    warnings.push('Recent facial treatments may affect procedure');
  }

  // Skin type considerations
  if (responses.skin_type === 'very_oily') {
    score -= 10;
    recommendations.push('Powder brows technique recommended for oily skin');
  }

  if (responses.skin_type === 'very_sensitive') {
    score -= 15;
    recommendations.push('Patch test recommended for sensitive skin');
  }

  // Generate final recommendations
  if (score >= 80) {
    recommendations.push('You appear to be an excellent candidate for permanent makeup');
  } else if (score >= 60) {
    recommendations.push('You may be a good candidate with some considerations');
    requiresConsultation = true;
  } else if (score >= 40) {
    recommendations.push('Consultation required to determine suitability');
    requiresConsultation = true;
  } else {
    recommendations.push('Additional evaluation needed before proceeding');
    requiresConsultation = true;
  }

  return {
    isGoodCandidate: score >= 60,
    score: Math.max(0, score),
    recommendations,
    warnings,
    requiresConsultation
  };
}
