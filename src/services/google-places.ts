/**
 * Google Places API Service
 * Fetches business reviews using the Google Places API (New)
 * This is simpler than Business Profile API and doesn't require special access approval
 */

export interface PlaceReview {
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number; // Unix timestamp
  language?: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating: number;
  userRatingsTotal: number;
  reviews: PlaceReview[];
  url?: string;
  website?: string;
  formattedPhoneNumber?: string;
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Places API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for a place by name and get its Place ID
   */
  async searchPlace(query: string): Promise<PlaceSearchResult[]> {
    const url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      formattedAddress: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total
    }));
  }

  /**
   * Get place details including reviews
   * Note: Free tier only returns up to 5 reviews
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'rating',
      'user_ratings_total',
      'reviews',
      'url',
      'website',
      'formatted_phone_number'
    ].join(',');

    const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const result = data.result;
    
    return {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      rating: result.rating || 0,
      userRatingsTotal: result.user_ratings_total || 0,
      reviews: (result.reviews || []).map((review: any) => ({
        authorName: review.author_name,
        authorPhotoUrl: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        relativeTimeDescription: review.relative_time_description,
        time: review.time,
        language: review.language
      })),
      url: result.url,
      website: result.website,
      formattedPhoneNumber: result.formatted_phone_number
    };
  }

  /**
   * Get reviews for a place
   * Convenience method that returns just the reviews
   */
  async getReviews(placeId: string): Promise<PlaceReview[]> {
    const details = await this.getPlaceDetails(placeId);
    return details.reviews;
  }

  /**
   * Get review statistics for a place
   */
  async getReviewStats(placeId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const details = await this.getPlaceDetails(placeId);
    
    // Calculate rating distribution from available reviews
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    details.reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });

    return {
      totalReviews: details.userRatingsTotal,
      averageRating: details.rating,
      ratingDistribution: distribution
    };
  }
}

/**
 * Factory function to create Google Places Service
 */
export function createGooglePlacesService(): GooglePlacesService {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Places API key not configured. Set GOOGLE_PLACES_API_KEY environment variable.');
  }

  return new GooglePlacesService(apiKey);
}
