import { loadStripe } from '@stripe/stripe-js';
import { getStripePublishableKey, logStripeConfig } from './stripe-config';

// Log current Stripe configuration for debugging
if (typeof window === 'undefined') {
  // Only log on server-side to avoid exposing config in browser
  logStripeConfig();
}

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(getStripePublishableKey());

export default stripePromise;
