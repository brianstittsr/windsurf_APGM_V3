import { loadStripe } from '@stripe/stripe-js';
import { getStripePublishableKey, logStripeConfig } from './stripe-config';

// Log current Stripe configuration for debugging
if (typeof window === 'undefined') {
  // Only log on server-side to avoid exposing config in browser
  logStripeConfig();
}

// Get publishable key for client-side use
// In Next.js, client-side code needs to use public environment variables
function getClientSidePublishableKey(): string {
  // Try public environment variables first (for client-side)
  const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (publicKey) {
    return publicKey;
  }
  
  // Fallback to server-side function (for server-side rendering)
  if (typeof window === 'undefined') {
    try {
      return getStripePublishableKey();
    } catch (error) {
      console.error('Failed to get Stripe publishable key:', error);
      throw error;
    }
  }
  
  // If we're on client-side and no public key is available, throw error
  throw new Error('Stripe publishable key not available on client-side. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.');
}

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(getClientSidePublishableKey());

export default stripePromise;
