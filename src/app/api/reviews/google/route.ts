/**
 * Google Reviews API Endpoint
 * Manages Google Business Profile reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createGoogleReviewsService,
  GoogleReviewsService 
} from '@/services/google-reviews';

// Initialize service lazily
let reviewsService: GoogleReviewsService | null = null;

function getService(): GoogleReviewsService {
  if (!reviewsService) {
    reviewsService = createGoogleReviewsService();
  }
  return reviewsService;
}

// ============================================================================
// POST - Review operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      accountId,
      locationId,
      reviewId,
      replyText,
      pageSize = 50,
      pageToken
    } = body;

    const service = getService();

    switch (action) {
      // Get OAuth URL for authorization
      case 'get_auth_url': {
        const authUrl = service.getAuthUrl();
        return NextResponse.json({ 
          success: true, 
          authUrl 
        });
      }

      // Exchange auth code for tokens
      case 'exchange_code': {
        const { code } = body;
        if (!code) {
          return NextResponse.json(
            { error: 'Authorization code is required' },
            { status: 400 }
          );
        }
        const tokens = await service.getTokenFromCode(code);
        return NextResponse.json({ 
          success: true, 
          tokens,
          message: 'Store the refresh_token securely for future use'
        });
      }

      // List accounts
      case 'list_accounts': {
        const accounts = await service.getAccounts();
        return NextResponse.json({ 
          success: true, 
          accounts 
        });
      }

      // List locations for an account
      case 'list_locations': {
        if (!accountId) {
          return NextResponse.json(
            { error: 'Account ID is required' },
            { status: 400 }
          );
        }
        const locations = await service.getLocations(accountId);
        return NextResponse.json({ 
          success: true, 
          locations 
        });
      }

      // List reviews
      case 'list_reviews': {
        if (!accountId || !locationId) {
          return NextResponse.json(
            { error: 'Account ID and Location ID are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const result = await service.listReviews(pageSize, pageToken);
        return NextResponse.json({ 
          success: true, 
          ...result 
        });
      }

      // Get single review
      case 'get_review': {
        if (!accountId || !locationId || !reviewId) {
          return NextResponse.json(
            { error: 'Account ID, Location ID, and Review ID are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const review = await service.getReview(reviewId);
        return NextResponse.json({ 
          success: true, 
          review 
        });
      }

      // Reply to review
      case 'reply': {
        if (!accountId || !locationId || !reviewId || !replyText) {
          return NextResponse.json(
            { error: 'Account ID, Location ID, Review ID, and reply text are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const success = await service.replyToReview(reviewId, replyText);
        return NextResponse.json({ 
          success, 
          message: success ? 'Reply posted successfully' : 'Failed to post reply'
        });
      }

      // Delete reply
      case 'delete_reply': {
        if (!accountId || !locationId || !reviewId) {
          return NextResponse.json(
            { error: 'Account ID, Location ID, and Review ID are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const success = await service.deleteReply(reviewId);
        return NextResponse.json({ 
          success, 
          message: success ? 'Reply deleted successfully' : 'Failed to delete reply'
        });
      }

      // Get review stats
      case 'stats': {
        if (!accountId || !locationId) {
          return NextResponse.json(
            { error: 'Account ID and Location ID are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const stats = await service.getReviewStats();
        return NextResponse.json({ 
          success: true, 
          stats 
        });
      }

      // Generate auto-reply
      case 'generate_reply': {
        const { review, businessPhone, businessEmail } = body;
        if (!review) {
          return NextResponse.json(
            { error: 'Review data is required' },
            { status: 400 }
          );
        }
        const reply = service.generateAutoReply(review, businessPhone, businessEmail);
        return NextResponse.json({ 
          success: true, 
          suggestedReply: reply 
        });
      }

      // Get reply templates
      case 'get_templates': {
        const templates = service.getReplyTemplates();
        return NextResponse.json({ 
          success: true, 
          templates 
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'get_auth_url',
              'exchange_code',
              'list_accounts',
              'list_locations',
              'list_reviews',
              'get_review',
              'reply',
              'delete_reply',
              'stats',
              'generate_reply',
              'get_templates'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Google Reviews API error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Google Reviews not configured',
          message: 'Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables'
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
// GET - Quick stats
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const locationId = searchParams.get('locationId');

    if (!accountId || !locationId) {
      return NextResponse.json(
        { error: 'accountId and locationId query parameters are required' },
        { status: 400 }
      );
    }

    const service = getService();
    service.setAccountAndLocation(accountId, locationId);
    const stats = await service.getReviewStats();

    return NextResponse.json({ 
      success: true, 
      stats 
    });
  } catch (error: any) {
    console.error('Google Reviews API error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Google Reviews not configured',
          message: 'Please set Google OAuth credentials'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get review stats', details: error.message },
      { status: 500 }
    );
  }
}
