/**
 * Test Stripe Payment with 4242 Test Card
 * This script tests if Stripe is properly configured and can process test payments
 */

require('dotenv').config({ path: '.env.local' });

async function testStripePayment() {
  console.log('🧪 Testing Stripe Payment Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('STRIPE_MODE:', process.env.STRIPE_MODE || 'NOT SET (defaults to test)');
  console.log('STRIPE_TEST_PUBLISHABLE_KEY:', process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 
    `${process.env.STRIPE_TEST_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET');
  console.log('STRIPE_TEST_SECRET_KEY:', process.env.STRIPE_TEST_SECRET_KEY ? 
    `${process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12)}...` : 'NOT SET');
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
    `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET');

  // Check if required keys are present
  const testSecretKey = process.env.STRIPE_TEST_SECRET_KEY;
  const testPublishableKey = process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!testSecretKey) {
    console.log('\n❌ STRIPE_TEST_SECRET_KEY is missing!');
    console.log('💡 Add this to your .env.local file:');
    console.log('STRIPE_TEST_SECRET_KEY=sk_test_your_test_secret_key');
    return;
  }

  if (!testPublishableKey) {
    console.log('\n❌ STRIPE_TEST_PUBLISHABLE_KEY is missing!');
    console.log('💡 Add this to your .env.local file:');
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key');
    return;
  }

  // Validate key formats
  if (!testSecretKey.startsWith('sk_test_')) {
    console.log('\n❌ Invalid secret key format! Should start with sk_test_');
    return;
  }

  if (!testPublishableKey.startsWith('pk_test_')) {
    console.log('\n❌ Invalid publishable key format! Should start with pk_test_');
    return;
  }

  console.log('\n✅ Environment variables look good!');

  // Test Stripe API connection
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(testSecretKey);

    console.log('\n🔌 Testing Stripe API connection...');
    
    // Test 1: Create a simple payment intent
    console.log('📝 Creating test payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 20000, // $200.00 in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        test: 'true',
        business: 'A Pretty Girl Matter',
        service_type: 'permanent_makeup_test'
      }
    });

    console.log('✅ Payment intent created successfully!');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Client Secret: ${paymentIntent.client_secret.substring(0, 20)}...`);

    // Test 2: Test card information
    console.log('\n💳 Test Card Information:');
    console.log('✅ Card Number: 4242424242424242 (Visa)');
    console.log('✅ Expiry: Any future date (e.g., 12/25)');
    console.log('✅ CVC: Any 3 digits (e.g., 123)');
    console.log('✅ ZIP: Any 5 digits (e.g., 12345)');

    console.log('\n🎯 Other Test Cards:');
    console.log('• 4000000000000002 - Card declined');
    console.log('• 4000000000009995 - Insufficient funds');
    console.log('• 4000000000009987 - Lost card');
    console.log('• 4000000000000069 - Expired card');

    // Test 3: Retrieve the payment intent to confirm it exists
    console.log('\n🔍 Verifying payment intent...');
    const retrievedIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log('✅ Payment intent retrieved successfully!');
    console.log(`   Status: ${retrievedIntent.status}`);

    console.log('\n🎉 All Stripe tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Navigate to your payment form');
    console.log('3. Use test card 4242424242424242 with any future expiry date');
    console.log('4. The payment should process successfully in test mode');

    console.log('\n💡 If payments still fail in your app:');
    console.log('• Check browser console for JavaScript errors');
    console.log('• Verify the payment form is using the correct publishable key');
    console.log('• Ensure your API endpoint is working correctly');
    console.log('• Check that CORS is properly configured');

  } catch (error) {
    console.log('\n❌ Stripe API Error:');
    console.error(error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Authentication failed. Check your secret key:');
      console.log('• Make sure STRIPE_TEST_SECRET_KEY is correct');
      console.log('• Verify the key starts with sk_test_');
      console.log('• Get your keys from: https://dashboard.stripe.com/test/apikeys');
    } else if (error.type === 'StripeAPIError') {
      console.log('\n💡 API Error. This might be a temporary issue.');
      console.log('• Check your internet connection');
      console.log('• Try again in a few moments');
    }
  }
}

// Run the test
testStripePayment().catch(console.error);
