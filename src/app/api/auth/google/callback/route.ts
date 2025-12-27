/**
 * Google OAuth Callback Handler
 * Handles the redirect from Google after user authorizes the app
 */

import { NextRequest, NextResponse } from 'next/server';
import { createGoogleReviewsService } from '@/services/google-reviews';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle error from Google
  if (error) {
    console.error('Google OAuth error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/dashboard?tab=google-reviews&error=${encodeURIComponent(error)}`
    );
  }

  // No code provided
  if (!code) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/dashboard?tab=google-reviews&error=no_code`
    );
  }

  try {
    // Exchange code for tokens
    const service = createGoogleReviewsService();
    const tokens = await service.getTokenFromCode(code);

    // In production, you would save the refresh_token to a database
    // For now, we'll redirect with a success message
    // The user should copy the refresh_token and add it to their .env.local
    
    console.log('Google OAuth tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    // If we got a refresh token, show it to the user (for initial setup)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    if (tokens.refresh_token) {
      // Redirect with success and the refresh token for the user to save
      return NextResponse.redirect(
        `${baseUrl}/dashboard?tab=google-reviews&success=connected&refresh_token=${encodeURIComponent(tokens.refresh_token)}`
      );
    } else {
      // No refresh token (user may have already authorized before)
      return NextResponse.redirect(
        `${baseUrl}/dashboard?tab=google-reviews&success=connected&note=no_new_refresh_token`
      );
    }
  } catch (err: any) {
    console.error('Error exchanging Google OAuth code:', err);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/dashboard?tab=google-reviews&error=${encodeURIComponent(err.message || 'token_exchange_failed')}`
    );
  }
}
