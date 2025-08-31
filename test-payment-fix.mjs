#!/usr/bin/env node

/**
 * Test script to verify Stripe payment configuration after fixing environment variable mismatch
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

console.log('🧪 Testing Stripe Payment Configuration Fix\n');

// Test environment variables
console.log('📋 Environment Variables Check:');
console.log(`NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`STRIPE_LIVE_SECRET_KEY: ${process.env.STRIPE_LIVE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);

// Test config.ts configuration
console.log('\n🔧 Testing config.ts...');
try {
  // Simulate the config.ts logic
  const STRIPE_KEYS = {
    test: {
      publishable: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || '',
      secret: process.env.STRIPE_TEST_SECRET_KEY || ''
    },
    live: {
      publishable: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secret: process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || ''
    }
  };

  const stripeMode = 'live';
  const stripeKeys = STRIPE_KEYS[stripeMode];
  
  console.log(`Mode: ${stripeMode}`);
  console.log(`Publishable Key: ${stripeKeys.publishable ? stripeKeys.publishable.substring(0, 20) + '...' : 'MISSING'}`);
  console.log(`Secret Key: ${stripeKeys.secret ? stripeKeys.secret.substring(0, 20) + '...' : 'MISSING'}`);
  
  if (!stripeKeys.publishable) {
    console.log('❌ config.ts: Missing publishable key');
  } else {
    console.log('✅ config.ts: Configuration valid');
  }
} catch (error) {
  console.log('❌ config.ts: Error -', error.message);
}

// Test stripe-config.ts configuration
console.log('\n⚙️ Testing stripe-config.ts...');
try {
  // Simulate the stripe-config.ts logic
  const isLive = true;
  let publishableKey, secretKey;
  
  if (isLive) {
    publishableKey = process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    secretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
  }
  
  console.log(`Publishable Key: ${publishableKey ? publishableKey.substring(0, 20) + '...' : 'MISSING'}`);
  console.log(`Secret Key: ${secretKey ? secretKey.substring(0, 20) + '...' : 'MISSING'}`);
  
  if (!publishableKey.startsWith('pk_live_')) {
    console.log('❌ stripe-config.ts: Invalid or missing live publishable key');
  } else if (!secretKey.startsWith('sk_live_')) {
    console.log('❌ stripe-config.ts: Invalid or missing live secret key');
  } else {
    console.log('✅ stripe-config.ts: Configuration valid');
  }
} catch (error) {
  console.log('❌ stripe-config.ts: Error -', error.message);
}

// Test Stripe API connection
console.log('\n🔌 Testing Stripe API Connection...');
try {
  const { default: Stripe } = await import('stripe');
  
  const secretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.log('❌ No secret key available for API test');
  } else if (secretKey.includes('placeholder')) {
    console.log('❌ Using placeholder key - cannot test API');
  } else {
    const stripe = new Stripe(secretKey);
    
    // Test with a simple API call
    const paymentMethods = await stripe.paymentMethods.list({ limit: 1 });
    console.log('✅ Stripe API connection successful');
    console.log(`✅ API response received (${paymentMethods.object})`);
  }
} catch (error) {
  console.log('❌ Stripe API test failed:', error.message);
  
  if (error.message.includes('Invalid API Key')) {
    console.log('💡 This suggests the API key format or value is incorrect');
  } else if (error.message.includes('No such')) {
    console.log('💡 This suggests a resource not found error');
  } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
    console.log('💡 This suggests a network connectivity issue');
  }
}

console.log('\n🏁 Test Complete');
