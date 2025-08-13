require('dotenv').config({ path: '.env.local' });

async function debugStripeIssue() {
  try {
    console.log('🔍 Debugging Stripe Payment Intent Issue...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`STRIPE_MODE: ${process.env.STRIPE_MODE}`);
    console.log(`STRIPE_TEST_SECRET_KEY: ${process.env.STRIPE_TEST_SECRET_KEY ? process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12) + '...' : 'NOT SET'}`);
    console.log(`STRIPE_TEST_PUBLISHABLE_KEY: ${process.env.STRIPE_TEST_PUBLISHABLE_KEY ? process.env.STRIPE_TEST_PUBLISHABLE_KEY.substring(0, 12) + '...' : 'NOT SET'}`);
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12) + '...' : 'NOT SET'}\n`);
    
    // Get the secret key based on mode
    const mode = process.env.STRIPE_MODE?.toLowerCase() || 'test';
    const secretKey = mode === 'test' 
      ? process.env.STRIPE_TEST_SECRET_KEY 
      : process.env.STRIPE_LIVE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error(`No secret key found for mode: ${mode}`);
    }
    
    console.log(`🔑 Using ${mode} mode with key: ${secretKey.substring(0, 12)}...\n`);
    
    // Initialize Stripe
    const stripe = require('stripe')(secretKey);
    
    // Test API connection
    console.log('🔗 Testing Stripe API Connection...');
    const paymentIntents = await stripe.paymentIntents.list({ limit: 3 });
    console.log(`✅ API Connection successful! Found ${paymentIntents.data.length} recent payment intents.\n`);
    
    if (paymentIntents.data.length > 0) {
      console.log('📋 Recent Payment Intents:');
      paymentIntents.data.forEach((pi, index) => {
        console.log(`${index + 1}. ID: ${pi.id}, Status: ${pi.status}, Amount: $${(pi.amount / 100).toFixed(2)}, Created: ${new Date(pi.created * 1000).toLocaleString()}`);
      });
      console.log('');
    }
    
    // Create a test payment intent
    console.log('💳 Creating a test payment intent...');
    const testPI = await stripe.paymentIntents.create({
      amount: 5000, // $50.00
      currency: 'usd',
      metadata: {
        test: 'debug-script',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ Test payment intent created successfully!`);
    console.log(`ID: ${testPI.id}`);
    console.log(`Status: ${testPI.status}`);
    console.log(`Client Secret: ${testPI.client_secret}\n`);
    
    // Test retrieval
    console.log('🔍 Testing payment intent retrieval...');
    const retrieved = await stripe.paymentIntents.retrieve(testPI.id);
    console.log(`✅ Successfully retrieved: ${retrieved.id}\n`);
    
    console.log('🎉 All tests passed! Your Stripe configuration is working correctly.');
    console.log('\n💡 The "No such payment_intent" error you encountered might be because:');
    console.log('1. The payment intent ID was from a different Stripe account');
    console.log('2. Mode mismatch (test vs live)');
    console.log('3. The payment intent has expired');
    console.log('4. Typo in the payment intent ID');
    console.log('\n🔧 Try creating a new booking to generate a fresh payment intent.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 This is likely due to:');
      console.log('- Invalid API keys');
      console.log('- Wrong test/live mode');
      console.log('- Missing environment variables');
    }
    
    console.log('\n🔧 Please verify your .env.local file contains:');
    console.log('STRIPE_MODE=test');
    console.log('STRIPE_TEST_SECRET_KEY=sk_test_...');
    console.log('STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...');
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  }
}

debugStripeIssue();
