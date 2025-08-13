/**
 * Stripe Configuration Test Script
 * Run this to verify your Stripe environment variables are properly configured
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing Stripe Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('STRIPE_MODE:', process.env.STRIPE_MODE || 'NOT SET (will default to test)');
console.log('STRIPE_TEST_PUBLISHABLE_KEY:', process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 
  `${process.env.STRIPE_TEST_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET');
console.log('STRIPE_TEST_SECRET_KEY:', process.env.STRIPE_TEST_SECRET_KEY ? 
  `${process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12)}...` : 'NOT SET');
console.log('STRIPE_TEST_WEBHOOK_SECRET:', process.env.STRIPE_TEST_WEBHOOK_SECRET ? 
  'SET' : 'NOT SET (optional for basic payments)');

console.log('\n📋 Expected Format:');
console.log('STRIPE_MODE=test');
console.log('STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...');
console.log('STRIPE_TEST_SECRET_KEY=sk_test_...');
console.log('STRIPE_TEST_WEBHOOK_SECRET=whsec_... (optional)');

// Test the configuration functions
console.log('\n🧪 Testing Configuration Functions:');
try {
  const { getStripeConfig, logStripeConfig } = require('./src/lib/stripe-config.ts');
  logStripeConfig();
  console.log('✅ Stripe configuration loaded successfully!');
} catch (error) {
  console.error('❌ Stripe configuration error:', error.message);
  
  if (error.message.includes('Missing Stripe')) {
    console.log('\n💡 Solution: Add your Stripe keys to .env.local file');
  } else if (error.message.includes('Invalid')) {
    console.log('\n💡 Solution: Check that your Stripe keys have the correct format');
  }
}

console.log('\n🚀 To get your Stripe test keys:');
console.log('1. Go to https://dashboard.stripe.com/test/apikeys');
console.log('2. Copy your "Publishable key" (starts with pk_test_)');
console.log('3. Copy your "Secret key" (starts with sk_test_)');
console.log('4. Add them to your .env.local file');
