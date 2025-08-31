import { loadStripe } from '@stripe/stripe-js';

// Client-side Stripe key retrieval - only uses public environment variables
function getClientSidePublishableKey(): string {
  // Live mode keys first (production)
  const liveKey = process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || 
                  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  // Test mode keys (development)
  const testKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;
  
  // Prefer live keys, fallback to test keys
  const publishableKey = liveKey || testKey;
  
  if (!publishableKey) {
    throw new Error('No Stripe publishable key found. Please check your environment variables.');
  }
  
  console.log('🔧 Client Stripe key loaded:', {
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
