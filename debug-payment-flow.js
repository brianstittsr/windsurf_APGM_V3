/**
 * Debug Payment Flow - Test the complete payment process
 * This will help identify where the "No such payment_intent" error occurs
 */

require('dotenv').config({ path: '.env.local' });

async function debugPaymentFlow() {
  console.log('🔍 Debugging Payment Flow...\n');

  // Step 1: Check environment
  const testSecretKey = process.env.STRIPE_TEST_SECRET_KEY;
  const testPublishableKey = process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  console.log('📋 Environment Check:');
  console.log('Secret Key:', testSecretKey ? `${testSecretKey.substring(0, 12)}...` : 'MISSING');
  console.log('Publishable Key:', testPublishableKey ? `${testPublishableKey.substring(0, 12)}...` : 'MISSING');

  if (!testSecretKey || !testPublishableKey) {
    console.log('\n❌ Missing Stripe keys! Check your .env.local file.');
    return;
  }

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(testSecretKey);

    // Step 2: Test payment intent creation (simulating API call)
    console.log('\n🔧 Step 1: Creating Payment Intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 20000, // $200.00 in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        business: 'A Pretty Girl Matter',
        service_type: 'permanent_makeup',
      },
    });

    console.log('✅ Payment Intent Created:');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Client Secret: ${paymentIntent.client_secret}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);

    // Step 3: Test retrieving the payment intent
    console.log('\n🔍 Step 2: Retrieving Payment Intent...');
    const retrieved = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log('✅ Payment Intent Retrieved Successfully');
    console.log(`   Status: ${retrieved.status}`);

    // Step 4: Simulate the frontend confirmation process
    console.log('\n💳 Step 3: Testing Card Confirmation...');
    
    // This simulates what happens when the frontend calls confirmCardPayment
    // We'll try to confirm with a test payment method
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
        billing_details: {
          name: 'Test User',
          address: {
            line1: '123 Test St',
            city: 'Test City',
            state: 'NC',
            postal_code: '12345',
            country: 'US',
          },
        },
      });

      console.log('✅ Payment Method Created:');
      console.log(`   ID: ${paymentMethod.id}`);
      console.log(`   Card: **** **** **** ${paymentMethod.card.last4}`);

      // Confirm the payment intent
      const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: paymentMethod.id,
      });

      console.log('✅ Payment Confirmed:');
      console.log(`   Status: ${confirmed.status}`);
      console.log(`   ID: ${confirmed.id}`);

      if (confirmed.status === 'succeeded') {
        console.log('\n🎉 PAYMENT FLOW TEST PASSED!');
        console.log('\n💡 The Stripe configuration is working correctly.');
        console.log('The issue might be in your frontend code or API endpoint.');
      }

    } catch (confirmError) {
      console.log('\n❌ Payment Confirmation Failed:');
      console.error(confirmError.message);
    }

    // Step 5: Common issues and solutions
    console.log('\n🔧 Common Issues & Solutions:');
    console.log('\n1. Frontend Issues:');
    console.log('   • Check browser console for JavaScript errors');
    console.log('   • Verify Stripe.js is loaded correctly');
    console.log('   • Ensure publishable key is set in environment');
    
    console.log('\n2. API Endpoint Issues:');
    console.log('   • Check if /api/create-payment-intent is working');
    console.log('   • Verify the response contains client_secret');
    console.log('   • Check server logs for errors');
    
    console.log('\n3. Network Issues:');
    console.log('   • Verify HTTPS is used (Stripe requires HTTPS in production)');
    console.log('   • Check for CORS issues');
    console.log('   • Ensure API routes are accessible');

    console.log('\n📝 Next Steps:');
    console.log('1. Test your API endpoint directly:');
    console.log('   curl -X POST http://localhost:3000/api/create-payment-intent \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"amount":20000,"currency":"usd"}\'');
    
    console.log('\n2. Check browser network tab when payment fails');
    console.log('3. Look for any JavaScript errors in browser console');
    console.log('4. Verify the payment form is using the correct publishable key');

  } catch (error) {
    console.log('\n❌ Error during payment flow test:');
    console.error(error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Authentication Error:');
      console.log('• Check your STRIPE_TEST_SECRET_KEY');
      console.log('• Make sure it starts with sk_test_');
      console.log('• Verify the key is from your Stripe dashboard');
    }
  }
}

// Run the debug
debugPaymentFlow().catch(console.error);
