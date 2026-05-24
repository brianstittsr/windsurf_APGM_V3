/**
 * Add Evening Appointments Hero Slide
 * 
 * This script adds a hero slide for evening appointments with the provided images.
 * 
 * Prerequisites:
 *   1. Place the desktop image at: public/images/hero/evening-appointments-desktop.jpg
 *   2. Place the mobile image at: public/images/hero/evening-appointments-mobile.jpg
 * 
 * Usage:
 *   npm run add-evening-slide
 */

import { HeroSlideService } from '../services/heroSlideService';

async function addEveningAppointmentsSlide() {
  console.log('🌙 Adding Evening Appointments Hero Slide...\n');

  try {
    // Check if slide already exists
    const existingSlides = await HeroSlideService.getAllSlides();
    const existingSlide = existingSlides.find(
      slide => slide.title.toLowerCase().includes('evening appointments')
    );

    if (existingSlide) {
      console.log('⚠️ An evening appointments slide already exists:');
      console.log(`   Title: ${existingSlide.title}`);
      console.log(`   ID: ${existingSlide.id}`);
      console.log('\n💡 To update it, delete the existing slide first or use the admin dashboard.');
      return;
    }

    // Get next order number
    const maxOrder = existingSlides.reduce((max, slide) => Math.max(max, slide.order), -1);
    const nextOrder = maxOrder + 1;

    // Create the evening appointments slide
    const slideData = {
      title: 'EVENING APPOINTMENTS NOW AVAILABLE',
      hideTitle: false,
      subtitle: 'LUXURY BROWS DESIGNED',
      highlightText: 'to fit your schedule',
      description: 'Every girl is pretty and every girl matters.',
      backgroundImage: '/images/hero/evening-appointments-desktop.jpg',
      mobileBackgroundImage: '/images/hero/evening-appointments-mobile.jpg',
      backgroundVideo: '',
      buttonText: 'Book Evening Appointment',
      buttonLink: '/book-now-custom',
      buttonStyle: 'primary' as const,
      textAlignment: 'center' as const,
      overlayOpacity: 20, // Low opacity to let the image show through
      isActive: true,
      order: nextOrder,
      styleType: 'standard' as const,
      reviewerName: '',
      reviewRating: 5,
      reviewDate: '',
      reviewText: '',
      afterPhoto: '',
      certificationName: '',
      certificationOrg: '',
      certificationYear: '',
      certificationBadge: ''
    };

    const slideId = await HeroSlideService.createSlide(slideData);

    console.log('✅ Evening appointments slide created successfully!');
    console.log(`   ID: ${slideId}`);
    console.log(`   Order: ${nextOrder}`);
    console.log('\n📋 Slide Details:');
    console.log(`   Title: ${slideData.title}`);
    console.log(`   Desktop Image: ${slideData.backgroundImage}`);
    console.log(`   Mobile Image: ${slideData.mobileBackgroundImage}`);
    console.log(`   Button: ${slideData.buttonText} → ${slideData.buttonLink}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Ensure images are uploaded to the correct paths:');
    console.log('      - Desktop: public/images/hero/evening-appointments-desktop.jpg');
    console.log('      - Mobile: public/images/hero/evening-appointments-mobile.jpg');
    console.log('   2. Run your development server: npm run dev');
    console.log('   3. Visit your site to see the new slide in the hero carousel');
    console.log('   4. Manage slides at: /dashboard (Hero Carousel tab)');

  } catch (error) {
    console.error('❌ Error creating evening appointments slide:', error);
    process.exit(1);
  }
}

// Run the script
addEveningAppointmentsSlide();
