import { NextRequest, NextResponse } from 'next/server';

// Google Places API endpoint
const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

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
              '3. Enable "Places API" in APIs & Services',
              '4. Create an API key in Credentials',
              '5. Find your Place ID at: https://developers.google.com/maps/documentation/places/web-service/place-id',
              '6. Add both variables to Vercel Environment Variables for production'
            ]
          }
        },
        { status: 200 } // Return 200 so UI can show setup instructions gracefully
      );
    }

    // Fetch place details including reviews
    const url = `${GOOGLE_PLACES_API_BASE}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number,website,url&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Places API HTTP error:', response.status);
      return NextResponse.json(
        { 
          success: false, 
          error: `Google API HTTP error: ${response.status}`,
          notConfigured: false
        },
        { status: 200 }
      );
    }
    
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: `Google API error: ${data.status}`,
          details: data.error_message || 'Unknown error',
          notConfigured: false
        },
        { status: 200 }
      );
    }

    const placeDetails: PlaceDetails = {
      name: data.result?.name || 'Unknown',
      rating: data.result?.rating || 0,
      user_ratings_total: data.result?.user_ratings_total || 0,
      reviews: data.result?.reviews || [],
      formatted_address: data.result?.formatted_address,
      formatted_phone_number: data.result?.formatted_phone_number,
      website: data.result?.website,
      url: data.result?.url
    };

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

    // Search for the place
    const searchUrl = `${GOOGLE_PLACES_API_BASE}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { success: false, error: `Google API error: ${data.status}` },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      candidates: data.candidates || []
    });

  } catch (error) {
    console.error('Error searching for place:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search for place', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    );
  }
}
