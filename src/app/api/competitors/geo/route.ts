/**
 * Geographical Competitor Analysis API Endpoint
 * Analyzes local PMU competitors using Google Places API
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createGeoCompetitorService,
  GeoCompetitorAnalysisService 
} from '@/services/geo-competitor-analysis';

// Initialize service lazily
let geoService: GeoCompetitorAnalysisService | null = null;

function getService(): GeoCompetitorAnalysisService {
  if (!geoService) {
    geoService = createGeoCompetitorService();
  }
  return geoService;
}

// ============================================================================
// POST - Competitor analysis operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const service = getService();

    switch (action) {
      // Search competitors by coordinates
      case 'search': {
        const { latitude, longitude, radius = 16000, keyword } = body;
        if (!latitude || !longitude) {
          return NextResponse.json(
            { error: 'latitude and longitude are required' },
            { status: 400 }
          );
        }
        const competitors = await service.searchCompetitors({
          latitude,
          longitude,
          radius,
          keyword
        });
        return NextResponse.json({ success: true, competitors });
      }

      // Search competitors by address
      case 'search_by_address': {
        const { address, radius = 16000 } = body;
        if (!address) {
          return NextResponse.json(
            { error: 'address is required' },
            { status: 400 }
          );
        }
        const competitors = await service.searchByAddress(address, radius);
        return NextResponse.json({ success: true, competitors });
      }

      // Get competitor details
      case 'get_details': {
        const { placeId } = body;
        if (!placeId) {
          return NextResponse.json(
            { error: 'placeId is required' },
            { status: 400 }
          );
        }
        const competitor = await service.getCompetitorDetails(placeId);
        return NextResponse.json({ success: true, competitor });
      }

      // Full market analysis
      case 'analyze_market': {
        const { latitude, longitude, radius = 16000, keyword } = body;
        if (!latitude || !longitude) {
          return NextResponse.json(
            { error: 'latitude and longitude are required' },
            { status: 400 }
          );
        }
        const analysis = await service.analyzeMarket({
          latitude,
          longitude,
          radius,
          keyword
        });
        return NextResponse.json({ success: true, analysis });
      }

      // Market analysis by address
      case 'analyze_market_by_address': {
        const { address, radius = 16000 } = body;
        if (!address) {
          return NextResponse.json(
            { error: 'address is required' },
            { status: 400 }
          );
        }
        const competitors = await service.searchByAddress(address, radius);
        
        // Get coordinates from first search to do full analysis
        if (competitors.length > 0) {
          const analysis = await service.analyzeMarket({
            latitude: competitors[0].location.lat,
            longitude: competitors[0].location.lng,
            radius
          });
          return NextResponse.json({ success: true, analysis });
        }
        
        return NextResponse.json({ 
          success: true, 
          analysis: {
            totalCompetitors: 0,
            averageRating: 0,
            averageReviews: 0,
            priceRange: { min: 0, max: 0 },
            marketSaturation: 'low',
            competitors: [],
            recommendations: ['No competitors found in this area - great opportunity!'],
            topCompetitors: [],
            nearbyCompetitors: []
          }
        });
      }

      // SWOT analysis for specific competitor
      case 'analyze_competitor': {
        const { placeId, yourRating = 5, yourReviews = 100 } = body;
        if (!placeId) {
          return NextResponse.json(
            { error: 'placeId is required' },
            { status: 400 }
          );
        }
        const competitor = await service.getCompetitorDetails(placeId);
        const analysis = service.analyzeCompetitor(competitor, yourRating, yourReviews);
        return NextResponse.json({ success: true, analysis });
      }

      // Pricing analysis
      case 'analyze_pricing': {
        const { latitude, longitude, radius = 16000 } = body;
        if (!latitude || !longitude) {
          return NextResponse.json(
            { error: 'latitude and longitude are required' },
            { status: 400 }
          );
        }
        const competitors = await service.searchCompetitors({
          latitude,
          longitude,
          radius
        });
        const pricingAnalysis = await service.analyzePricing(competitors);
        return NextResponse.json({ success: true, ...pricingAnalysis });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'search',
              'search_by_address',
              'get_details',
              'analyze_market',
              'analyze_market_by_address',
              'analyze_competitor',
              'analyze_pricing'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Geo Competitor API error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Google Maps API not configured',
          message: 'Please set GOOGLE_MAPS_API_KEY environment variable'
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
// GET - Quick search
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '16000');

    const service = getService();

    if (address) {
      const competitors = await service.searchByAddress(address, radius);
      return NextResponse.json({ success: true, competitors });
    }

    if (lat && lng) {
      const competitors = await service.searchCompetitors({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius
      });
      return NextResponse.json({ success: true, competitors });
    }

    return NextResponse.json({
      status: 'active',
      endpoint: 'Geographical Competitor Analysis API',
      usage: 'Provide address or lat/lng coordinates as query parameters'
    });
  } catch (error: any) {
    console.error('Geo Competitor API error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Google Maps API not configured',
          message: 'Please set GOOGLE_MAPS_API_KEY environment variable'
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
