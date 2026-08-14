import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const newServices = [
  {
    name: 'Annual Brow Refresh',
    price: 450.00,
    duration: '1 hr 30 min',
    description: 'For existing clients returning approximately 6–18 months after previous brow session for maintenance and color refreshing.\n\nThis appointment helps restore softness, definition, and longevity while maintaining the integrity of the original brow work.',
    category: 'eyebrows',
    image: '',
    isActive: true,
    requirements: [
      'Must be an existing client with previous brow work',
      'Must be 18 years or older',
      'Not pregnant or breastfeeding',
      'No blood-thinning medications 48 hours prior'
    ],
    contraindications: [
      'Pregnancy or breastfeeding',
      'Active skin conditions in treatment area',
      'Recent Botox or facial treatments (within 2 weeks)'
    ],
    order: 100
  },
  {
    name: 'Brow Boost',
    price: 350.00,
    duration: '1 hr 30 min',
    description: 'Designed to refresh your existing Ivey Artistry brows once they\u2019ve naturally softened over time. This maintenance appointment enhances color, definition, and overall shape while preserving your original work. Available exclusively for existing Ivey Artistry clients between 3 and 11 months after their initial appointment. Annual touch-ups beyond 11 months may require additional time and pricing depending on the amount of fading.',
    category: 'eyebrows',
    image: '',
    isActive: true,
    requirements: [
      'Must be an existing Ivey Artistry client',
      'Must be within 3 to 11 months of initial appointment',
      'Must be 18 years or older',
      'Not pregnant or breastfeeding',
      'No blood-thinning medications 48 hours prior'
    ],
    contraindications: [
      'Pregnancy or breastfeeding',
      'Active skin conditions in treatment area',
      'Recent Botox or facial treatments (within 2 weeks)'
    ],
    order: 101
  },
  {
    name: 'Annual Lip Refresh',
    price: 450.00,
    duration: '2 hr',
    description: 'For existing clients returning approximately 1 year or more after previous Lip Blush treatment for color refreshing and maintenance.\n\nThis appointment helps restore softness, vibrancy, and definition while maintaining the integrity of the original healed result.',
    category: 'lips',
    image: '',
    isActive: true,
    requirements: [
      'Must be an existing client with previous Lip Blush treatment',
      'Must be 18 years or older',
      'Not pregnant or breastfeeding',
      'No blood-thinning medications 48 hours prior',
      'History of cold sores requires antiviral medication prior to treatment'
    ],
    contraindications: [
      'Pregnancy or breastfeeding',
      'Active cold sores or fever blisters',
      'Active skin conditions in treatment area',
      'Recent Botox or facial treatments (within 2 weeks)'
    ],
    order: 102
  },
  {
    name: 'Brow Refinement (4-8 weeks)',
    price: 225.00,
    duration: '1 hr',
    description: 'An optional refinement appointment for clients who would benefit from additional density, definition, or adjustments after healing. Recommended for select skin types or sparse natural brows based on healed results. Available exclusively for A Pretty Girl Matter clients within 4 to 8 weeks of their initial appointment.',
    category: 'eyebrows',
    image: '',
    isActive: true,
    requirements: [
      'Must be an existing A Pretty Girl Matter client',
      'Must be within 4 to 8 weeks of initial appointment',
      'Must be 18 years or older',
      'Not pregnant or breastfeeding'
    ],
    contraindications: [
      'Pregnancy or breastfeeding',
      'Active skin conditions in treatment area',
      'Recent Botox or facial treatments (within 2 weeks)'
    ],
    order: 103
  },
  {
    name: 'Saline Tattoo Lightening Consultation',
    price: 0.01,
    duration: '30 min',
    description: 'Saline Tattoo Lightening is a non-laser method designed to gradually lighten unwanted pigment in tattooed eyebrows or body tattoos using a gentle, natural solution. This technique works by implanting a saline and fruit extract-based solution into the skin, which lifts and fades the pigment over multiple sessions.\n\nSafe for both cosmetic and body tattoos\nBreaks up pigment naturally without harsh chemicals or lasers\nDoes NOT completely remove the tattoo in one session\u2014lightens gradually\nIdeal for those wanting to correct or fade previous work before a cover-up\n\nResults vary based on pigment depth, skin type, and number of sessions needed.',
    category: 'correction',
    image: '',
    isActive: false,
    requirements: [
      'Must be 18 years or older',
      'Not pregnant or breastfeeding'
    ],
    contraindications: [
      'Pregnancy or breastfeeding',
      'Active skin conditions in treatment area',
      'Keloid-prone skin'
    ],
    order: 104
  },
  {
    name: 'Saline Tattoo Lightening',
    price: 300.00,
    duration: '2 hr',
    description: 'Saline Tattoo Lightening is a non-laser method designed to gradually lighten unwanted pigment in tattooed eyebrows or body tattoos using a gentle, natural solution. This technique works by implanting a saline and fruit extract-based solution into the skin, which lifts and fades the pigment over multiple sessions.\n\nSafe for both cosmetic and body tattoos\nBreaks up pigment naturally without harsh chemicals or lasers\nDoes NOT completely remove the tattoo in one session\u2014lightens gradually\nIdeal for those wanting to correct or fade previous work before a cover-up\n\nResults vary based on pigment depth, skin type, and number of sessions needed.',
    category: 'correction',
    image: '',
    isActive: true,
    requirements: [
      'Must be 18 years or older',
      'Not pregnant or breastfeeding',
      'No blood-thinning medications 48 hours prior'
    ],
    contraindications: [
      'Pregnancy or breastfeeding',
      'Active skin conditions in treatment area',
      'Keloid-prone skin',
      'Recent sunburn or tanning in treatment area'
    ],
    order: 105
  }
];

export async function POST(request: NextRequest) {
  try {
    const results: Array<{ name: string; success: boolean; id?: string; error?: string }> = [];

    for (const service of newServices) {
      try {
        const docRef = await db.collection('services').add({
          ...service,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        results.push({ name: service.name, success: true, id: docRef.id });
        console.log(`✅ Created service: ${service.name} (${docRef.id})`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ name: service.name, success: false, error: errorMsg });
        console.error(`❌ Failed to create service: ${service.name}`, error);
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failed === 0,
      message: `Seeded ${succeeded} services${failed > 0 ? `, ${failed} failed` : ''}`,
      results
    }, { status: failed === 0 ? 200 : 500 });
  } catch (error) {
    console.error('Seed Victoria services error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
