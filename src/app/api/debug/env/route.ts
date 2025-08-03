import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with a secret key for security
  const isDev = process.env.NODE_ENV === 'development';
  const debugKey = process.env.DEBUG_SECRET_KEY;
  
  if (!isDev && !debugKey) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const firebaseVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'NOT SET',
  };

  const stripeVars = {
    STRIPE_MODE: process.env.STRIPE_MODE || 'NOT SET',
    STRIPE_TEST_PUBLISHABLE_KEY: process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
    STRIPE_LIVE_PUBLISHABLE_KEY: process.env.STRIPE_LIVE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
  };

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    firebase: firebaseVars,
    stripe: stripeVars,
    timestamp: new Date().toISOString()
  });
}
