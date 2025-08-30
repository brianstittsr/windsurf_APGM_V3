const Stripe = require('stripe');

// Load Stripe keys from environment variables
require('dotenv').config();

const STRIPE_KEYS = {
  test: {
    publishable: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || '',
    secret: process.env.STRIPE_TEST_SECRET_KEY || ''
  },
  live: {
    publishable: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || '',
    secret: process.env.STRIPE_LIVE_SECRET_KEY || ''
  }
};

function getStripeConfig() {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const stripeMode = environment === 'production' ? 'live' : 'test';
  const stripeKeys = STRIPE_KEYS[stripeMode];
  
  return {
    publishableKey: stripeKeys.publishable,
    secretKey: stripeKeys.secret,
    mode: stripeMode,
    isLive: stripeMode === 'live'
  };
}

async function checkKlarnaStatus() {
  try {
    console.log('🔍 Checking Klarna availability in Stripe account...\n');
    
    // Get current Stripe configuration
    const config = getStripeConfig();
    console.log(`📋 Current mode: ${config.mode}`);
    console.log(`🔑 Using ${config.mode} keys\n`);
    
    // Initialize Stripe with current configuration
    const stripe = new Stripe(config.secretKey);
    
    // Test 1: Try to create a payment intent with Klarna
    console.log('🧪 Test 1: Creating payment intent with Klarna...');
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000, // $20.00
        currency: 'usd',
        payment_method_types: ['klarna'],
        payment_method_options: {
          klarna: {
            preferred_locale: 'en-US',
          },
        },
        metadata: {
          test: 'klarna_availability_check'
        }
      });
      
      console.log('✅ SUCCESS: Klarna payment intent created');
      console.log(`   Payment Intent ID: ${paymentIntent.id}`);
      console.log(`   Status: ${paymentIntent.status}`);
      console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
      
    } catch (error) {
      console.log('❌ FAILED: Cannot create Klarna payment intent');
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('payment_method_type')) {
        console.log('   💡 This likely means Klarna is not enabled for your account');
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Check account capabilities
    console.log('🧪 Test 2: Checking account capabilities...');
    try {
      const account = await stripe.accounts.retrieve();
      console.log('✅ Account retrieved successfully');
      console.log(`   Country: ${account.country}`);
      console.log(`   Business type: ${account.business_type || 'Not specified'}`);
      
      if (account.capabilities) {
        const klarnaCapability = account.capabilities.klarna_payments;
        console.log(`   Klarna capability: ${klarnaCapability || 'Not available'}`);
        
        if (klarnaCapability === 'active') {
          console.log('✅ Klarna is ACTIVE on your account');
        } else if (klarnaCapability === 'pending') {
          console.log('⏳ Klarna is PENDING approval');
        } else {
          console.log('❌ Klarna is NOT enabled');
        }
      }
      
    } catch (error) {
      console.log('❌ Could not retrieve account information');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Try creating a simple payment intent to verify API connectivity
    console.log('🧪 Test 3: Testing basic API connectivity...');
    try {
      const basicIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      console.log('✅ Basic payment intent created successfully');
      console.log(`   Available payment methods: ${basicIntent.automatic_payment_methods ? 'Automatic' : 'Manual'}`);
      
    } catch (error) {
      console.log('❌ Basic API test failed');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('📋 SUMMARY:');
    console.log('1. Check the results above');
    console.log('2. If Klarna failed, visit: https://dashboard.stripe.com/settings/payment_methods');
    console.log('3. Enable Klarna in your Stripe Dashboard');
    console.log('4. Some accounts may need manual approval from Stripe');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    console.error('Full error:', error);
  }
}

checkKlarnaStatus();
