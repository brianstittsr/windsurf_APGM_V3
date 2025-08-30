import { loadStripe } from '@stripe/stripe-js';
import { getAppConfig } from './config';

// Get publishable key using the same centralized config as backend
function getClientSidePublishableKey(): string {
  try {
    const config = getAppConfig();
    console.log('🔍 Frontend Stripe key check:', {
      mode: config.stripe.mode,
      keyPrefix: config.stripe.publishableKey?.substring(0, 20) + '...',
      isClient: typeof window !== 'undefined'
    });
    
    return config.stripe.publishableKey;
  } catch (error) {
    console.error('Failed to get Stripe publishable key from centralized config:', error);
    throw error;
  }
}

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(getClientSidePublishableKey());

export default stripePromise;
