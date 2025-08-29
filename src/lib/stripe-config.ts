/**
 * Stripe Configuration Utility
 * Handles switching between test/sandbox and live/production modes
 */

export type StripeMode = 'test' | 'live';

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: StripeMode;
  isLive: boolean;
}

/**
 * Get the current Stripe mode from environment variables or database
 */
export async function getStripeModeAsync(): Promise<StripeMode> {
  // First check if we're in a server environment and can access database
  if (typeof window === 'undefined') {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const configDoc = await getDoc(doc(db, 'systemConfig', 'stripe'));
      if (configDoc.exists()) {
        const dbMode = configDoc.data().mode;
        if (dbMode === 'live' || dbMode === 'test') {
          return dbMode as StripeMode;
        }
      }
    } catch (error) {
      console.warn('Could not fetch Stripe mode from database, falling back to environment variable');
    }
  }
  
  // Fallback to environment variable
  return getStripeMode();
}

/**
 * Get the current Stripe mode from environment variables (synchronous)
 */
export function getStripeMode(): StripeMode {
  const mode = process.env.STRIPE_MODE?.toLowerCase();
  
  if (mode === 'live' || mode === 'production') {
    return 'live';
  }
  
  return 'test'; // Default to test mode for safety
}

/**
 * Check if we're in build time (no runtime environment)
 */
function isBuildTime(): boolean {
  // During Next.js build, we want to avoid throwing errors
  // Check for common build-time indicators
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Get Stripe configuration based on the current mode
 */
export function getStripeConfig(): StripeConfig {
  const mode = getStripeMode();
  const isLive = mode === 'live';
  
  let publishableKey: string;
  let secretKey: string;
  let webhookSecret: string;
  
  // During build time, provide placeholder values to prevent errors
  if (isBuildTime()) {
    return {
      publishableKey: isLive ? 'pk_live_placeholder' : 'pk_test_placeholder',
      secretKey: isLive ? 'sk_live_placeholder' : 'sk_test_placeholder',
      webhookSecret: 'whsec_placeholder',
      mode,
      isLive
    };
  }
  
  if (isLive) {
    // Production/Live keys
    publishableKey = process.env.STRIPE_LIVE_PUBLISHABLE_KEY || '';
    secretKey = process.env.STRIPE_LIVE_SECRET_KEY || '';
    webhookSecret = process.env.STRIPE_LIVE_WEBHOOK_SECRET || '';
    
    // Validate live keys (only at runtime)
    if (!publishableKey.startsWith('pk_live_')) {
      throw new Error('Invalid or missing Stripe live publishable key');
    }
    if (!secretKey.startsWith('sk_live_')) {
      throw new Error('Invalid or missing Stripe live secret key');
    }
  } else {
    // Test/Sandbox keys
    publishableKey = process.env.STRIPE_TEST_PUBLISHABLE_KEY || '';
    secretKey = process.env.STRIPE_TEST_SECRET_KEY || '';
    webhookSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET || '';
    
    // Validate test keys (only at runtime) - allow empty for development
    if (publishableKey && !publishableKey.startsWith('pk_test_')) {
      throw new Error('Invalid Stripe test publishable key format');
    }
    if (secretKey && !secretKey.startsWith('sk_test_')) {
      throw new Error('Invalid Stripe test secret key format');
    }
    
    // Require test keys - don't use placeholders in production
    if (!publishableKey) {
      throw new Error('STRIPE_TEST_PUBLISHABLE_KEY environment variable is required. Please set it in your environment variables.');
    }
    if (!secretKey) {
      throw new Error('STRIPE_TEST_SECRET_KEY environment variable is required. Please set it in your environment variables.');
    }
  }
  
  // Ensure all keys are present (only at runtime)
  if (!publishableKey || !secretKey) {
    throw new Error(`Missing Stripe ${mode} keys in environment variables`);
  }
  
  return {
    publishableKey,
    secretKey,
    webhookSecret,
    mode,
    isLive
  };
}

/**
 * Get the publishable key for client-side use
 */
export function getStripePublishableKey(): string {
  try {
    const config = getStripeConfig();
    return config.publishableKey;
  } catch (error) {
    // During build time, return a placeholder
    if (isBuildTime()) {
      const mode = getStripeMode();
      return mode === 'live' ? 'pk_live_placeholder' : 'pk_test_placeholder';
    }
    throw error;
  }
}

/**
 * Get the secret key for server-side use
 */
export function getStripeSecretKey(): string {
  try {
    const config = getStripeConfig();
    return config.secretKey;
  } catch (error) {
    // During build time, return a placeholder
    if (isBuildTime()) {
      const mode = getStripeMode();
      return mode === 'live' ? 'sk_live_placeholder' : 'sk_test_placeholder';
    }
    throw error;
  }
}

/**
 * Get the webhook secret for webhook verification
 */
export function getStripeWebhookSecret(): string {
  try {
    const config = getStripeConfig();
    return config.webhookSecret;
  } catch (error) {
    // During build time, return a placeholder
    if (isBuildTime()) {
      return 'whsec_placeholder';
    }
    throw error;
  }
}

/**
 * Check if Stripe is in live/production mode
 */
export function isStripeLiveMode(): boolean {
  const config = getStripeConfig();
  return config.isLive;
}

/**
 * Get a human-readable mode description
 */
export function getStripeModeDescription(): string {
  const config = getStripeConfig();
  return config.isLive ? 'Production (Live)' : 'Test (Sandbox)';
}

/**
 * Log current Stripe configuration (without exposing sensitive data)
 */
export function logStripeConfig(): void {
  try {
    const config = getStripeConfig();
    console.log(`🔧 Stripe Configuration:`);
    console.log(`   Mode: ${config.mode.toUpperCase()}`);
    console.log(`   Environment: ${getStripeModeDescription()}`);
    console.log(`   Publishable Key: ${config.publishableKey.substring(0, 12)}...`);
    console.log(`   Secret Key: ${config.secretKey.substring(0, 12)}...`);
    console.log(`   Webhook Secret: ${config.webhookSecret ? 'Configured' : 'Missing'}`);
  } catch (error) {
    console.error('❌ Stripe Configuration Error:', error);
  }
}
