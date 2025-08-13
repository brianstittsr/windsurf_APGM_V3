import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔧 Testing Environment Variable Loading...');
  
  // Test if .env.local is being loaded
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    STRIPE_MODE: process.env.STRIPE_MODE,
    STRIPE_TEST_PUBLISHABLE_KEY: process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 
      `${process.env.STRIPE_TEST_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET',
    STRIPE_TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY ? 
      `${process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12)}...` : 'NOT SET',
    STRIPE_TEST_WEBHOOK_SECRET: process.env.STRIPE_TEST_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
  };

  console.log('Environment Variables:', envVars);

  // Test Stripe configuration
  let stripeConfigStatus = 'Unknown';
  let stripeError = null;
  
  try {
    const { getStripeConfig, logStripeConfig } = await import('@/lib/stripe-config');
    logStripeConfig();
    const config = getStripeConfig();
    stripeConfigStatus = `✅ Success - Mode: ${config.mode}`;
  } catch (error) {
    stripeError = error instanceof Error ? error.message : 'Unknown error';
    stripeConfigStatus = `❌ Error: ${stripeError}`;
  }

  return NextResponse.json({
    message: 'Environment Variable Test',
    envVarsLoaded: envVars,
    stripeConfigStatus,
    stripeError,
    recommendations: {
      envFileLocation: '.env.local should be in the root directory',
      requiredVars: [
        'STRIPE_MODE=test',
        'STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...',
        'STRIPE_TEST_SECRET_KEY=sk_test_...'
      ],
      nextSteps: stripeError ? [
        'Check that your .env.local file exists in the root directory',
        'Verify Stripe keys have correct format (pk_test_ and sk_test_)',
        'Restart your development server after adding environment variables'
      ] : ['Environment is configured correctly!']
    }
  });
}
