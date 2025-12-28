import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI || 'http://localhost:3000/api/canva/callback';
const CANVA_TOKEN_URL = 'https://www.canva.com/api/oauth/token';

// Handle OAuth callback from Canva
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Contains userId
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Canva OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard?tab=canva&error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?tab=canva&error=No authorization code received', request.url)
    );
  }

  if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL('/dashboard?tab=canva&error=Canva API not configured', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const response = await fetch(CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CANVA_CLIENT_ID}:${CANVA_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CANVA_REDIRECT_URI
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Canva token exchange failed:', errorText);
      return NextResponse.redirect(
        new URL('/dashboard?tab=canva&error=Failed to connect to Canva', request.url)
      );
    }

    const tokenData = await response.json();
    const userId = state || 'default';

    // Store tokens in Firestore
    const expiresIn = tokenData.expires_in || 3600;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    await setDoc(doc(getDb(), 'canvaIntegration', userId), {
      userId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry,
      connectedAt: new Date(),
      lastSync: new Date()
    }, { merge: true });

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?tab=canva&success=Connected to Canva successfully', request.url)
    );

  } catch (err) {
    console.error('Canva callback error:', err);
    return NextResponse.redirect(
      new URL('/dashboard?tab=canva&error=Connection failed', request.url)
    );
  }
}
