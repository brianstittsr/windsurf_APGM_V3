/**
 * Geographical Competitor Analysis Service
 * Analyzes local competitors using Google Places API
 */

import axios from 'axios';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface GeoCompetitorConfig {
  googleMapsApiKey: string;
  dataForSeoLogin?: string;
  dataForSeoPassword?: string;
}

export interface Competitor {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalReviews: number;
  priceLevel?: number;
  phone?: string;
  website?: string;
  businessStatus: string;
  types: string[];
  openNow?: boolean;
  photos?: string[];
  distance?: number;
  estimatedPricing?: PricingEstimate;
  socialMedia?: SocialMediaPresence;
}

export interface PricingEstimate {
  microblading?: { min: number; max: number };
  powderBrows?: { min: number; max: number };
  lipBlush?: { min: number; max: number };
  eyeliner?: { min: number; max: number };
  source: 'website' | 'estimated' | 'unknown';
}

export interface SocialMediaPresence {
  instagram?: { handle: string; followers?: number };
  facebook?: { page: string; likes?: number };
  tiktok?: { handle: string; followers?: number };
}

export interface CompetitorAnalysis {
  competitor: Competitor;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'nicher';
}

export interface MarketAnalysis {
  totalCompetitors: number;
  averageRating: number;
  averageReviews: number;
  priceRange: { min: number; max: number };
  marketSaturation: 'low' | 'medium' | 'high';
  competitors: Competitor[];
  recommendations: string[];
  topCompetitors: Competitor[];
  nearbyCompetitors: Competitor[];
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number; // in meters
  keyword?: string;
}

// ============================================================================
// Geo Competitor Analysis Service
// ============================================================================

export class GeoCompetitorAnalysisService {
  private googleMapsApiKey: string;
  private dataForSeoAuth?: string;

  constructor(config: GeoCompetitorConfig) {
    this.googleMapsApiKey = config.googleMapsApiKey;
    
    if (config.dataForSeoLogin && config.dataForSeoPassword) {
      this.dataForSeoAuth = Buffer.from(
        `${config.dataForSeoLogin}:${config.dataForSeoPassword}`
      ).toString('base64');
    }
  }

  // --------------------------------------------------------------------------
  // Search Competitors
  // --------------------------------------------------------------------------

  async searchCompetitors(params: SearchParams): Promise<Competitor[]> {
    const { latitude, longitude, radius, keyword = 'permanent makeup microblading' } = params;

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius,
            keyword,
            type: 'beauty_salon',
            key: this.googleMapsApiKey
          }
        }
      );

      const places = response.data.results || [];
      const competitors: Competitor[] = [];

      for (const place of places) {
        const competitor = await this.enrichCompetitorData(place, latitude, longitude);
        competitors.push(competitor);
      }

      // Sort by rating and reviews
      competitors.sort((a, b) => {
        const scoreA = a.rating * Math.log(a.totalReviews + 1);
        const scoreB = b.rating * Math.log(b.totalReviews + 1);
        return scoreB - scoreA;
      });

      return competitors;
    } catch (error) {
      console.error('Error searching competitors:', error);
      throw error;
    }
  }

  async searchByAddress(address: string, radius: number = 16000): Promise<Competitor[]> {
    try {
      // Geocode the address
      const geocodeResponse = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address,
            key: this.googleMapsApiKey
          }
        }
      );

      if (!geocodeResponse.data.results?.[0]) {
        throw new Error('Address not found');
      }

      const location = geocodeResponse.data.results[0].geometry.location;
      
      return this.searchCompetitors({
        latitude: location.lat,
        longitude: location.lng,
        radius
      });
    } catch (error) {
      console.error('Error searching by address:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Get Competitor Details
  // --------------------------------------------------------------------------

  async getCompetitorDetails(placeId: string): Promise<Competitor> {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            fields: 'name,formatted_address,geometry,rating,user_ratings_total,price_level,formatted_phone_number,website,business_status,types,opening_hours,photos,reviews',
            key: this.googleMapsApiKey
          }
        }
      );

      const place = response.data.result;
      
      return {
        placeId: place.place_id || placeId,
        name: place.name,
        address: place.formatted_address,
        location: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0
        },
        rating: place.rating || 0,
        totalReviews: place.user_ratings_total || 0,
        priceLevel: place.price_level,
        phone: place.formatted_phone_number,
        website: place.website,
        businessStatus: place.business_status || 'OPERATIONAL',
        types: place.types || [],
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.slice(0, 5).map((p: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${this.googleMapsApiKey}`
        )
      };
    } catch (error) {
      console.error('Error getting competitor details:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Market Analysis
  // --------------------------------------------------------------------------

  async analyzeMarket(params: SearchParams): Promise<MarketAnalysis> {
    const competitors = await this.searchCompetitors(params);

    if (competitors.length === 0) {
      return {
        totalCompetitors: 0,
        averageRating: 0,
        averageReviews: 0,
        priceRange: { min: 0, max: 0 },
        marketSaturation: 'low',
        competitors: [],
        recommendations: ['Great opportunity! Low competition in this area.'],
        topCompetitors: [],
        nearbyCompetitors: []
      };
    }

    // Calculate statistics
    const ratings = competitors.map(c => c.rating).filter(r => r > 0);
    const reviews = competitors.map(c => c.totalReviews);
    
    const averageRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;
    
    const averageReviews = reviews.length > 0
      ? reviews.reduce((a, b) => a + b, 0) / reviews.length
      : 0;

    // Determine market saturation
    let marketSaturation: 'low' | 'medium' | 'high';
    if (competitors.length <= 5) {
      marketSaturation = 'low';
    } else if (competitors.length <= 15) {
      marketSaturation = 'medium';
    } else {
      marketSaturation = 'high';
    }

    // Get top competitors (by rating * log(reviews))
    const topCompetitors = competitors.slice(0, 5);

    // Get nearby competitors (within 5km)
    const nearbyCompetitors = competitors
      .filter(c => (c.distance || 0) <= 5000)
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      competitors,
      averageRating,
      averageReviews,
      marketSaturation
    );

    return {
      totalCompetitors: competitors.length,
      averageRating,
      averageReviews,
      priceRange: this.estimatePriceRange(competitors),
      marketSaturation,
      competitors,
      recommendations,
      topCompetitors,
      nearbyCompetitors
    };
  }

  // --------------------------------------------------------------------------
  // Competitor SWOT Analysis
  // --------------------------------------------------------------------------

  analyzeCompetitor(competitor: Competitor, yourRating: number = 5, yourReviews: number = 100): CompetitorAnalysis {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // Rating analysis
    if (competitor.rating >= 4.8) {
      strengths.push('Excellent customer ratings');
      threats.push('Strong reputation may attract your potential clients');
    } else if (competitor.rating >= 4.5) {
      strengths.push('Good customer ratings');
    } else if (competitor.rating < 4.0) {
      weaknesses.push('Below-average ratings');
      opportunities.push('Opportunity to capture dissatisfied customers');
    }

    // Reviews analysis
    if (competitor.totalReviews > 200) {
      strengths.push('Large customer base with many reviews');
      threats.push('Established market presence');
    } else if (competitor.totalReviews < 50) {
      weaknesses.push('Limited online presence');
      opportunities.push('Less established - opportunity to outpace');
    }

    // Website analysis
    if (competitor.website) {
      strengths.push('Has online presence');
    } else {
      weaknesses.push('No website found');
      opportunities.push('Better online marketing could win customers');
    }

    // Distance analysis
    if (competitor.distance && competitor.distance < 2000) {
      threats.push('Very close proximity - direct competition');
    } else if (competitor.distance && competitor.distance > 10000) {
      opportunities.push('Geographic distance may reduce direct competition');
    }

    // Determine market position
    let marketPosition: 'leader' | 'challenger' | 'follower' | 'nicher';
    const competitorScore = competitor.rating * Math.log(competitor.totalReviews + 1);
    
    if (competitorScore > 15) {
      marketPosition = 'leader';
    } else if (competitorScore > 10) {
      marketPosition = 'challenger';
    } else if (competitorScore > 5) {
      marketPosition = 'follower';
    } else {
      marketPosition = 'nicher';
    }

    return {
      competitor,
      strengths,
      weaknesses,
      opportunities,
      threats,
      marketPosition
    };
  }

  // --------------------------------------------------------------------------
  // Pricing Analysis
  // --------------------------------------------------------------------------

  async analyzePricing(competitors: Competitor[]): Promise<{
    averagePricing: PricingEstimate;
    pricingRecommendations: string[];
    competitorPricing: Array<{ name: string; pricing: PricingEstimate }>;
  }> {
    // Default PMU pricing ranges based on market research
    const defaultPricing: PricingEstimate = {
      microblading: { min: 350, max: 600 },
      powderBrows: { min: 350, max: 600 },
      lipBlush: { min: 400, max: 650 },
      eyeliner: { min: 300, max: 500 },
      source: 'estimated'
    };

    const competitorPricing: Array<{ name: string; pricing: PricingEstimate }> = [];

    // For each competitor with a website, try to estimate pricing
    for (const competitor of competitors.slice(0, 10)) {
      if (competitor.website) {
        // In a real implementation, you would scrape the website
        // For now, we'll use estimated pricing based on rating and location
        const pricingMultiplier = competitor.rating >= 4.8 ? 1.2 : 
                                   competitor.rating >= 4.5 ? 1.1 : 1.0;

        competitorPricing.push({
          name: competitor.name,
          pricing: {
            microblading: {
              min: Math.round(defaultPricing.microblading!.min * pricingMultiplier),
              max: Math.round(defaultPricing.microblading!.max * pricingMultiplier)
            },
            powderBrows: {
              min: Math.round(defaultPricing.powderBrows!.min * pricingMultiplier),
              max: Math.round(defaultPricing.powderBrows!.max * pricingMultiplier)
            },
            lipBlush: {
              min: Math.round(defaultPricing.lipBlush!.min * pricingMultiplier),
              max: Math.round(defaultPricing.lipBlush!.max * pricingMultiplier)
            },
            eyeliner: {
              min: Math.round(defaultPricing.eyeliner!.min * pricingMultiplier),
              max: Math.round(defaultPricing.eyeliner!.max * pricingMultiplier)
            },
            source: 'estimated'
          }
        });
      }
    }

    // Calculate average pricing
    const avgPricing: PricingEstimate = {
      microblading: { min: 0, max: 0 },
      powderBrows: { min: 0, max: 0 },
      lipBlush: { min: 0, max: 0 },
      eyeliner: { min: 0, max: 0 },
      source: 'estimated'
    };

    if (competitorPricing.length > 0) {
      for (const cp of competitorPricing) {
        avgPricing.microblading!.min += cp.pricing.microblading!.min;
        avgPricing.microblading!.max += cp.pricing.microblading!.max;
        avgPricing.powderBrows!.min += cp.pricing.powderBrows!.min;
        avgPricing.powderBrows!.max += cp.pricing.powderBrows!.max;
        avgPricing.lipBlush!.min += cp.pricing.lipBlush!.min;
        avgPricing.lipBlush!.max += cp.pricing.lipBlush!.max;
        avgPricing.eyeliner!.min += cp.pricing.eyeliner!.min;
        avgPricing.eyeliner!.max += cp.pricing.eyeliner!.max;
      }

      const count = competitorPricing.length;
      avgPricing.microblading!.min = Math.round(avgPricing.microblading!.min / count);
      avgPricing.microblading!.max = Math.round(avgPricing.microblading!.max / count);
      avgPricing.powderBrows!.min = Math.round(avgPricing.powderBrows!.min / count);
      avgPricing.powderBrows!.max = Math.round(avgPricing.powderBrows!.max / count);
      avgPricing.lipBlush!.min = Math.round(avgPricing.lipBlush!.min / count);
      avgPricing.lipBlush!.max = Math.round(avgPricing.lipBlush!.max / count);
      avgPricing.eyeliner!.min = Math.round(avgPricing.eyeliner!.min / count);
      avgPricing.eyeliner!.max = Math.round(avgPricing.eyeliner!.max / count);
    }

    // Generate pricing recommendations
    const pricingRecommendations = [
      `Average microblading price in your area: $${avgPricing.microblading?.min || defaultPricing.microblading!.min} - $${avgPricing.microblading?.max || defaultPricing.microblading!.max}`,
      'Consider pricing 10-15% below market leaders if you\'re building your reputation',
      'Premium pricing (10-20% above average) is justified with 4.8+ rating and 100+ reviews',
      'Offer package deals to increase average transaction value',
      'Consider seasonal promotions during slower months'
    ];

    return {
      averagePricing: avgPricing.microblading!.min > 0 ? avgPricing : defaultPricing,
      pricingRecommendations,
      competitorPricing
    };
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private async enrichCompetitorData(
    place: any,
    originLat: number,
    originLng: number
  ): Promise<Competitor> {
    const competitor: Competitor = {
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || '',
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0
      },
      rating: place.rating || 0,
      totalReviews: place.user_ratings_total || 0,
      priceLevel: place.price_level,
      businessStatus: place.business_status || 'OPERATIONAL',
      types: place.types || [],
      openNow: place.opening_hours?.open_now
    };

    // Calculate distance
    if (competitor.location.lat && competitor.location.lng) {
      competitor.distance = this.calculateDistance(
        originLat,
        originLng,
        competitor.location.lat,
        competitor.location.lng
      );
    }

    return competitor;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private estimatePriceRange(competitors: Competitor[]): { min: number; max: number } {
    // Based on typical PMU pricing
    const basePrices = competitors.map(c => {
      if (c.priceLevel === 1) return 300;
      if (c.priceLevel === 2) return 400;
      if (c.priceLevel === 3) return 500;
      if (c.priceLevel === 4) return 600;
      return 450; // Default
    });

    return {
      min: Math.min(...basePrices),
      max: Math.max(...basePrices)
    };
  }

  private generateRecommendations(
    competitors: Competitor[],
    avgRating: number,
    avgReviews: number,
    saturation: string
  ): string[] {
    const recommendations: string[] = [];

    // Market saturation recommendations
    if (saturation === 'high') {
      recommendations.push('High competition area - focus on differentiation and unique services');
      recommendations.push('Consider niche specialization (e.g., correction work, specific techniques)');
    } else if (saturation === 'low') {
      recommendations.push('Low competition - great opportunity for market entry');
      recommendations.push('Focus on building strong online presence to capture market share');
    }

    // Rating recommendations
    if (avgRating >= 4.5) {
      recommendations.push('Competitors have high ratings - prioritize service quality and customer experience');
    } else {
      recommendations.push('Average ratings are moderate - opportunity to stand out with excellent service');
    }

    // Review recommendations
    if (avgReviews > 100) {
      recommendations.push('Competitors have established review bases - implement aggressive review collection strategy');
    } else {
      recommendations.push('Review counts are low - early mover advantage for building social proof');
    }

    // General recommendations
    recommendations.push('Ensure Google Business Profile is fully optimized with photos and services');
    recommendations.push('Respond to all reviews within 24 hours');
    recommendations.push('Post regular updates and before/after photos');

    return recommendations;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createGeoCompetitorService(): GeoCompetitorAnalysisService {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    throw new Error('Google Maps API key not configured. Set GOOGLE_MAPS_API_KEY environment variable.');
  }

  return new GeoCompetitorAnalysisService({
    googleMapsApiKey,
    dataForSeoLogin: process.env.DATAFORSEO_LOGIN,
    dataForSeoPassword: process.env.DATAFORSEO_PASSWORD
  });
}
