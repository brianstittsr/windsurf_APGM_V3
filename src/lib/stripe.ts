import { loadStripe } from '@stripe/stripe-js';

// Client-side Stripe key retrieval - uses consistent mode detection
function getClientSidePublishableKey(): string {
  // Check if we have live keys available
  const hasLiveKeys = !!(
    (process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  );
  
  // Check if we have test keys available
  const hasTestKeys = !!process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;
  
  let publishableKey: string | undefined;
  let mode: string = 'unknown';
  
  if (hasLiveKeys) {
    // Use live keys
    publishableKey = process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || 
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    mode = 'live';
  } else if (hasTestKeys) {
    // Use test keys
    publishableKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;
    mode = 'test';
  }
  
  if (!publishableKey) {
    throw new Error('No Stripe publishable key found. Please check your environment variables.');
  }
  
  console.log('🔧 Client Stripe key loaded:', {
    mode: mode.toUpperCase(),
    keyPrefix: publishableKey.substring(0, 20) + '...',
    isLive: publishableKey.startsWith('pk_live_'),
    isTest: publishableKey.startsWith('pk_test_')
  });
  
  return publishableKey;
}

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<any> | null = null;

try {
  const publishableKey = getClientSidePublishableKey();
  stripePromise = loadStripe(publishableKey);
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  // Create a rejected promise so components can handle the error gracefully
  stripePromise = Promise.reject(error);
}

export default stripePromise;
