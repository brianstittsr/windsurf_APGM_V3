import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { ServiceDetailPageContent } from '@/types/database';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);

const genericAftercareBrows: ServiceDetailPageContent['aftercareSections'] = [
  {
    title: 'First 2 Weeks',
    items: [
      'Keep brows dry - avoid water, sweat, and steam',
      'Apply healing ointment as directed',
      "Don't pick or scratch flaking skin",
      'Avoid makeup on the brow area',
      'Sleep on your back to avoid rubbing',
    ],
  },
  {
    title: 'Weeks 2-6',
    items: [
      'Brows may appear lighter - this is normal',
      'Color will gradually return as skin heals',
      'Avoid sun exposure and tanning',
      'Schedule your touch-up appointment',
    ],
  },
];

const genericAftercareLips: ServiceDetailPageContent['aftercareSections'] = [
  {
    title: 'First 2 Weeks',
    items: [
      'Keep lips clean and avoid touching',
      'Apply provided aftercare balm regularly',
      'Avoid spicy, salty, or acidic foods',
      'Do not pick or peel healing skin',
      'Avoid makeup on the lips',
    ],
  },
  {
    title: 'Long Term',
    items: [
      'Use SPF lip balm to protect color',
      'Avoid prolonged sun exposure',
      'Keep lips moisturized for best retention',
    ],
  },
];

const genericAftercareCorrection: ServiceDetailPageContent['aftercareSections'] = [
  {
    title: 'Healing Period',
    items: [
      'Keep the area clean and dry',
      'Do not pick scabs or scratch',
      'Avoid makeup on the treated area',
      'Stay out of direct sunlight and tanning beds',
      'Follow all provided aftercare instructions',
    ],
  },
];

function powderBrowsContent(): ServiceDetailPageContent {
  return {
    heroTitle: 'Powder Brows in Raleigh, NC',
    heroSubtitle: 'Soft, shaded brows with a powdered makeup effect that lasts.',
    benefits: [
      { title: 'Soft & Defined', description: 'Achieve a filled-in brow look that resembles brow powder or pomade.' },
      { title: 'Long-Lasting', description: 'Enjoy beautifully shaded brows for 2-3 years with proper care.' },
      { title: 'Great for All Skin Types', description: 'Powder brows work beautifully on normal, oily, and mature skin.' },
      { title: 'Custom Color', description: 'Pigment is custom-blended to flatter your hair color and complexion.' },
      { title: 'Low Maintenance', description: 'Wake up with polished brows every day without makeup.' },
      { title: 'Buildable Coverage', description: 'Choose a soft tint or a bolder, more dramatic finish.' },
    ],
    candidates: [
      { title: 'Oily skin types', description: 'Powder brows hold better than hair-stroke methods on oily skin.' },
      { title: 'Sparse or uneven brows', description: 'Add shape, symmetry, and fullness.' },
      { title: 'Makeup lovers', description: 'Keep that freshly filled-in brow look 24/7.' },
      { title: 'Active lifestyles', description: 'Sweat, swim, and shower without losing your brows.' },
      { title: 'Anyone wanting a soft gradient', description: 'The ombré-style front is lighter and fades toward the tail.' },
    ],
    processSteps: [
      { number: '1', title: 'Consultation', description: 'We discuss your desired shape, color, and overall brow goals.' },
      { number: '2', title: 'Mapping', description: 'Your ideal brow shape is mapped to complement your features.' },
      { number: '3', title: 'Shading', description: 'Pigment is softly shaded into the skin with a PMU machine.' },
      { number: '4', title: 'Touch-Up', description: 'A perfecting session 6-8 weeks later locks in the color and shape.' },
    ],
    aftercareSections: genericAftercareBrows,
    faqs: [
      { question: 'How long do powder brows last?', answer: 'Powder brows typically last 2-3 years, depending on skin type and lifestyle.' },
      { question: 'Do powder brows look natural?', answer: 'Yes. The shading can be kept soft and natural or built up for a more defined look.' },
      { question: 'What is the healing time?', answer: 'Surface healing takes about 7-14 days, with full color settling over 6 weeks.' },
      { question: 'Can I get powder brows if I have oily skin?', answer: 'Absolutely. Powder brows are an excellent option for oily and combination skin.' },
    ],
    ctaTitle: 'Ready for Soft, Beautiful Brows?',
    ctaText: 'Book your free consultation and discover if powder brows are right for you.',
  };
}

function nanoBrowsContent(): ServiceDetailPageContent {
  return {
    heroTitle: 'Nano Brows in Raleigh, NC',
    heroSubtitle: 'Ultra-fine, hair-like strokes created with a machine for crisp, natural brows.',
    benefits: [
      { title: 'Precise Hair Strokes', description: 'Machine work creates crisp, fine strokes that mimic natural brow hairs.' },
      { title: 'Less Trauma', description: 'Nano brows are gentle on the skin compared to microblading.' },
      { title: 'Great for Sensitive Skin', description: 'A good option for clients who may not be candidates for microblading.' },
      { title: 'Natural Finish', description: 'Achieve realistic brows with soft definition.' },
      { title: 'Custom Design', description: 'Each stroke is placed to enhance your natural brow pattern.' },
      { title: 'Long-Lasting', description: 'Enjoy results that typically last 1-3 years.' },
    ],
    candidates: [
      { title: 'Thin or sparse brows', description: 'Rebuild the appearance of fuller brows.' },
      { title: 'Sensitive or oily skin', description: 'Nano brows can be a gentler alternative.' },
      { title: 'Alopecia or hair loss', description: 'Restore natural-looking brow hairs.' },
      { title: 'Clients wanting realism', description: 'Hair-stroke results without the hand tool.' },
    ],
    processSteps: [
      { number: '1', title: 'Consultation', description: 'We review your goals and determine if nano brows are right for you.' },
      { number: '2', title: 'Brow Design', description: 'Your brows are mapped for symmetry and shape.' },
      { number: '3', title: 'Nano Strokes', description: 'Fine hair-like strokes are implanted with a PMU machine.' },
      { number: '4', title: 'Healing & Touch-Up', description: 'A follow-up perfects color and definition after healing.' },
    ],
    aftercareSections: genericAftercareBrows,
    faqs: [
      { question: 'Are nano brows the same as microblading?', answer: 'Similar in look, but nano brows use a machine instead of a hand tool, often causing less skin trauma.' },
      { question: 'How long do nano brows last?', answer: 'Results typically last 1-3 years depending on skin type and aftercare.' },
      { question: 'Is nano brow painful?', answer: 'A topical numbing cream is used to keep you comfortable during the procedure.' },
    ],
    ctaTitle: 'Get Natural-Looking Nano Brows',
    ctaText: 'Schedule your consultation to see if nano brows are the perfect fit.',
  };
}

function refreshContent(serviceName: string): ServiceDetailPageContent {
  return {
    heroTitle: `${serviceName} in Raleigh, NC`,
    heroSubtitle: 'Refresh and perfect your existing permanent makeup with a touch-up session.',
    benefits: [
      { title: 'Restore Color', description: 'Bring faded pigment back to life for vibrant results.' },
      { title: 'Refine Shape', description: 'Adjust the brow, lip, or liner shape as desired.' },
      { title: 'Extend Results', description: 'Keep your permanent makeup looking fresh longer.' },
      { title: 'Quick Procedure', description: 'Touch-ups are typically shorter than the initial appointment.' },
      { title: 'Maintain Your Investment', description: 'Routine refreshes protect the look you love.' },
    ],
    candidates: [
      { title: 'Previous PMU clients', description: 'Anyone who has had permanent makeup done and needs a refresh.' },
      { title: 'Faded results', description: 'Color that has lightened over time.' },
      { title: 'Shape changes', description: 'Clients wanting to tweak or refine their existing look.' },
    ],
    processSteps: [
      { number: '1', title: 'Assessment', description: 'Victoria evaluates your existing permanent makeup.' },
      { number: '2', title: 'Design', description: 'The refreshed shape and color are planned.' },
      { number: '3', title: 'Touch-Up', description: 'Pigment is carefully added to refresh and perfect.' },
      { number: '4', title: 'Aftercare', description: 'Follow the healing instructions for best retention.' },
    ],
    aftercareSections: genericAftercareBrows,
    faqs: [
      { question: 'When should I book a refresh?', answer: 'Timing depends on the service; refreshes are typically recommended within the specified window after your initial session.' },
      { question: 'Is a refresh the same as the first session?', answer: 'It is usually shorter, focusing on reinforcing color and shape rather than a full new design.' },
    ],
    ctaTitle: 'Refresh Your Look Today',
    ctaText: 'Book your touch-up and keep your permanent makeup looking its best.',
  };
}

function salineLighteningContent(): ServiceDetailPageContent {
  return {
    heroTitle: 'Saline Tattoo Lightening in Raleigh, NC',
    heroSubtitle: 'A safe, non-laser method to lighten unwanted permanent makeup or small tattoos.',
    benefits: [
      { title: 'Non-Laser Option', description: 'Gentle saline lifting without laser treatments.' },
      { title: 'Safe for PMU', description: 'Designed for use around delicate brow and lip areas.' },
      { title: 'Gradual Results', description: 'Multiple sessions lighten pigment over time.' },
      { title: 'Prep for New Work', description: 'Lighten old pigment before a new PMU procedure.' },
      { title: 'Minimal Downtime', description: 'Healing is typically quick between sessions.' },
    ],
    candidates: [
      { title: 'Unwanted old PMU', description: 'Lighten brows, lips, or small tattoos you no longer want.' },
      { title: 'Preparing for cover-up', description: 'Fade existing pigment before new work.' },
      { title: 'Laser-sensitive clients', description: 'Those who prefer a non-laser approach.' },
    ],
    processSteps: [
      { number: '1', title: 'Consultation', description: 'We assess the area and set realistic expectations.' },
      { number: '2', title: 'Application', description: 'Saline solution is tattooed into the skin to lift pigment.' },
      { number: '3', title: 'Healing', description: 'The skin heals and pigment naturally lifts to the surface.' },
      { number: '4', title: 'Repeat', description: 'Multiple sessions may be needed for desired lightness.' },
    ],
    aftercareSections: genericAftercareCorrection,
    faqs: [
      { question: 'How many sessions will I need?', answer: 'Most clients need multiple sessions spaced several weeks apart.' },
      { question: 'Does saline removal hurt?', answer: 'A topical numbing agent is used to minimize discomfort.' },
      { question: 'Can all colors be removed?', answer: 'Results vary based on pigment type, depth, and age of the tattoo.' },
    ],
    ctaTitle: 'Lighten Unwanted Pigment',
    ctaText: 'Schedule a saline tattoo lightening consultation to discuss your options.',
  };
}

function fullFaceContent(): ServiceDetailPageContent {
  return {
    heroTitle: 'Full Face Edit in Raleigh, NC',
    heroSubtitle: 'A complete permanent makeup transformation for brows, lips, and eyeliner.',
    benefits: [
      { title: 'Complete Transformation', description: 'Wake up with polished brows, defined eyes, and tinted lips.' },
      { title: 'Coordinated Look', description: 'Color and style are designed to harmonize across features.' },
      { title: 'Save Time', description: 'Cut your daily makeup routine dramatically.' },
      { title: 'Custom for You', description: 'Every feature is tailored to your face shape and preferences.' },
      { title: 'Long-Lasting', description: 'Enjoy a cohesive look with results that last for years.' },
    ],
    candidates: [
      { title: 'Busy professionals', description: 'Perfect for those who want to simplify their beauty routine.' },
      { title: 'Makeup minimalists', description: 'Great for clients who want to wake up ready.' },
      { title: 'Anyone wanting a refresh', description: 'Refresh multiple features in one curated plan.' },
    ],
    processSteps: [
      { number: '1', title: 'Consultation', description: 'We design a full-face plan for brows, lips, and eyeliner.' },
      { number: '2', title: 'Brows', description: 'Shape and define your brows to frame your face.' },
      { number: '3', title: 'Lips', description: 'Add natural color and definition to your lips.' },
      { number: '4', title: 'Eyeliner', description: 'Enhance your eyes with subtle or defined liner.' },
    ],
    aftercareSections: [
      { title: 'General Aftercare', items: ['Follow specific instructions for each treated area', 'Keep areas clean and dry', 'Avoid makeup and harsh products during healing', 'Use recommended aftercare products', 'Return for touch-ups as scheduled'] },
    ],
    faqs: [
      { question: 'Can all features be done in one day?', answer: 'Timing depends on the selected services; your plan will be customized during the consultation.' },
      { question: 'Is the full face package discounted?', answer: 'Package pricing is available; details will be discussed during your consultation.' },
    ],
    ctaTitle: 'Transform Your Morning Routine',
    ctaText: 'Book a full face consultation and design your complete permanent makeup look.',
  };
}

function duoContent(serviceName: string): ServiceDetailPageContent {
  return {
    heroTitle: `${serviceName} in Raleigh, NC`,
    heroSubtitle: 'Combine two popular permanent makeup services for a cohesive, time-saving look.',
    benefits: [
      { title: 'Coordinated Results', description: 'Services are designed to complement each other.' },
      { title: 'Save Time', description: 'Wake up with two features already done.' },
      { title: 'Custom Design', description: 'Colors and shapes are matched to your features.' },
      { title: 'Convenient', description: 'Combine appointments for an efficient beauty routine.' },
    ],
    candidates: [
      { title: 'Clients wanting multiple features', description: 'Ideal for brows + lips or brows + liner combos.' },
      { title: 'Busy schedules', description: 'One plan, fewer appointments.' },
    ],
    processSteps: [
      { number: '1', title: 'Consultation', description: 'We plan the combination of services that fits your goals.' },
      { number: '2', title: 'Design', description: 'Each feature is mapped and color-matched.' },
      { number: '3', title: 'Procedure', description: 'Services are performed with precision and care.' },
      { number: '4', title: 'Touch-Ups', description: 'Perfecting sessions complete each feature.' },
    ],
    aftercareSections: genericAftercareBrows,
    faqs: [
      { question: 'Can I combine services?', answer: 'Yes, many clients choose to pair services for a complete look.' },
      { question: 'How long does a duo session take?', answer: 'Session length depends on the services selected and will be reviewed at consultation.' },
    ],
    ctaTitle: 'Build Your Perfect Duo',
    ctaText: 'Schedule a consultation to customize your permanent makeup combination.',
  };
}

function consultationContent(serviceName: string): ServiceDetailPageContent {
  return {
    heroTitle: `${serviceName} in Raleigh, NC`,
    heroSubtitle: 'Discuss your goals, explore options, and design a plan tailored to you.',
    benefits: [
      { title: 'Personalized Plan', description: 'Get recommendations based on your features and goals.' },
      { title: 'Ask Questions', description: 'Learn about techniques, healing, and aftercare.' },
      { title: 'Shape Preview', description: 'See a preview of your potential brow or lip design.' },
      { title: 'No Pressure', description: 'Take time to decide on the right service for you.' },
    ],
    candidates: [
      { title: 'New clients', description: 'Perfect for anyone considering permanent makeup for the first time.' },
      { title: 'Unsure which service', description: 'Compare options with professional guidance.' },
      { title: 'Existing clients', description: 'Plan touch-ups, corrections, or new services.' },
    ],
    processSteps: [
      { number: '1', title: 'Book', description: 'Choose a convenient time for your consultation.' },
      { number: '2', title: 'Discuss Goals', description: 'Share what you want to achieve with Victoria.' },
      { number: '3', title: 'Design Preview', description: 'See a rough sketch or color recommendation.' },
      { number: '4', title: 'Plan', description: 'Schedule your procedure if you decide to move forward.' },
    ],
    aftercareSections: [],
    faqs: [
      { question: 'Is the consultation free?', answer: 'Consultation details, including any fees, will be confirmed when you book.' },
      { question: 'Can I book my procedure the same day?', answer: 'Procedures are typically scheduled after the consultation to allow proper planning.' },
    ],
    ctaTitle: 'Book Your Consultation Today',
    ctaText: 'Take the first step toward effortless, beautiful permanent makeup.',
  };
}

function generateContent(serviceName: string, category: string): ServiceDetailPageContent {
  const name = serviceName.toLowerCase();
  if (name.includes('consult') || name.includes('preview')) return consultationContent(serviceName);
  if (name.includes('refresh') || name.includes('touch-up') || name.includes('touch up') || name.includes('finish') || name.includes('come back') || name.includes('bring her back')) return refreshContent(serviceName);
  if (name.includes('saline')) return salineLighteningContent();
  if (name.includes('full face')) return fullFaceContent();
  if (name.includes('duo') || name.includes('combo') || (name.includes('brows') && name.includes('lips'))) return duoContent(serviceName);
  if (name.includes('powder')) return powderBrowsContent();
  if (name.includes('nano')) return nanoBrowsContent();
  if (category === 'lips') return {
    ...refreshContent(serviceName),
    heroTitle: `${serviceName} in Raleigh, NC`,
    heroSubtitle: 'Enhance your natural lip color with a custom lip blush treatment.',
    aftercareSections: genericAftercareLips,
    ctaTitle: 'Get Beautiful, Defined Lips',
    ctaText: 'Book your lip blush consultation and discover your perfect lip color.',
  };
  // Fallback by category
  if (category === 'eyebrows') return powderBrowsContent();
  if (category === 'correction') return salineLighteningContent();
  return consultationContent(serviceName);
}

async function main() {
  // Static pages already exist under src/app/services/; skip those directories.
  const servicesDir = path.resolve(process.cwd(), 'src/app/services');
  const existingDirs = fs
    .readdirSync(servicesDir)
    .filter((f) => fs.statSync(path.join(servicesDir, f)).isDirectory())
    .filter((f) => f !== '[slug]');

  console.log('Existing static service pages:', existingDirs.join(', '));

  const snap = await db.collection('services').get();
  const services = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

  let updated = 0;
  for (const service of services) {
    if (!service.isActive) {
      console.log(`Skipping inactive: ${service.name}`);
      continue;
    }

    // Skip inactive services and services whose explicit link already points
    // to a static detail page (e.g., a hand-written page under src/app/services).
    const link = service.link?.trim();
    if (existingDirs.includes(link)) {
      console.log(`Skipping service with static detail page: ${service.name}`);
      continue;
    }

    // If the service already has a link and detail content, leave it alone.
    if (link && service.detailPageContent) {
      console.log(`Skipping service with existing custom detail page: ${service.name}`);
      continue;
    }

    const nameSlug = slugify(service.name);
    const newLink = link || nameSlug;
    const newContent: ServiceDetailPageContent =
      service.detailPageContent || generateContent(service.name, service.category);

    await db.collection('services').doc(service.id).update({
      link: newLink,
      detailPageContent: newContent,
      updatedAt: new Date(),
    });

    console.log(`Updated: ${service.name} -> /services/${newLink}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} service(s) with detail-page content.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
