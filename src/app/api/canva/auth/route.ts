import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI || 'http://localhost:3000/api/canva/callback';

// Canva OAuth endpoints
const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
const CANVA_TOKEN_URL = 'https://www.canva.com/api/oauth/token';

// GET - Initiate OAuth flow or check connection status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  // Check if Canva credentials are configured
  if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
    return NextResponse.json({
      configured: false,
      message: 'Canva API credentials not configured. Please set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in environment variables.'
    });
  }

  // Check connection status
  if (action === 'status' && userId) {
    try {
      const docRef = doc(getDb(), 'canvaIntegration', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const tokenExpiry = data.tokenExpiry?.toDate?.() || new Date(data.tokenExpiry);
        const isExpired = tokenExpiry < new Date();
        
        return NextResponse.json({
          connected: !isExpired,
          configured: true,
          canvaUserId: data.canvaUserId,
          connectedAt: data.connectedAt,
          needsRefresh: isExpired
        });
      }
      
      return NextResponse.json({ connected: false, configured: true });
    } catch (error) {
      console.error('Error checking Canva status:', error);
      return NextResponse.json({ connected: false, configured: true, error: 'Failed to check status' });
    }
  }

  // Generate OAuth URL
  if (action === 'authorize') {
    const state = userId || 'anonymous';
    const scope = 'design:content:read design:meta:read asset:read';
    
    const authUrl = new URL(CANVA_AUTH_URL);
    authUrl.searchParams.set('client_id', CANVA_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', CANVA_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    
    return NextResponse.json({ authUrl: authUrl.toString() });
  }

  return NextResponse.json({ configured: true });
}

// POST - Exchange code for tokens or refresh token
export async function POST(request: NextRequest) {
  if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Canva API credentials not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { code, userId, refreshToken } = body;

    let tokenData;

    if (refreshToken) {
      // Refresh existing token
      const response = await fetch(CANVA_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CANVA_CLIENT_ID}:${CANVA_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Canva token refresh failed:', error);
        return NextResponse.json(
          { error: 'Failed to refresh Canva token' },
          { status: 400 }
        );
      }

      tokenData = await response.json();
    } else if (code) {
      // Exchange authorization code for tokens
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
        const error = await response.text();
        console.error('Canva token exchange failed:', error);
        return NextResponse.json(
          { error: 'Failed to exchange authorization code' },
          { status: 400 }
        );
      }

      tokenData = await response.json();
    } else {
      return NextResponse.json(
        { error: 'Missing code or refreshToken' },
        { status: 400 }
      );
    }

    // Store tokens in Firestore
    if (userId && tokenData.access_token) {
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

      return NextResponse.json({
        success: true,
        expiresIn,
        tokenExpiry: tokenExpiry.toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in
    });

  } catch (error) {
    console.error('Canva auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
