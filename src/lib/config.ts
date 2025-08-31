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
 * Stripe configuration - live mode only
 */
const stripeConfig = {
  mode: 'live' as const,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY,
};

/**
 * Centralized configuration loader
 * No more .env.local dependency issues
 */
export function getAppConfig(): AppConfig {
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  
  console.log(`🔧 Config loaded: ${stripeConfig.mode} mode, ${environment} environment, localhost: ${isLocalhost}`);
  console.log(`🔧 Stripe publishable key: ${stripeConfig.publishableKey ? stripeConfig.publishableKey.substring(0, 20) + '...' : 'MISSING'}`);
  
  // Validate Stripe configuration
  if (!stripeConfig.publishableKey) {
    throw new Error('Missing Stripe publishable key. Please check your environment variables.');
  }

  if (!stripeConfig.secretKey) {
    throw new Error('Missing Stripe secret key. Please check your environment variables.');
  }
  
  return {
    stripe: {
      publishableKey: stripeConfig.publishableKey,
      secretKey: stripeConfig.secretKey,
      mode: stripeConfig.mode,
      isLive: stripeConfig.mode === 'live'
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
