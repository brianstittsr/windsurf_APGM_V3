import { NextRequest, NextResponse } from 'next/server';

interface EyebrowStyle {
  styleId: string;
  styleName: string;
  category: 'microblading' | 'ombré' | 'combo' | 'powder';
  description: string;
  colorPalette: string[];
  strokePattern: string;
  intensity: 'light' | 'medium' | 'bold';
  archHeight: 'natural' | 'high' | 'dramatic';
  thickness: 'thin' | 'medium' | 'thick';
  priceRange: string;
  duration: string;
  healingTime: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  gallery: string[];
  beforeAfter?: {
    before: string;
    after: string;
  };
}

const eyebrowStyles: EyebrowStyle[] = [
  {
    styleId: 'microblading_natural',
    styleName: 'Natural Microblading',
    category: 'microblading',
    description: 'Light, hair-like strokes for natural enhancement. Perfect for everyday wear with subtle definition.',
    colorPalette: ['#8B4513', '#A0522D', '#CD853F'],
    strokePattern: 'hair_like',
    intensity: 'light',
    archHeight: 'natural',
    thickness: 'medium',
    priceRange: '$400-600',
    duration: '2-3 hours',
    healingTime: '7-14 days',
    tags: ['natural', 'everyday', 'professional'],
    difficulty: 'beginner',
    thumbnail: '/images/styles/microblading-natural-thumb.jpg',
    gallery: [
      '/images/styles/microblading-natural-1.jpg',
      '/images/styles/microblading-natural-2.jpg',
      '/images/styles/microblading-natural-3.jpg'
    ],
    beforeAfter: {
      before: '/images/styles/before-microblading.jpg',
      after: '/images/styles/after-microblading-natural.jpg'
    }
  },
  {
    styleId: 'microblading_bold',
    styleName: 'Bold Microblading',
    category: 'microblading',
    description: 'Dramatic, defined hair strokes for a more pronounced look. Ideal for those wanting bold eyebrows.',
    colorPalette: ['#654321', '#8B4513', '#A0522D'],
    strokePattern: 'defined_hair',
    intensity: 'bold',
    archHeight: 'high',
    thickness: 'thick',
    priceRange: '$450-650',
    duration: '2.5-3 hours',
    healingTime: '10-14 days',
    tags: ['bold', 'dramatic', 'defined'],
    difficulty: 'intermediate',
    thumbnail: '/images/styles/microblading-bold-thumb.jpg',
    gallery: [
      '/images/styles/microblading-bold-1.jpg',
      '/images/styles/microblading-bold-2.jpg'
    ]
  },
  {
    styleId: 'ombré_light',
    styleName: 'Light Ombré',
    category: 'ombré',
    description: 'Soft gradient from light to medium color. Subtle shading for a natural everyday look.',
    colorPalette: ['#D2B48C', '#CD853F', '#A0522D'],
    strokePattern: 'soft_gradient',
    intensity: 'light',
    archHeight: 'natural',
    thickness: 'medium',
    priceRange: '$500-700',
    duration: '2-2.5 hours',
    healingTime: '7-10 days',
    tags: ['natural', 'soft', 'gradient'],
    difficulty: 'beginner',
    thumbnail: '/images/styles/ombré-light-thumb.jpg',
    gallery: [
      '/images/styles/ombré-light-1.jpg',
      '/images/styles/ombré-light-2.jpg'
    ]
  },
  {
    styleId: 'ombré_bold',
    styleName: 'Bold Ombré',
    category: 'ombré',
    description: 'Dramatic light to dark gradient. Perfect for those wanting a more defined, filled look.',
    colorPalette: ['#F5DEB3', '#CD853F', '#8B4513'],
    strokePattern: 'dramatic_gradient',
    intensity: 'bold',
    archHeight: 'high',
    thickness: 'thick',
    priceRange: '$550-750',
    duration: '2.5-3 hours',
    healingTime: '10-14 days',
    tags: ['bold', 'dramatic', 'filled'],
    difficulty: 'intermediate',
    thumbnail: '/images/styles/ombré-bold-thumb.jpg',
    gallery: [
      '/images/styles/ombré-bold-1.jpg',
      '/images/styles/ombré-bold-2.jpg',
      '/images/styles/ombré-bold-3.jpg'
    ]
  },
  {
    styleId: 'combo_natural',
    styleName: 'Natural Combo',
    category: 'combo',
    description: 'Subtle combination of hair strokes and soft powder. Natural enhancement with definition.',
    colorPalette: ['#D2B48C', '#CD853F', '#A0522D'],
    strokePattern: 'hybrid_subtle',
    intensity: 'medium',
    archHeight: 'natural',
    thickness: 'medium',
    priceRange: '$600-800',
    duration: '2.5-3.5 hours',
    healingTime: '10-14 days',
    tags: ['natural', 'hybrid', 'subtle'],
    difficulty: 'intermediate',
    thumbnail: '/images/styles/combo-natural-thumb.jpg',
    gallery: [
      '/images/styles/combo-natural-1.jpg',
      '/images/styles/combo-natural-2.jpg'
    ]
  },
  {
    styleId: 'combo_defined',
    styleName: 'Defined Combo',
    category: 'combo',
    description: 'Bold hair strokes with soft powder filling. Dramatic look for special occasions.',
    colorPalette: ['#CD853F', '#8B4513', '#654321'],
    strokePattern: 'hybrid_dramatic',
    intensity: 'bold',
    archHeight: 'dramatic',
    thickness: 'thick',
    priceRange: '$650-850',
    duration: '3-4 hours',
    healingTime: '14-21 days',
    tags: ['dramatic', 'hybrid', 'bold'],
    difficulty: 'advanced',
    thumbnail: '/images/styles/combo-defined-thumb.jpg',
    gallery: [
      '/images/styles/combo-defined-1.jpg',
      '/images/styles/combo-defined-2.jpg'
    ]
  },
  {
    styleId: 'powder_soft',
    styleName: 'Soft Powder',
    category: 'powder',
    description: 'Subtle, everyday powder fill. Natural enhancement with soft definition.',
    colorPalette: ['#F5DEB3', '#D2B48C', '#CD853F'],
    strokePattern: 'soft_fill',
    intensity: 'light',
    archHeight: 'natural',
    thickness: 'thin',
    priceRange: '$400-550',
    duration: '1.5-2 hours',
    healingTime: '5-7 days',
    tags: ['soft', 'everyday', 'subtle'],
    difficulty: 'beginner',
    thumbnail: '/images/styles/powder-soft-thumb.jpg',
    gallery: [
      '/images/styles/powder-soft-1.jpg',
      '/images/styles/powder-soft-2.jpg'
    ]
  },
  {
    styleId: 'powder_defined',
    styleName: 'Defined Powder',
    category: 'powder',
    description: 'More dramatic, filled powder look. Perfect for those wanting a bold, defined finish.',
    colorPalette: ['#CD853F', '#A0522D', '#8B4513'],
    strokePattern: 'defined_fill',
    intensity: 'bold',
    archHeight: 'high',
    thickness: 'thick',
    priceRange: '$500-650',
    duration: '2-2.5 hours',
    healingTime: '7-10 days',
    tags: ['defined', 'bold', 'filled'],
    difficulty: 'intermediate',
    thumbnail: '/images/styles/powder-defined-thumb.jpg',
    gallery: [
      '/images/styles/powder-defined-1.jpg',
      '/images/styles/powder-defined-2.jpg'
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const intensity = searchParams.get('intensity');

    let filteredStyles = [...eyebrowStyles];

    // Apply filters
    if (category && category !== 'all') {
      filteredStyles = filteredStyles.filter(style => style.category === category);
    }

    if (difficulty) {
      filteredStyles = filteredStyles.filter(style => style.difficulty === difficulty);
    }

    if (intensity) {
      filteredStyles = filteredStyles.filter(style => style.intensity === intensity);
    }

    // Add style metadata for analytics
    const styleMetadata = {
      totalStyles: eyebrowStyles.length,
      categories: {
        microblading: eyebrowStyles.filter(s => s.category === 'microblading').length,
        ombré: eyebrowStyles.filter(s => s.category === 'ombré').length,
        combo: eyebrowStyles.filter(s => s.category === 'combo').length,
        powder: eyebrowStyles.filter(s => s.category === 'powder').length
      },
      priceRanges: {
        budget: eyebrowStyles.filter(s => parseInt(s.priceRange.split('-')[0].replace('$', '')) <= 450).length,
        mid: eyebrowStyles.filter(s => {
          const min = parseInt(s.priceRange.split('-')[0].replace('$', ''));
          return min > 450 && min <= 600;
        }).length,
        premium: eyebrowStyles.filter(s => parseInt(s.priceRange.split('-')[0].replace('$', '')) > 600).length
      }
    };

    return NextResponse.json({
      success: true,
      styles: filteredStyles,
      metadata: styleMetadata,
      filters: {
        category: category || 'all',
        difficulty: difficulty || 'all',
        intensity: intensity || 'all'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Styles fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eyebrow styles' },
      { status: 500 }
    );
  }
}
