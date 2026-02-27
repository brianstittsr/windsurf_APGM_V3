import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const artistId = searchParams.get('state'); // Contains userId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=artist-availability&error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !artistId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=artist-availability&error=invalid_auth_response`
    );
  }

  try {
    // Get credentials from Firestore
    const configRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
    const configSnap = await getDoc(configRef);
    
    let clientId = process.env.GOOGLE_CLIENT_ID;
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    let redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    if (configSnap.exists()) {
      const config = configSnap.data();
      if (config.clientId && config.clientSecret) {
        clientId = config.clientId;
        clientSecret = config.clientSecret;
        redirectUri = config.redirectUri;
      }
    }

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'Google OAuth credentials not configured' },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in Firestore
    const docRef = doc(getDb(), 'googleCalendarTokens', artistId);
    await setDoc(docRef, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      lastSyncedAt: new Date()
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=artist-availability&success=google_calendar_connected`
    );
  } catch (err: any) {
    console.error('Google Calendar auth error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=artist-availability&error=${encodeURIComponent(err.message || 'auth_failed')}`
    );
  }
}
