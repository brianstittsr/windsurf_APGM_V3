import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('state');
  
  try {
    // Try to get credentials from Firestore first
    const docRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
    const docSnap = await getDoc(docRef);
    
    let clientId = process.env.GOOGLE_CLIENT_ID;
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    let redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    // If Firestore config exists, use it (overrides env vars)
    if (docSnap.exists()) {
      const config = docSnap.data();
      if (config.clientId && config.clientSecret) {
        clientId = config.clientId;
        clientSecret = config.clientSecret;
        redirectUri = config.redirectUri;
      }
    }
    
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'Google OAuth credentials not configured. Please configure in Admin Dashboard > Integrations > Google Calendar.' },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: artistId || '',
      prompt: 'consent'
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google Calendar OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Google Calendar authentication' },
      { status: 500 }
    );
  }
}
