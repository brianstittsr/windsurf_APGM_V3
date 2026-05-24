/**
 * Google Reviews Initialization Script
 * 
 * This script initializes the Google Reviews integration for "A Pretty Girl Matter"
 * Location: https://www.google.com/search?q=A+Pretty+Girl+Matter
 * 
 * Usage:
 *   npx ts-node src/scripts/initializeGoogleReviews.ts
 *   or
 *   npm run init-google-reviews
 */

import { GoogleReviewsFirebaseService } from '../services/googleReviewsFirebaseService';
import { GooglePlacesService } from '../services/google-places';

// Configuration - extracted from the provided Google Maps URL
const BUSINESS_INFO = {
  name: 'A Pretty Girl Matter',
  searchQuery: 'A Pretty Girl Matter',
  // The URL contains: mpd=~6057098913130643856
  // This appears to be a merchant platform ID, we'll need to find the actual Place ID
};

/**
 * Initialize Google Reviews configuration
 */
async function initializeGoogleReviews() {
  console.log('🔍 Initializing Google Reviews for "A Pretty Girl Matter"...\n');

  try {
    // Check if API key is configured
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_PLACES_API_KEY environment variable is not set');
      console.log('\nPlease set up your environment variables:');
      console.log('  GOOGLE_PLACES_API_KEY=your_api_key');
      console.log('\nTo get an API key:');
      console.log('  1. Go to https://console.cloud.google.com/');
      console.log('  2. Create a new project or select existing');
      console.log('  3. Enable "Places API (New)"');
      console.log('  4. Create credentials and get your API key');
      process.exit(1);
    }

    // Initialize Google Places Service
    const placesService = new GooglePlacesService(apiKey);

    // Search for the business
    console.log('🔎 Searching for business: "A Pretty Girl Matter"...');
    const searchResults = await placesService.searchPlace(BUSINESS_INFO.searchQuery);

    if (searchResults.length === 0) {
      console.error('❌ No businesses found with that name');
      process.exit(1);
    }

    console.log(`✅ Found ${searchResults.length} result(s):\n`);

    // Display results
    searchResults.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name}`);
      console.log(`     📍 ${place.formattedAddress}`);
      console.log(`     ⭐ ${place.rating || 'N/A'} (${place.userRatingsTotal || 0} reviews)`);
      console.log(`     🆔 Place ID: ${place.placeId}`);
      console.log('');
    });

    // For automation, select the first result
    const selectedPlace = searchResults[0];
    console.log(`📝 Selected: ${selectedPlace.name}\n`);

    // Get detailed information
    console.log('📊 Fetching detailed information...');
    const placeDetails = await placesService.getPlaceDetails(selectedPlace.placeId);

    console.log(`   Business: ${placeDetails.name}`);
    console.log(`   Rating: ${placeDetails.rating} ⭐`);
    console.log(`   Total Reviews: ${placeDetails.userRatingsTotal}`);
    console.log(`   Address: ${placeDetails.formattedAddress}`);
    if (placeDetails.formattedPhoneNumber) {
      console.log(`   Phone: ${placeDetails.formattedPhoneNumber}`);
    }
    if (placeDetails.website) {
      console.log(`   Website: ${placeDetails.website}`);
    }
    if (placeDetails.url) {
      console.log(`   Google Maps: ${placeDetails.url}`);
    }
    console.log('');

    // Check if there are reviews
    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
      console.log(`✅ Found ${placeDetails.reviews.length} reviews\n`);
      console.log('   Sample reviews:');
      placeDetails.reviews.slice(0, 3).forEach((review, index) => {
        console.log(`   ${index + 1}. "${review.text.substring(0, 100)}..." - ${review.authorName} (${review.rating}⭐)`);
      });
    } else {
      console.log('⚠️ No reviews found for this location\n');
    }

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
      console.log('✅ Configuration saved to Firebase!\n');
      
      // Cache the reviews
      console.log('🔄 Caching reviews...');
      const cacheSuccess = await GoogleReviewsFirebaseService.cacheReviews(
        placeDetails.placeId,
        placeDetails.name,
        placeDetails.rating,
        placeDetails.userRatingsTotal,
        placeDetails.reviews,
        60 // Cache for 60 minutes
      );
      
      if (cacheSuccess) {
        console.log('✅ Reviews cached successfully!\n');
      }
      
      // Update last sync
      await GoogleReviewsFirebaseService.updateLastSync(
        'success',
        placeDetails.reviews,
        undefined,
        { rating: placeDetails.rating, userRatingsTotal: placeDetails.userRatingsTotal }
      );

      console.log('\n🎉 Google Reviews integration initialized successfully!\n');
      console.log('Next steps:');
      console.log('  1. Add GOOGLE_PLACES_API_KEY to your .env.local file');
      console.log('  2. Run your development server: npm run dev');
      console.log('  3. Go to Admin Dashboard → Reviews tab');
      console.log('  4. Configure display settings as needed');
      console.log('\nPlace ID to add to environment variables:');
      console.log(`  GOOGLE_PLACE_ID=${placeDetails.placeId}`);
      
    } else {
      console.error('❌ Failed to save configuration');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error initializing Google Reviews:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeGoogleReviews();
