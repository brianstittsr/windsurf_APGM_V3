/**
 * Google Places API Endpoint
 * Fetches business reviews using the Google Places API
 * Stores reviews in Firebase for persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { createGooglePlacesService, GooglePlacesService } from '@/services/google-places';

let placesService: GooglePlacesService | null = null;

// Lazy load Firebase Admin to prevent initialization errors
async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch (error) {
    console.warn('Firebase Admin not available:', error);
    return null;
  }
}

function getService(): GooglePlacesService {
  if (!placesService) {
    placesService = createGooglePlacesService();
  }
  return placesService;
}

function isServiceConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

/**
 * Store reviews in Firebase for persistence
 */
async function storeReviewsInFirebase(placeId: string, details: any) {
  try {
    const db = await getFirebaseDb();
    if (!db) {
      console.warn('Firebase not initialized, skipping review storage');
      return;
    }

    const reviewsRef = db.collection('google-reviews');
    const batch = db.batch();
    const timestamp = new Date().toISOString();

    // Store place details
    const placeDocRef = reviewsRef.doc(placeId);
    batch.set(placeDocRef, {
      placeId,
      name: details.name,
      rating: details.rating,
      userRatingsTotal: details.userRatingsTotal,
      formattedAddress: details.formattedAddress,
      formattedPhoneNumber: details.formattedPhoneNumber,
      website: details.website,
      url: details.url,
      lastUpdated: timestamp
    }, { merge: true });

    // Store individual reviews
    if (details.reviews && details.reviews.length > 0) {
      for (const review of details.reviews) {
        // Create a unique ID for each review based on author and time
        const reviewId = `${placeId}_${review.authorName?.replace(/\s+/g, '_')}_${review.time}`;
        const reviewDocRef = reviewsRef.doc(placeId).collection('reviews').doc(reviewId);
        
        batch.set(reviewDocRef, {
          authorName: review.authorName,
          authorPhotoUrl: review.authorPhotoUrl,
          rating: review.rating,
          text: review.text,
          relativeTimeDescription: review.relativeTimeDescription,
          time: review.time,
          language: review.language,
          lastUpdated: timestamp
        }, { merge: true });
      }
    }

    await batch.commit();
    console.log(`Stored ${details.reviews?.length || 0} reviews for place ${placeId}`);
  } catch (error) {
    console.error('Error storing reviews in Firebase:', error);
    // Don't throw - we still want to return the reviews even if storage fails
  }
}

// ============================================================================
// POST - Places operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, placeId, query } = body;

    // Check if service is configured
    if (!isServiceConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Places API not configured',
          message: 'Please set GOOGLE_PLACES_API_KEY environment variable',
          configured: false
        },
        { status: 503 }
      );
    }

    const service = getService();

    switch (action) {
      // Search for a place by name
      case 'search': {
        if (!query) {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          );
        }
        const results = await service.searchPlace(query);
        return NextResponse.json({ 
          success: true, 
          results 
        });
      }

      // Get place details including reviews
      case 'details': {
        if (!placeId) {
          return NextResponse.json(
            { error: 'Place ID is required' },
            { status: 400 }
          );
        }
        const details = await service.getPlaceDetails(placeId);
        
        // Store reviews in Firebase
        await storeReviewsInFirebase(placeId, details);
        
        return NextResponse.json({ 
          success: true, 
          details 
        });
      }

      // Get reviews for a place
      case 'reviews': {
        if (!placeId) {
          return NextResponse.json(
            { error: 'Place ID is required' },
            { status: 400 }
          );
        }
        const details = await service.getPlaceDetails(placeId);
        
        // Store reviews in Firebase
        await storeReviewsInFirebase(placeId, details);
        
        return NextResponse.json({ 
          success: true, 
          reviews: details.reviews 
        });
      }

      // Get review statistics
      case 'stats': {
        if (!placeId) {
          return NextResponse.json(
            { error: 'Place ID is required' },
            { status: 400 }
          );
        }
        const stats = await service.getReviewStats(placeId);
        return NextResponse.json({ 
          success: true, 
          stats 
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: ['search', 'details', 'reviews', 'stats']
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Google Places API error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Google Places API not configured',
          message: 'Please set GOOGLE_PLACES_API_KEY environment variable'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Quick access to place details
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    if (!isServiceConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Places API not configured',
          message: 'Please set GOOGLE_PLACES_API_KEY environment variable',
          configured: false
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId query parameter is required' },
        { status: 400 }
      );
    }

    const service = getService();
    const details = await service.getPlaceDetails(placeId);

    return NextResponse.json({ 
      success: true, 
      details 
    });
  } catch (error: any) {
    console.error('Google Places API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get place details', details: error.message },
      { status: 500 }
    );
  }
}
