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
  private newApiUrl = 'https://places.googleapis.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Places API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for a place by name and get its Place ID (New API)
   */
  async searchPlace(query: string): Promise<PlaceSearchResult[]> {
    const url = `${this.newApiUrl}/places:searchText`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount'
      },
      body: JSON.stringify({
        textQuery: query
      })
    });
    
    const data = await response.json();

    if (data.error) {
      throw new Error(`Places API error: ${data.error.code} - ${data.error.message}`);
    }

    return (data.places || []).map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || '',
      formattedAddress: place.formattedAddress || '',
      rating: place.rating,
      userRatingsTotal: place.userRatingCount
    }));
  }

  /**
   * Get place details including reviews (New API)
   * Note: Free tier only returns up to 5 reviews
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const url = `${this.newApiUrl}/places/${placeId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,reviews,googleMapsUri,websiteUri,nationalPhoneNumber'
      }
    });
    
    const data = await response.json();

    if (data.error) {
      throw new Error(`Places API error: ${data.error.code} - ${data.error.message}`);
    }
    
    return {
      placeId: data.id,
      name: data.displayName?.text || '',
      formattedAddress: data.formattedAddress || '',
      rating: data.rating || 0,
      userRatingsTotal: data.userRatingCount || 0,
      reviews: (data.reviews || []).map((review: any) => ({
        authorName: review.authorAttribution?.displayName || 'Anonymous',
        authorPhotoUrl: review.authorAttribution?.photoUri,
        rating: review.rating,
        text: review.text?.text || '',
        relativeTimeDescription: review.relativePublishTimeDescription || '',
        time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : 0,
        language: review.text?.languageCode
      })),
      url: data.googleMapsUri,
      website: data.websiteUri,
      formattedPhoneNumber: data.nationalPhoneNumber
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
