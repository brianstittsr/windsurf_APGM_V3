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
 * Get the current Stripe mode based on environment and available keys
 */
export function getStripeMode(): StripeMode {
  // Check if we have live keys available
  const hasLiveKeys = !!(
    (process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) &&
    (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY)
  );
  
  // Check if we have test keys available
  const hasTestKeys = !!(
    process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY &&
    process.env.STRIPE_TEST_SECRET_KEY
  );
  
  // Prefer live mode if live keys are available, otherwise use test mode
  if (hasLiveKeys) {
    return 'live';
  } else if (hasTestKeys) {
    return 'test';
  } else {
    // Default to test mode if no keys are properly configured
    console.warn('⚠️ No valid Stripe keys found, defaulting to test mode');
    return 'test';
  }
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
  
  // Get Stripe keys based on current mode
  let stripeKeys: { publishable: string | undefined; secret: string | undefined };
  
  if (isLive) {
    // Live mode keys
    stripeKeys = {
      publishable: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secret: process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY
    };
  } else {
    // Test mode keys
    stripeKeys = {
      publishable: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY,
      secret: process.env.STRIPE_TEST_SECRET_KEY
    };
  }
  
  // Validate keys
  if (!stripeKeys.publishable) {
    console.error(`❌ Missing Stripe ${mode} publishable key`);
    const keyName = isLive ? 'NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY' : 'NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY';
    throw new Error(`Missing ${keyName} environment variable`);
  }

  if (!stripeKeys.secret) {
    console.error(`❌ Missing Stripe ${mode} secret key`);
    const keyName = isLive ? 'STRIPE_LIVE_SECRET_KEY' : 'STRIPE_TEST_SECRET_KEY';
    throw new Error(`Missing ${keyName} environment variable`);
  }
  
  publishableKey = stripeKeys.publishable;
  secretKey = stripeKeys.secret;
  webhookSecret = isLive ? 
    (process.env.STRIPE_LIVE_WEBHOOK_SECRET || '') : 
    (process.env.STRIPE_TEST_WEBHOOK_SECRET || '');
  
  // Validate key formats (only at runtime)
  const expectedPkPrefix = isLive ? 'pk_live_' : 'pk_test_';
  const expectedSkPrefix = isLive ? 'sk_live_' : 'sk_test_';
  
  if (!publishableKey.startsWith(expectedPkPrefix)) {
    throw new Error(`Invalid Stripe ${mode} publishable key format. Expected ${expectedPkPrefix}...`);
  }
  if (!secretKey.startsWith(expectedSkPrefix)) {
    throw new Error(`Invalid Stripe ${mode} secret key format. Expected ${expectedSkPrefix}...`);
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
