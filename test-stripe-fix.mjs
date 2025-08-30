/**
 * Test Stripe configuration after security fixes
 */
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

async function testStripeConfig() {
  console.log('🔧 Testing Stripe Configuration After Security Fixes\n');
  
  // Test environment variable access
  const testSecret = process.env.STRIPE_TEST_SECRET_KEY;
  const liveSecret = process.env.STRIPE_LIVE_SECRET_KEY;
  const mode = process.env.STRIPE_MODE || 'test';
  
  console.log(`📋 Current STRIPE_MODE: ${mode.toUpperCase()}`);
  console.log(`🔑 Test key available: ${testSecret ? '✅ Yes' : '❌ No'}`);
  console.log(`🔑 Live key available: ${liveSecret ? '✅ Yes' : '❌ No'}`);
  
  // Test the appropriate key based on mode
  const secretKey = mode === 'live' ? liveSecret : testSecret;
  
  if (!secretKey) {
    console.error(`❌ No ${mode} secret key found in environment`);
    return;
  }
  
  try {
    const stripe = new Stripe(secretKey);
    
    // Test basic API connectivity
    console.log(`\n🚀 Testing ${mode.toUpperCase()} mode API connectivity...`);
    const account = await stripe.accounts.retrieve();
    
    console.log('✅ Stripe API connection successful!');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    
    // Test payment intent creation
    console.log('\n💳 Testing payment intent creation...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: 'usd',
      metadata: {
        test: 'configuration_test'
      }
    });
    
    console.log('✅ Payment intent created successfully!');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    
    console.log('\n🎉 All tests passed! Stripe configuration is working correctly.');
    
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Issue: Invalid API key');
    } else if (error.type === 'StripeConnectionError') {
      console.error('   Issue: Network connection problem');
    }
  }
}

testStripeConfig();
