/**
 * Google Reviews Integrated API
 * 
 * This API endpoint integrates Google Places API with Firebase configuration
 * to provide a complete Google Reviews solution.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/services/google-places';
import { GoogleReviewsFirebaseService } from '@/services/googleReviewsFirebaseService';
import { 
  GoogleReview, 
  GoogleReviewsStats, 
  GooglePlaceDetails,
  GoogleReviewsConfig 
} from '@/types/googleReviews';

// ============================================================================
// CORS Headers
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================================================
// GET - Fetch Reviews (with Firebase integration)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log('📥 Google Reviews API called');
    
    // Check if Google Reviews is configured in Firebase
    const configCheck = await GoogleReviewsFirebaseService.isConfigured();
    
    if (!configCheck.configured) {
      console.log('❌ Google Reviews not configured:', configCheck.error);
      return NextResponse.json(
        {
          success: false,
          error: configCheck.error,
          notConfigured: true,
          setup: {
            message: 'To enable Google Reviews, run the initialization script:',
            command: 'npm run init-google-reviews',
            requirements: [
              'GOOGLE_PLACES_API_KEY in environment variables',
              'Business Place ID (found via initialization script)'
            ]
          }
        },
        { status: 200, headers: corsHeaders }
      );
    }

    if (!configCheck.active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Reviews integration is currently inactive',
          inactive: true
        },
        { status: 200, headers: corsHeaders }
      );
    }

    const placeId = configCheck.placeId!;
    
    // Get API key from environment
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Places API key not configured in environment',
          notConfigured: true
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Check for cached reviews
    const cachedReviews = await GoogleReviewsFirebaseService.getCachedReviews(placeId);
    const cacheValid = cachedReviews && !cachedReviews.isStale;
    
    // If cache is valid and we're not forcing refresh, return cached data
    const forceRefresh = request.url.includes('refresh=true');
    if (cacheValid && !forceRefresh) {
      console.log('📦 Returning cached reviews');
      
      // Get config for display settings
      const config = await GoogleReviewsFirebaseService.getConfig();
      
      // Apply filters from config
      let reviews = applyFilters(cachedReviews.reviews, config);
      
      return NextResponse.json(
        {
          success: true,
          source: 'cache',
          data: {
            placeId: cachedReviews.placeId,
            name: cachedReviews.businessName,
            rating: cachedReviews.rating,
            userRatingsTotal: cachedReviews.userRatingsTotal,
            reviews: reviews,
            reviewStats: cachedReviews.reviewStats,
            cachedAt: cachedReviews.fetchedAt
          }
        },
        { headers: corsHeaders }
      );
    }

    // Fetch fresh data from Google
    console.log('🔄 Fetching fresh reviews from Google...');
    const placesService = new GooglePlacesService(apiKey);
    const startTime = Date.now();
    
    try {
      const placeDetails = await placesService.getPlaceDetails(placeId);
      const duration = Date.now() - startTime;
      
      // Get Firebase config
      const config = await GoogleReviewsFirebaseService.getConfig();
      
      // Apply filters
      let reviews = applyFilters(placeDetails.reviews, config);
      
      // Cache the results
      await GoogleReviewsFirebaseService.cacheReviews(
        placeId,
        placeDetails.name,
        placeDetails.rating,
        placeDetails.userRatingsTotal,
        placeDetails.reviews,
        config?.syncIntervalMinutes || 60
      );
      
      // Update sync status
      await GoogleReviewsFirebaseService.updateLastSync(
        'success',
        placeDetails.reviews,
        undefined,
        { rating: placeDetails.rating, userRatingsTotal: placeDetails.userRatingsTotal }
      );
      
      // Log the sync
      await GoogleReviewsFirebaseService.logSync(placeId, 'success', {
        reviewsFetched: placeDetails.reviews.length,
        reviewsAdded: placeDetails.reviews.length,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString()
      });

      console.log(`✅ Fetched ${placeDetails.reviews.length} reviews in ${duration}ms`);
      
      return NextResponse.json(
        {
          success: true,
          source: 'google',
          data: {
            placeId: placeDetails.placeId,
            name: placeDetails.name,
            rating: placeDetails.rating,
            userRatingsTotal: placeDetails.userRatingsTotal,
            reviews: reviews,
            reviewStats: await GoogleReviewsFirebaseService.getStats(),
            formattedAddress: placeDetails.formattedAddress,
            formattedPhoneNumber: placeDetails.formattedPhoneNumber,
            website: placeDetails.website,
            url: placeDetails.url
          }
        },
        { headers: corsHeaders }
      );
      
    } catch (googleError: any) {
      console.error('❌ Google API error:', googleError);
      
      // Update sync status with error
      await GoogleReviewsFirebaseService.updateLastSync(
        'error',
        undefined,
        googleError.message
      );
      
      // Log the failed sync
      await GoogleReviewsFirebaseService.logSync(placeId, 'error', {
        reviewsFetched: 0,
        errorMessage: googleError.message,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString()
      });
      
      // If we have cached data, return it as fallback
      if (cachedReviews) {
        console.log('📦 Returning stale cached data due to API error');
        const config = await GoogleReviewsFirebaseService.getConfig();
        let reviews = applyFilters(cachedReviews.reviews, config);
        
        return NextResponse.json(
          {
            success: true,
            source: 'cache-stale',
            stale: true,
            error: `Live fetch failed: ${googleError.message}`,
            data: {
              placeId: cachedReviews.placeId,
              name: cachedReviews.businessName,
              rating: cachedReviews.rating,
              userRatingsTotal: cachedReviews.userRatingsTotal,
              reviews: reviews,
              reviewStats: cachedReviews.reviewStats,
              cachedAt: cachedReviews.fetchedAt
            }
          },
          { headers: corsHeaders }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch from Google: ${googleError.message}`,
          details: googleError.stack
        },
        { status: 200, headers: corsHeaders }
      );
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============================================================================
// POST - Search for places or perform actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, placeId: requestedPlaceId } = body;
    
    console.log('📥 Google Reviews POST:', { action, query, placeId: requestedPlaceId });
    
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Places API key not configured',
          notConfigured: true
        },
        { status: 200, headers: corsHeaders }
      );
    }
    
    const placesService = new GooglePlacesService(apiKey);
    
    switch (action) {
      case 'search': {
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Search query is required' },
            { status: 200, headers: corsHeaders }
          );
        }
        
        const results = await placesService.searchPlace(query);
        return NextResponse.json(
          { success: true, results },
          { headers: corsHeaders }
        );
      }
      
      case 'details': {
        const targetPlaceId = requestedPlaceId || (await GoogleReviewsFirebaseService.getConfig())?.placeId;
        if (!targetPlaceId) {
          return NextResponse.json(
            { success: false, error: 'Place ID not provided and not configured' },
            { status: 200, headers: corsHeaders }
          );
        }
        
        const details = await placesService.getPlaceDetails(targetPlaceId);
        return NextResponse.json(
          { success: true, details },
          { headers: corsHeaders }
        );
      }
      
      case 'stats': {
        const targetPlaceId = requestedPlaceId || (await GoogleReviewsFirebaseService.getConfig())?.placeId;
        if (!targetPlaceId) {
          return NextResponse.json(
            { success: false, error: 'Place ID not provided and not configured' },
            { status: 200, headers: corsHeaders }
          );
        }
        
        const stats = await placesService.getReviewStats(targetPlaceId);
        return NextResponse.json(
          { success: true, stats },
          { headers: corsHeaders }
        );
      }
      
      case 'configure': {
        // Save configuration to Firebase
        const { placeId, businessName, ...settings } = body;
        
        if (!placeId || !businessName) {
          return NextResponse.json(
            { success: false, error: 'Place ID and business name are required' },
            { status: 200, headers: corsHeaders }
          );
        }
        
        const success = await GoogleReviewsFirebaseService.initializeConfig(
          placeId,
          { businessName, ...settings }
        );
        
        if (success) {
          return NextResponse.json(
            { success: true, message: 'Configuration saved successfully' },
            { headers: corsHeaders }
          );
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to save configuration' },
            { status: 200, headers: corsHeaders }
          );
        }
      }
      
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action',
            validActions: ['search', 'details', 'stats', 'configure']
          },
          { status: 200, headers: corsHeaders }
        );
    }
    
  } catch (error: any) {
    console.error('❌ Error in POST handler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process request'
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ============================================================================
// Helper Functions
// ============================================================================

function applyFilters(reviews: GoogleReview[], config: GoogleReviewsConfig | null): GoogleReview[] {
  if (!config) return reviews.slice(0, 10);
  
  let filtered = [...reviews];
  
  // Filter by minimum rating
  if (config.minimumRatingToDisplay > 0) {
    filtered = filtered.filter(r => r.rating >= config.minimumRatingToDisplay);
  }
  
  // Sort
  switch (config.sortOrder) {
    case 'newest':
      filtered.sort((a, b) => b.time - a.time);
      break;
    case 'highest':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'relevant':
      // Keep original order (Google's relevance sorting)
      break;
  }
  
  // Limit
  if (config.maxReviewsToDisplay > 0) {
    filtered = filtered.slice(0, config.maxReviewsToDisplay);
  }
  
  return filtered;
}
