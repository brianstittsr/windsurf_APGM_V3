const { getStripeConfig } = require('./src/lib/stripe-config.ts');

async function debugPaymentIntent() {
  try {
    console.log('🔍 Debugging Stripe Payment Intent Issue...\n');
    
    // Get Stripe configuration
    const config = getStripeConfig();
    console.log('📋 Current Stripe Configuration:');
    console.log(`Mode: ${config.mode}`);
    console.log(`Is Live: ${config.isLive}`);
    console.log(`Publishable Key: ${config.publishableKey.substring(0, 12)}...`);
    console.log(`Secret Key: ${config.secretKey.substring(0, 12)}...\n`);
    
    // Initialize Stripe with current config
    const stripe = require('stripe')(config.secretKey);
    
    // Test 1: List recent payment intents to verify API connection
    console.log('🔗 Testing Stripe API Connection...');
    const paymentIntents = await stripe.paymentIntents.list({ limit: 5 });
    console.log(`✅ API Connection successful. Found ${paymentIntents.data.length} recent payment intents.\n`);
    
    if (paymentIntents.data.length > 0) {
      console.log('📋 Recent Payment Intents:');
      paymentIntents.data.forEach((pi, index) => {
        console.log(`${index + 1}. ID: ${pi.id}, Status: ${pi.status}, Amount: $${pi.amount / 100}`);
      });
      console.log('');
    }
    
    // Test 2: Try to create a new payment intent
    console.log('💳 Creating a test payment intent...');
    const testPaymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // $50.00
      currency: 'usd',
      metadata: {
        test: 'debug-script',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ Test payment intent created successfully!`);
    console.log(`ID: ${testPaymentIntent.id}`);
    console.log(`Status: ${testPaymentIntent.status}`);
    console.log(`Client Secret: ${testPaymentIntent.client_secret.substring(0, 20)}...\n`);
    
    // Test 3: Verify the payment intent can be retrieved
    console.log('🔍 Verifying payment intent retrieval...');
    const retrievedPI = await stripe.paymentIntents.retrieve(testPaymentIntent.id);
    console.log(`✅ Payment intent retrieved successfully: ${retrievedPI.id}\n`);
    
    console.log('🎉 All Stripe tests passed! Your configuration is working correctly.');
    console.log('\n💡 If you\'re still getting "No such payment_intent" errors, it might be because:');
    console.log('1. The payment intent was created in a different Stripe account');
    console.log('2. The payment intent was created in live mode but you\'re testing in test mode (or vice versa)');
    console.log('3. The payment intent has expired or been canceled');
    console.log('4. There\'s a typo in the payment intent ID');
    
  } catch (error) {
    console.error('❌ Stripe Error:', error.message);
    
    if (error.code === 'invalid_request_error') {
      console.log('\n💡 This might be due to:');
      console.log('- Invalid API keys in your .env.local file');
      console.log('- Wrong test/live mode configuration');
      console.log('- Network connectivity issues');
    }
    
    console.log('\n🔧 Please check your .env.local file contains:');
    console.log('STRIPE_MODE=test');
    console.log('STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...');
    console.log('STRIPE_TEST_SECRET_KEY=sk_test_...');
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  }
}

debugPaymentIntent();
