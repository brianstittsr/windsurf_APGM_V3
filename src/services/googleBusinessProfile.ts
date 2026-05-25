/**
 * Google Business Profile API Service
 * Implements the Google Business Profile API v4 for review management
 * 
 * API Reference: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews
 */

import { google } from 'googleapis';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface GoogleBusinessProfileConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export interface GoogleBusinessReview {
  name: string; // Resource name: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string; // RFC 3339 timestamp
  updateTime: string; // RFC 3339 timestamp
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
  reviewMediaItems?: Array<{
    thumbnailUrl: string;
    thumbnailLabel?: string;
    videoUrl?: string;
  }>;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
  responseRate: number;
  repliedCount: number;
  unrepliedCount: number;
}

export interface ListReviewsResponse {
  reviews: GoogleBusinessReview[];
  nextPageToken?: string;
  totalReviewCount?: number;
  averageRating?: number;
}

export interface ReplyTemplate {
  type: 'positive' | 'neutral' | 'negative';
  templates: string[];
}

// ============================================================================
// Google Business Profile Service
// ============================================================================

export class GoogleBusinessProfileService {
  private oauth2Client: any;
  private accountId: string | null = null;
  private locationId: string | null = null;

  constructor(config: GoogleBusinessProfileConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });
    }
  }

  // --------------------------------------------------------------------------
  // OAuth Flow
  // --------------------------------------------------------------------------

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/business.manage'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  setCredentials(tokens: any): void {
    this.oauth2Client.setCredentials(tokens);
  }

  // --------------------------------------------------------------------------
  // Account & Location Management
  // --------------------------------------------------------------------------

  async getAccounts(): Promise<any[]> {
    try {
      const mybusiness = google.mybusinessaccountmanagement({
        version: 'v1',
        auth: this.oauth2Client
      });

      const response = await mybusiness.accounts.list();
      return response.data.accounts || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getLocations(accountId: string): Promise<any[]> {
    try {
      const mybusinessInfo = google.mybusinessbusinessinformation({
        version: 'v1',
        auth: this.oauth2Client
      });

      const response = await mybusinessInfo.accounts.locations.list({
        parent: accountId,
        readMask: 'name,title,storefrontAddress,metadata'
      });

      return response.data.locations || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  setAccountAndLocation(accountId: string, locationId: string): void {
    this.accountId = accountId;
    this.locationId = locationId;
  }

  // --------------------------------------------------------------------------
  // Review Operations
  // --------------------------------------------------------------------------

  /**
   * List all reviews for a location
   * GET /v4/{parent=accounts/*/locations/*}/reviews
   */
  async listReviews(
    pageSize: number = 50,
    pageToken?: string,
    orderBy: string = 'updateTime desc'
  ): Promise<ListReviewsResponse> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set before listing reviews');
    }

    try {
      const accessToken = await this.getAccessToken();
      const parent = `${this.accountId}/${this.locationId}`;
      
      let url = `https://mybusiness.googleapis.com/v4/${parent}/reviews?pageSize=${pageSize}&orderBy=${encodeURIComponent(orderBy)}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        reviews: data.reviews || [],
        nextPageToken: data.nextPageToken,
        totalReviewCount: data.totalReviewCount,
        averageRating: data.averageRating
      };
    } catch (error) {
      console.error('Error listing reviews:', error);
      throw error;
    }
  }

  /**
   * Get a single review
   * GET /v4/{name=accounts/*/locations/*/reviews/*}
   */
  async getReview(reviewId: string): Promise<GoogleBusinessReview | null> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set');
    }

    try {
      const accessToken = await this.getAccessToken();
      const name = `${this.accountId}/${this.locationId}/reviews/${reviewId}`;
      
      const response = await fetch(`https://mybusiness.googleapis.com/v4/${name}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get review: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting review:', error);
      throw error;
    }
  }

  /**
   * Reply to a review
   * PUT /v4/{name=accounts/*/locations/*/reviews/*}/reply
   */
  async replyToReview(reviewId: string, comment: string): Promise<boolean> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set');
    }

    try {
      const accessToken = await this.getAccessToken();
      const name = `${this.accountId}/${this.locationId}/reviews/${reviewId}`;
      
      const response = await fetch(`https://mybusiness.googleapis.com/v4/${name}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: comment
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to reply: ${error.error?.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  }

  /**
   * Delete a review reply
   * DELETE /v4/{name=accounts/*/locations/*/reviews/*}/reply
   */
  async deleteReply(reviewId: string): Promise<boolean> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set');
    }

    try {
      const accessToken = await this.getAccessToken();
      const name = `${this.accountId}/${this.locationId}/reviews/${reviewId}`;
      
      const response = await fetch(`https://mybusiness.googleapis.com/v4/${name}/reply`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete reply: ${error.error?.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Statistics
  // --------------------------------------------------------------------------

  async getReviewStats(): Promise<ReviewStats> {
    const result = await this.listReviews(100);
    const reviews = result.reviews;

    const distribution = {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0
    };

    let repliedCount = 0;

    reviews.forEach(review => {
      const rating = review.starRating;
      switch (rating) {
        case 'ONE': distribution.one++; break;
        case 'TWO': distribution.two++; break;
        case 'THREE': distribution.three++; break;
        case 'FOUR': distribution.four++; break;
        case 'FIVE': distribution.five++; break;
      }

      if (review.reviewReply) {
        repliedCount++;
      }
    });

    const totalReviews = reviews.length;
    const responseRate = totalReviews > 0 ? (repliedCount / totalReviews) * 100 : 0;

    // Calculate weighted average
    const totalStars = distribution.one * 1 + 
                       distribution.two * 2 + 
                       distribution.three * 3 + 
                       distribution.four * 4 + 
                       distribution.five * 5;
    const averageRating = totalReviews > 0 ? totalStars / totalReviews : 0;

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution: distribution,
      responseRate: parseFloat(responseRate.toFixed(1)),
      repliedCount,
      unrepliedCount: totalReviews - repliedCount
    };
  }

  // --------------------------------------------------------------------------
  // Reply Templates & Generation
  // --------------------------------------------------------------------------

  getReplyTemplates(): ReplyTemplate[] {
    return [
      {
        type: 'positive',
        templates: [
          "Thank you so much for your wonderful review, {name}! We're thrilled you had a great experience with us. We look forward to seeing you again soon!",
          "Thank you for your kind words, {name}! It was a pleasure serving you. We appreciate your support and look forward to your next visit!",
          "We're so glad you enjoyed your experience, {name}! Thank you for taking the time to share your feedback. See you next time!"
        ]
      },
      {
        type: 'neutral',
        templates: [
          "Thank you for your feedback, {name}. We appreciate you taking the time to share your experience with us. We look forward to serving you again!",
          "Thank you for your review, {name}. We're always working to improve and appreciate your input. We hope to see you again soon!"
        ]
      },
      {
        type: 'negative',
        templates: [
          "Thank you for your feedback, {name}. We're sorry to hear your experience didn't meet expectations. We'd love to make this right - please contact us directly at {phone} or {email} so we can address your concerns.",
          "We appreciate you sharing your experience, {name}. We're disappointed to hear we fell short and would welcome the opportunity to discuss this with you. Please reach out to us at {phone} or {email}."
        ]
      }
    ];
  }

  generateAutoReply(
    review: GoogleBusinessReview,
    businessPhone: string = '(404) 555-1234',
    businessEmail: string = 'info@aprettygirlmatter.com'
  ): string {
    const rating = review.starRating;
    const templates = this.getReplyTemplates();
    
    let type: 'positive' | 'neutral' | 'negative';
    if (rating === 'FIVE' || rating === 'FOUR') {
      type = 'positive';
    } else if (rating === 'THREE') {
      type = 'neutral';
    } else {
      type = 'negative';
    }

    const typeTemplates = templates.find(t => t.type === type)?.templates || templates[0].templates;
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

    const name = review.reviewer.displayName || 'valued customer';
    
    return template
      .replace('{name}', name)
      .replace('{phone}', businessPhone)
      .replace('{email}', businessEmail);
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private async getAccessToken(): Promise<string> {
    const credentials = await this.oauth2Client.getAccessToken();
    return credentials.token;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createGoogleBusinessProfileService(): GoogleBusinessProfileService {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error(
      'Google Business Profile API not configured. ' +
      'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    );
  }

  return new GoogleBusinessProfileService({
    clientId,
    clientSecret,
    redirectUri,
    refreshToken
  });
}
