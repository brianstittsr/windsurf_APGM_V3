/**
 * Google Reviews Service
 * Integrates with Google Business Profile API for review management
 */

import { google } from 'googleapis';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface GoogleReviewsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
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
  recentReviews: GoogleReview[];
}

export interface ReviewReplyTemplate {
  type: 'positive' | 'neutral' | 'negative';
  templates: string[];
}

// ============================================================================
// Google Reviews Service
// ============================================================================

export class GoogleReviewsService {
  private oauth2Client: any;
  private mybusiness: any;
  private accountId: string | null = null;
  private locationId: string | null = null;

  constructor(config: GoogleReviewsConfig) {
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

    this.mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: this.oauth2Client
    });
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

  async getTokenFromCode(code: string): Promise<any> {
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
      const response = await this.mybusiness.accounts.list();
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
        readMask: 'name,title,storefrontAddress'
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

  async listReviews(pageSize: number = 50, pageToken?: string): Promise<{
    reviews: GoogleReview[];
    nextPageToken?: string;
    totalReviewCount: number;
    averageRating: number;
  }> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set before listing reviews');
    }

    try {
      const mybusinessInfo = google.mybusinessbusinessinformation({
        version: 'v1',
        auth: this.oauth2Client
      });

      // Note: Reviews API is part of My Business API v4 (deprecated) or Account Management
      // Using the newer approach with separate API calls
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/${this.accountId}/${this.locationId}/reviews?pageSize=${pageSize}${pageToken ? `&pageToken=${pageToken}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${(await this.oauth2Client.getAccessToken()).token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      const reviews: GoogleReview[] = (data.reviews || []).map((review: any) => ({
        reviewId: review.reviewId || review.name?.split('/').pop(),
        reviewer: {
          displayName: review.reviewer?.displayName || 'Anonymous',
          profilePhotoUrl: review.reviewer?.profilePhotoUrl,
          isAnonymous: review.reviewer?.isAnonymous || false
        },
        starRating: review.starRating,
        comment: review.comment,
        createTime: review.createTime,
        updateTime: review.updateTime,
        reviewReply: review.reviewReply ? {
          comment: review.reviewReply.comment,
          updateTime: review.reviewReply.updateTime
        } : undefined
      }));

      return {
        reviews,
        nextPageToken: data.nextPageToken,
        totalReviewCount: data.totalReviewCount || reviews.length,
        averageRating: data.averageRating || this.calculateAverageRating(reviews)
      };
    } catch (error) {
      console.error('Error listing reviews:', error);
      throw error;
    }
  }

  async getReview(reviewId: string): Promise<GoogleReview | null> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set');
    }

    try {
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/${this.accountId}/${this.locationId}/reviews/${reviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await this.oauth2Client.getAccessToken()).token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const review = await response.json();

      return {
        reviewId: review.reviewId || review.name?.split('/').pop(),
        reviewer: {
          displayName: review.reviewer?.displayName || 'Anonymous',
          profilePhotoUrl: review.reviewer?.profilePhotoUrl,
          isAnonymous: review.reviewer?.isAnonymous || false
        },
        starRating: review.starRating,
        comment: review.comment,
        createTime: review.createTime,
        updateTime: review.updateTime,
        reviewReply: review.reviewReply ? {
          comment: review.reviewReply.comment,
          updateTime: review.reviewReply.updateTime
        } : undefined
      };
    } catch (error) {
      console.error('Error getting review:', error);
      throw error;
    }
  }

  async replyToReview(reviewId: string, replyText: string): Promise<boolean> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set');
    }

    try {
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/${this.accountId}/${this.locationId}/reviews/${reviewId}/reply`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${(await this.oauth2Client.getAccessToken()).token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: replyText
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  }

  async deleteReply(reviewId: string): Promise<boolean> {
    if (!this.accountId || !this.locationId) {
      throw new Error('Account and location must be set');
    }

    try {
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/${this.accountId}/${this.locationId}/reviews/${reviewId}/reply`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${(await this.oauth2Client.getAccessToken()).token}`
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Analytics & Stats
  // --------------------------------------------------------------------------

  async getReviewStats(): Promise<ReviewStats> {
    const { reviews, totalReviewCount, averageRating } = await this.listReviews(100);

    const ratingDistribution = {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0
    };

    let repliedCount = 0;

    for (const review of reviews) {
      switch (review.starRating) {
        case 'ONE': ratingDistribution.one++; break;
        case 'TWO': ratingDistribution.two++; break;
        case 'THREE': ratingDistribution.three++; break;
        case 'FOUR': ratingDistribution.four++; break;
        case 'FIVE': ratingDistribution.five++; break;
      }

      if (review.reviewReply) {
        repliedCount++;
      }
    }

    return {
      totalReviews: totalReviewCount,
      averageRating,
      ratingDistribution,
      responseRate: reviews.length > 0 ? (repliedCount / reviews.length) * 100 : 0,
      recentReviews: reviews.slice(0, 5)
    };
  }

  // --------------------------------------------------------------------------
  // Auto-Reply Templates
  // --------------------------------------------------------------------------

  getReplyTemplates(): ReviewReplyTemplate[] {
    return [
      {
        type: 'positive',
        templates: [
          "Thank you so much for your wonderful review, {name}! We're thrilled that you loved your {service} experience at Atlanta Glamour PMU. Your kind words mean the world to us! 💕",
          "We're so grateful for your 5-star review, {name}! It was a pleasure working with you, and we're delighted that you're happy with your results. See you at your touch-up! ✨",
          "{name}, thank you for taking the time to share your experience! We loved having you in our studio and are so happy you're pleased with your new look. You look amazing! 🌟"
        ]
      },
      {
        type: 'neutral',
        templates: [
          "Thank you for your feedback, {name}. We appreciate you taking the time to share your experience. If there's anything we can do to improve, please don't hesitate to reach out to us directly.",
          "Hi {name}, we appreciate your honest review. Your feedback helps us grow and improve. Please feel free to contact us if you'd like to discuss your experience further.",
          "Thank you for visiting Atlanta Glamour PMU, {name}. We value your feedback and would love the opportunity to exceed your expectations on your next visit."
        ]
      },
      {
        type: 'negative',
        templates: [
          "Hi {name}, we're sorry to hear that your experience didn't meet your expectations. Your satisfaction is our top priority. Please contact us directly at [phone] so we can make this right.",
          "{name}, thank you for bringing this to our attention. We take all feedback seriously and would like to resolve this for you. Please reach out to us at [email] at your earliest convenience.",
          "We apologize for any inconvenience, {name}. This isn't the experience we strive to provide. Please contact our team directly so we can address your concerns and find a solution."
        ]
      }
    ];
  }

  generateAutoReply(review: GoogleReview, businessPhone?: string, businessEmail?: string): string {
    const templates = this.getReplyTemplates();
    const reviewerName = review.reviewer.displayName || 'Valued Customer';
    
    let templateType: 'positive' | 'neutral' | 'negative';
    
    switch (review.starRating) {
      case 'FIVE':
      case 'FOUR':
        templateType = 'positive';
        break;
      case 'THREE':
        templateType = 'neutral';
        break;
      default:
        templateType = 'negative';
    }

    const templateGroup = templates.find(t => t.type === templateType);
    if (!templateGroup) return '';

    const randomTemplate = templateGroup.templates[Math.floor(Math.random() * templateGroup.templates.length)];
    
    return randomTemplate
      .replace(/{name}/g, reviewerName)
      .replace(/\[phone\]/g, businessPhone || process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(404) 555-1234')
      .replace(/\[email\]/g, businessEmail || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@atlantaglamourpmu.com');
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private calculateAverageRating(reviews: GoogleReview[]): number {
    if (reviews.length === 0) return 0;

    const ratingMap: Record<string, number> = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5
    };

    const total = reviews.reduce((sum, review) => {
      return sum + (ratingMap[review.starRating] || 0);
    }, 0);

    return total / reviews.length;
  }

  starRatingToNumber(rating: string): number {
    const map: Record<string, number> = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5
    };
    return map[rating] || 0;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createGoogleReviewsService(): GoogleReviewsService {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
  }

  return new GoogleReviewsService({
    clientId,
    clientSecret,
    redirectUri,
    refreshToken
  });
}
