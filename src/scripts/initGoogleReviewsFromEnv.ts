/**
 * Initialize Google Reviews from Environment Variables
 * 
 * Usage: npx ts-node src/scripts/initGoogleReviewsFromEnv.ts
 */

import { GoogleReviewsFirebaseService } from '../services/googleReviewsFirebaseService';
import { GooglePlacesService } from '../services/google-places';

async function initializeFromEnv() {
  console.log('🔍 Initializing Google Reviews from environment variables...\n');

  try {
    // Check environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey) {
      console.error('❌ GOOGLE_PLACES_API_KEY not set in environment');
      process.exit(1);
    }

    if (!placeId) {
      console.error('❌ GOOGLE_PLACE_ID not set in environment');
      process.exit(1);
    }

    console.log(`✅ Found Place ID: ${placeId}\n`);

    // Initialize Google Places Service
    const placesService = new GooglePlacesService(apiKey);

    // Get place details
    console.log('📊 Fetching place details...');
    const placeDetails = await placesService.getPlaceDetails(placeId);

    console.log(`   Business: ${placeDetails.name}`);
    console.log(`   Rating: ${placeDetails.rating} ⭐`);
    console.log(`   Total Reviews: ${placeDetails.userRatingsTotal}`);
    console.log(`   Address: ${placeDetails.formattedAddress}\n`);

    // Initialize Firebase configuration
    console.log('💾 Saving configuration to Firebase...');

    const success = await GoogleReviewsFirebaseService.initializeConfig(
      placeDetails.placeId,
      {
        businessName: placeDetails.name,
        formattedAddress: placeDetails.formattedAddress,
        formattedPhoneNumber: placeDetails.formattedPhoneNumber,
        website: placeDetails.website,
        googleMapsUrl: placeDetails.url
      }
    );

    if (success) {
      console.log('✅ Configuration saved!\n');

      // Cache the reviews
      if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        console.log(`🔄 Caching ${placeDetails.reviews.length} reviews...`);
        await GoogleReviewsFirebaseService.cacheReviews(
          placeDetails.placeId,
          placeDetails.name,
          placeDetails.rating,
          placeDetails.userRatingsTotal,
          placeDetails.reviews,
          60
        );
        console.log('✅ Reviews cached!\n');
      }

      // Update sync status
      await GoogleReviewsFirebaseService.updateLastSync(
        'success',
        placeDetails.reviews,
        undefined,
        { rating: placeDetails.rating, userRatingsTotal: placeDetails.userRatingsTotal }
      );

      console.log('🎉 Google Reviews integration is now active!');
      console.log('\nYour reviews page will now display real Google Reviews.');
    } else {
      console.error('❌ Failed to save configuration');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeFromEnv();
