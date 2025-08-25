import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 Checking actual Stripe environment variables...');
  
  const stripeEnv = {
    STRIPE_MODE: process.env.STRIPE_MODE || 'NOT SET',
    STRIPE_TEST_PUBLISHABLE_KEY: process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 
      `${process.env.STRIPE_TEST_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET',
    STRIPE_TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY ? 
      `${process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12)}...` : 'NOT SET',
    STRIPE_TEST_WEBHOOK_SECRET: process.env.STRIPE_TEST_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
      `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET'
  };

  // Check key formats
  const keyValidation = {
    publishableKeyValid: process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 
      process.env.STRIPE_TEST_PUBLISHABLE_KEY.startsWith('pk_test_') : false,
    secretKeyValid: process.env.STRIPE_TEST_SECRET_KEY ? 
      process.env.STRIPE_TEST_SECRET_KEY.startsWith('sk_test_') : false
  };

  console.log('Environment Variables:', stripeEnv);
  console.log('Key Validation:', keyValidation);

  return NextResponse.json({
    message: 'Stripe Environment Check',
    environment: stripeEnv,
    validation: keyValidation,
    recommendations: {
      missingKeys: Object.entries(stripeEnv)
        .filter(([key, value]) => value === 'NOT SET')
        .map(([key]) => key),
      status: stripeEnv.STRIPE_TEST_SECRET_KEY !== 'NOT SET' && 
              stripeEnv.STRIPE_TEST_PUBLISHABLE_KEY !== 'NOT SET' ? 
              'CONFIGURED' : 'MISSING_KEYS'
    }
  });
}
