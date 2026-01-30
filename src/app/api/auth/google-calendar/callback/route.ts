import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuthService } from '@/services/googleAuth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Contains userId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=artist-availability&error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=artist-availability&error=invalid_auth_response`
    );
  }

  try {
    const tokens = await GoogleAuthService.getTokens(code);
    await GoogleAuthService.saveTokens(state, tokens);
    
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
