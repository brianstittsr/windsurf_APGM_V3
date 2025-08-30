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
    
    if (!config.stripe.publishableKey) {
      throw new Error('Stripe publishable key is missing from configuration');
    }
    
    return config.stripe.publishableKey;
  } catch (error) {
    console.error('Failed to get Stripe publishable key from centralized config:', error);
    
    // Fallback to direct environment variable access
    const fallbackKey = process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || 
                       process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (fallbackKey) {
      console.log('🔄 Using fallback Stripe key:', fallbackKey.substring(0, 20) + '...');
      return fallbackKey;
    }
    
    throw new Error('No Stripe publishable key available. Please check your environment variables.');
  }
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
