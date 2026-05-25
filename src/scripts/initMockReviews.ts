/**
 * Initialize Mock Google Reviews for Testing
 * 
 * Usage: npx ts-node src/scripts/initMockReviews.ts
 */

import { GoogleReviewsFirebaseService } from '../services/googleReviewsFirebaseService';

// Sample reviews based on typical permanent makeup business feedback
const MOCK_REVIEWS = [
  {
    authorName: 'Sarah M.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'Victoria is absolutely amazing! My eyebrows look so natural and beautiful. I wake up every morning feeling confident. The entire process was comfortable and professional. Highly recommend!',
    relativeTimeDescription: '2 weeks ago',
    time: Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Jennifer K.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'I was nervous about getting permanent eyeliner, but Victoria made me feel so comfortable. The results exceeded my expectations! I love not having to apply eyeliner every day.',
    relativeTimeDescription: '1 month ago',
    time: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Amanda R.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'Best decision I ever made! My lip blushing looks so natural and gives me a beautiful tint every day. Victoria is a true artist and takes her time to get everything perfect.',
    relativeTimeDescription: '2 months ago',
    time: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Michelle T.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'Victoria did my ombre brows and I am in love! The studio is clean, beautiful, and welcoming. She explained everything thoroughly and the results are stunning. Will definitely be back for touch-ups!',
    relativeTimeDescription: '3 months ago',
    time: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Lauren B.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'I had my brows microbladed by Victoria and the experience was wonderful. She is patient, kind, and extremely talented. My brows look perfect and I get compliments all the time!',
    relativeTimeDescription: '4 months ago',
    time: Math.floor(Date.now() / 1000) - (120 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Rachel D.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'Found A Pretty Girl Matter through Google and I am so glad I did! Victoria transformed my thin brows into gorgeous, full brows. The consultation was thorough and she really listened to what I wanted.',
    relativeTimeDescription: '4 months ago',
    time: Math.floor(Date.now() / 1000) - (125 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Christina W.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'Exceptional service from start to finish! Victoria is professional, skilled, and truly cares about her clients. My permanent eyeliner is exactly what I envisioned. Thank you!',
    relativeTimeDescription: '5 months ago',
    time: Math.floor(Date.now() / 1000) - (150 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Nicole H.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'I have been wanting lip blushing for years and finally took the plunge with Victoria. The results are beautiful and natural-looking. I highly recommend her to anyone considering permanent makeup!',
    relativeTimeDescription: '6 months ago',
    time: Math.floor(Date.now() / 1000) - (180 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Stephanie L.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'Victoria is incredible! She fixed my previous bad microblading job and gave me the brows I always wanted. Her expertise and attention to detail are unmatched. Forever grateful!',
    relativeTimeDescription: '7 months ago',
    time: Math.floor(Date.now() / 1000) - (210 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  },
  {
    authorName: 'Melissa G.',
    profilePhotoUrl: '',
    rating: 5,
    text: 'A Pretty Girl Matter is the best permanent makeup studio in Raleigh! Victoria is an artist and her work speaks for itself. I love my new brows and the confidence they give me!',
    relativeTimeDescription: '8 months ago',
    time: Math.floor(Date.now() / 1000) - (240 * 24 * 60 * 60),
    language: 'en',
    isTranslated: false
  }
];

const PLACE_ID = 'ChIJd8SMZi1arIkRd3f9h7Qr0Fc';
const BUSINESS_NAME = 'A Pretty Girl Matter';

async function initializeMockReviews() {
  console.log('🎭 Initializing Mock Google Reviews for testing...\n');

  try {
    // Initialize Firebase configuration
    console.log('💾 Saving configuration to Firebase...');

    const success = await GoogleReviewsFirebaseService.initializeConfig(
      PLACE_ID,
      {
        businessName: BUSINESS_NAME,
        formattedAddress: '4040 Barrett Dr Suite 3, Raleigh, NC 27609',
        formattedPhoneNumber: '(919) 441-0932',
        website: 'https://www.aprettygirlmatter.com',
        googleMapsUrl: 'https://www.google.com/search?q=A+Pretty+Girl+Matter'
      }
    );

    if (success) {
      console.log('✅ Configuration saved!\n');

      // Calculate stats
      const totalReviews = MOCK_REVIEWS.length;
      const averageRating = 5.0; // All 5 stars for mock
      
      // Cache the mock reviews
      console.log(`🔄 Caching ${MOCK_REVIEWS.length} mock reviews...`);
      await GoogleReviewsFirebaseService.cacheReviews(
        PLACE_ID,
        BUSINESS_NAME,
        averageRating,
        totalReviews,
        MOCK_REVIEWS,
        1440 // Cache for 24 hours
      );
      console.log('✅ Mock reviews cached!\n');

      // Update sync status
      await GoogleReviewsFirebaseService.updateLastSync(
        'success',
        MOCK_REVIEWS,
        undefined,
        { rating: averageRating, userRatingsTotal: totalReviews }
      );

      console.log('🎉 Mock Google Reviews initialized successfully!');
      console.log(`\n📊 Stats:`);
      console.log(`   • ${totalReviews} reviews`);
      console.log(`   • ${averageRating} average rating`);
      console.log(`\n🌐 Your reviews page will now display sample reviews.`);
      console.log(`   Visit: http://localhost:3000/reviews`);
      
    } else {
      console.error('❌ Failed to save configuration');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeMockReviews();
