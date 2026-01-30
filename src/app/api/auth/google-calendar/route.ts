import { NextResponse } from 'next/server';
import { GoogleAuthService } from '@/services/googleAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state'); // Contains userId
  
  if (!state) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const authUrl = await GoogleAuthService.getAuthUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
