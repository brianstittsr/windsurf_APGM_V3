/**
 * Google Places API Endpoint
 * Fetches business reviews using the Google Places API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createGooglePlacesService, GooglePlacesService } from '@/services/google-places';

let placesService: GooglePlacesService | null = null;

function getService(): GooglePlacesService {
  if (!placesService) {
    placesService = createGooglePlacesService();
  }
  return placesService;
}

function isServiceConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
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
        const reviews = await service.getReviews(placeId);
        return NextResponse.json({ 
          success: true, 
          reviews 
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
