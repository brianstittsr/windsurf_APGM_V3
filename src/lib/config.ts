/**
 * Centralized Configuration Management
 * Handles API keys, environment detection, and configuration loading
 */

export interface AppConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    mode: 'test' | 'live';
    isLive: boolean;
  };
  environment: 'development' | 'production';
  isLocalhost: boolean;
}

/**
 * Stripe keys loaded from environment variables
 * Set these in your .env.local file or deployment environment
 */
const STRIPE_KEYS = {
  test: {
    publishable: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || '',
    secret: process.env.STRIPE_TEST_SECRET_KEY || ''
  },
  live: {
    publishable: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || '',
    secret: process.env.STRIPE_LIVE_SECRET_KEY || ''
  }
};

/**
 * Centralized configuration loader
 * No more .env.local dependency issues
 */
export function getAppConfig(): AppConfig {
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  
  // SWITCHED TO LIVE MODE - Use live keys for all environments
  const stripeMode: 'test' | 'live' = 'live';
  
  const stripeKeys = STRIPE_KEYS[stripeMode];
  
  console.log(`🔧 Config loaded: ${stripeMode} mode, ${environment} environment, localhost: ${isLocalhost}`);
  
  return {
    stripe: {
      publishableKey: stripeKeys.publishable,
      secretKey: stripeKeys.secret,
      mode: stripeMode,
      isLive: stripeMode === 'live'
    },
    environment,
    isLocalhost
  };
}

/**
 * Get Stripe configuration specifically
 */
export function getStripeConfig() {
  const config = getAppConfig();
  return config.stripe;
}
