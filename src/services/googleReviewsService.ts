// Google Reviews Service - Client-side service for fetching Google reviews

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

export interface PlaceCandidate {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
}

export class GoogleReviewsService {
  /**
   * Fetch reviews for the configured place using the Places API
   * Uses only production environment variables (via /api/google-reviews endpoint)
   */
  static async getReviews(): Promise<{ success: boolean; data?: PlaceDetails; error?: string; setup?: any }> {
    try {
      // Always use the production API endpoint which reads from environment variables
      const response = await fetch('/api/google-reviews');
      const result = await response.json();
      
      // If not configured or error, throw to show error instead of fallback
      if (!result.success) {
        console.error('Google Reviews API error:', result.error);
        return { success: false, error: result.error || 'Google Reviews not configured' };
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      return { success: false, error: 'Failed to fetch reviews from API' };
    }
  }

  /**
   * Search for a place by name/address to get its Place ID
   */
  static async searchPlace(query: string): Promise<{ success: boolean; candidates?: PlaceCandidate[]; error?: string }> {
    try {
      const response = await fetch('/api/google-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error searching for place:', error);
      return { success: false, error: 'Failed to search for place' };
    }
  }

  /**
   * Format a review for display
   */
  static formatReview(review: GoogleReview): {
    name: string;
    rating: number;
    date: string;
    text: string;
    photoUrl?: string;
    profileUrl?: string;
  } {
    return {
      name: review.author_name,
      rating: review.rating,
      date: review.relative_time_description,
      text: review.text,
      photoUrl: review.profile_photo_url,
      profileUrl: review.author_url
    };
  }

  /**
   * Get star rating as an array for rendering
   */
  static getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full');
      } else if (rating >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  /**
   * Filter reviews by minimum rating
   */
  static filterByRating(reviews: GoogleReview[], minRating: number = 4): GoogleReview[] {
    return reviews.filter(review => review.rating >= minRating);
  }

  /**
   * Sort reviews by date (newest first) or rating (highest first)
   */
  static sortReviews(reviews: GoogleReview[], sortBy: 'date' | 'rating' = 'date'): GoogleReview[] {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'date') {
        return b.time - a.time;
      }
      return b.rating - a.rating;
    });
  }
}
