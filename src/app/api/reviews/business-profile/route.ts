/**
 * Google Business Profile API Endpoint
 * Manages Google Business Profile reviews
 * 
 * API Reference: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createGoogleBusinessProfileService,
  GoogleBusinessProfileService 
} from '@/services/googleBusinessProfile';

// Initialize service lazily
let reviewsService: GoogleBusinessProfileService | null = null;
let serviceError: string | null = null;

function getService(): GoogleBusinessProfileService {
  if (serviceError) {
    throw new Error(serviceError);
  }
  if (!reviewsService) {
    try {
      reviewsService = createGoogleBusinessProfileService();
    } catch (err: any) {
      serviceError = err.message;
      throw err;
    }
  }
  return reviewsService;
}

function isServiceConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
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
      comment,
      pageSize = 50,
      pageToken,
      orderBy = 'updateTime desc'
    } = body;

    // Check if service is configured before trying to use it
    if (!isServiceConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Business Profile API not configured',
          message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
          configured: false
        },
        { status: 503 }
      );
    }

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
        const tokens = await service.exchangeCodeForTokens(code);
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

      // List reviews for a location
      case 'list_reviews': {
        if (!accountId || !locationId) {
          return NextResponse.json(
            { error: 'Account ID and Location ID are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const result = await service.listReviews(pageSize, pageToken, orderBy);
        return NextResponse.json({ 
          success: true, 
          ...result 
        });
      }

      // Get a single review
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

      // Get review statistics
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

      // Reply to a review
      case 'reply': {
        if (!accountId || !locationId || !reviewId || !comment) {
          return NextResponse.json(
            { error: 'Account ID, Location ID, Review ID, and comment are required' },
            { status: 400 }
          );
        }
        service.setAccountAndLocation(accountId, locationId);
        const success = await service.replyToReview(reviewId, comment);
        return NextResponse.json({ 
          success, 
          message: 'Reply posted successfully'
        });
      }

      // Delete a reply
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
          message: 'Reply deleted successfully'
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

      // Generate auto-reply
      case 'generate_reply': {
        const { review, businessPhone, businessEmail } = body;
        if (!review) {
          return NextResponse.json(
            { error: 'Review data is required' },
            { status: 400 }
          );
        }
        const suggestedReply = service.generateAutoReply(review, businessPhone, businessEmail);
        return NextResponse.json({ 
          success: true, 
          suggestedReply 
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'get_auth_url', 'exchange_code', 'list_accounts', 'list_locations',
              'list_reviews', 'get_review', 'stats', 'reply', 'delete_reply',
              'get_templates', 'generate_reply'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Google Business Profile API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process request',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Check configuration status
// ============================================================================

export async function GET() {
  const configured = isServiceConfigured();
  
  return NextResponse.json({
    success: true,
    configured,
    message: configured 
      ? 'Google Business Profile API is configured'
      : 'Google Business Profile API not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN (optional)']
  });
}
