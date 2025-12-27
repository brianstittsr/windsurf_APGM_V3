import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// Google Places API (New) endpoint
const GOOGLE_PLACES_API_NEW = 'https://places.googleapis.com/v1';

/**
 * Store reviews in Firebase for persistence
 */
async function storeReviewsInFirebase(placeId: string, placeDetails: PlaceDetails) {
  try {
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
      name: placeDetails.name,
      rating: placeDetails.rating,
      userRatingsTotal: placeDetails.user_ratings_total,
      formattedAddress: placeDetails.formatted_address,
      formattedPhoneNumber: placeDetails.formatted_phone_number,
      website: placeDetails.website,
      url: placeDetails.url,
      lastUpdated: timestamp
    }, { merge: true });

    // Store individual reviews
    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
      for (const review of placeDetails.reviews) {
        // Create a unique ID for each review based on author and time
        const reviewId = `${review.author_name?.replace(/\s+/g, '_')}_${review.time}`;
        const reviewDocRef = reviewsRef.doc(placeId).collection('reviews').doc(reviewId);
        
        batch.set(reviewDocRef, {
          authorName: review.author_name,
          authorUrl: review.author_url,
          authorPhotoUrl: review.profile_photo_url,
          rating: review.rating,
          text: review.text,
          relativeTimeDescription: review.relative_time_description,
          time: review.time,
          lastUpdated: timestamp
        }, { merge: true });
      }
    }

    await batch.commit();
    console.log(`Stored ${placeDetails.reviews?.length || 0} reviews for place ${placeId}`);
  } catch (error) {
    console.error('Error storing reviews in Firebase:', error);
    // Don't throw - we still want to return the reviews even if storage fails
  }
}

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  url?: string;
}

// GET - Fetch reviews for a place
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    // Return setup instructions if not configured (200 status to avoid error in UI)
    if (!apiKey || !placeId) {
      return NextResponse.json(
        { 
          success: false, 
          error: !apiKey ? 'Google Places API key not configured' : 'Google Place ID not configured',
          notConfigured: true,
          setup: {
            message: 'To enable Google Reviews, add these environment variables:',
            variables: [
              'GOOGLE_PLACES_API_KEY=your_api_key',
              'GOOGLE_PLACE_ID=your_place_id'
            ],
            instructions: [
              '1. Go to Google Cloud Console (console.cloud.google.com)',
              '2. Create a new project or select existing',
              '3. Enable "Places API (New)" in APIs & Services',
              '4. Create an API key in Credentials',
              '5. Find your Place ID using the search feature in the Google Reviews dashboard',
              '6. Add both variables to Vercel Environment Variables for production'
            ]
          }
        },
        { status: 200 } // Return 200 so UI can show setup instructions gracefully
      );
    }

    // Fetch place details including reviews using Places API (New)
    const url = `${GOOGLE_PLACES_API_NEW}/places/${placeId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,reviews,googleMapsUri,websiteUri,nationalPhoneNumber'
      }
    });
    
    const data = await response.json();

    if (data.error) {
      console.error('Google Places API error:', data.error);
      return NextResponse.json(
        { 
          success: false, 
          error: `Google API error: ${data.error.code}`,
          details: data.error.message || 'Unknown error',
          notConfigured: false
        },
        { status: 200 }
      );
    }

    // Transform new API response to legacy format for compatibility
    const placeDetails: PlaceDetails = {
      name: data.displayName?.text || 'Unknown',
      rating: data.rating || 0,
      user_ratings_total: data.userRatingCount || 0,
      reviews: (data.reviews || []).map((review: any) => ({
        author_name: review.authorAttribution?.displayName || 'Anonymous',
        author_url: review.authorAttribution?.uri,
        profile_photo_url: review.authorAttribution?.photoUri,
        rating: review.rating,
        relative_time_description: review.relativePublishTimeDescription || '',
        text: review.text?.text || '',
        time: review.publishTime ? Math.floor(new Date(review.publishTime).getTime() / 1000) : 0
      })),
      formatted_address: data.formattedAddress,
      formatted_phone_number: data.nationalPhoneNumber,
      website: data.websiteUri,
      url: data.googleMapsUri
    };

    // Store reviews in Firebase
    await storeReviewsInFirebase(placeId, placeDetails);

    return NextResponse.json({
      success: true,
      data: placeDetails
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Google reviews',
        details: error instanceof Error ? error.message : 'Unknown error',
        notConfigured: false
      },
      { status: 200 } // Return 200 so UI handles gracefully
    );
  }
}

// POST - Search for a place to get its Place ID
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Places API key not configured', notConfigured: true },
        { status: 200 }
      );
    }

    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 200 }
      );
    }

    // Search for the place using Places API (New)
    const url = `${GOOGLE_PLACES_API_NEW}/places:searchText`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount'
      },
      body: JSON.stringify({
        textQuery: query
      })
    });
    
    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { success: false, error: `Google API error: ${data.error.code} - ${data.error.message}` },
        { status: 200 }
      );
    }

    // Transform to legacy format for compatibility
    const candidates = (data.places || []).map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || '',
      formatted_address: place.formattedAddress || '',
      rating: place.rating,
      user_ratings_total: place.userRatingCount
    }));

    return NextResponse.json({
      success: true,
      candidates
    });

  } catch (error) {
    console.error('Error searching for place:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search for place', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    );
  }
}
