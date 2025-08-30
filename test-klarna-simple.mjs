import Stripe from 'stripe';

// Load Stripe keys from environment variables
import dotenv from 'dotenv';
dotenv.config();

const STRIPE_KEYS = {
  test: {
    secret: process.env.STRIPE_TEST_SECRET_KEY || ''
  },
  live: {
    secret: process.env.STRIPE_LIVE_SECRET_KEY || ''
  }
};

async function testKlarna() {
  console.log('🔍 Testing Klarna Configuration\n');
  
  // Test both modes
  for (const mode of ['test', 'live']) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Testing ${mode.toUpperCase()} mode`);
    console.log(`${'='.repeat(50)}`);
    
    const stripe = new Stripe(STRIPE_KEYS[mode].secret);
    
    // Test 1: Basic API connectivity
    console.log('\n1️⃣ Testing basic API connectivity...');
    try {
      const intent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        automatic_payment_methods: { enabled: true }
      });
      console.log('✅ Basic API works - Payment Intent created:', intent.id);
    } catch (error) {
      console.log('❌ Basic API failed:', error.message);
      continue;
    }
    
    // Test 2: Klarna payment intent
    console.log('\n2️⃣ Testing Klarna payment intent...');
    try {
      const klarnaIntent = await stripe.paymentIntents.create({
        amount: 2000,
        currency: 'usd',
        payment_method_types: ['klarna'],
        payment_method_options: {
          klarna: {
            preferred_locale: 'en-US'
          }
        }
      });
      console.log('✅ KLARNA WORKS - Payment Intent created:', klarnaIntent.id);
      console.log('   Status:', klarnaIntent.status);
      console.log('   Amount: $' + (klarnaIntent.amount / 100).toFixed(2));
    } catch (error) {
      console.log('❌ KLARNA FAILED:', error.message);
      if (error.message.includes('payment_method_type')) {
        console.log('   💡 This means Klarna is not enabled for your account');
      }
    }
    
    // Test 3: Account capabilities
    console.log('\n3️⃣ Checking account capabilities...');
    try {
      const account = await stripe.accounts.retrieve();
      console.log('✅ Account info retrieved');
      console.log('   Country:', account.country);
      console.log('   Business type:', account.business_type || 'Not specified');
      
      if (account.capabilities && account.capabilities.klarna_payments) {
        const klarnaStatus = account.capabilities.klarna_payments;
        console.log('   Klarna capability:', klarnaStatus);
        
        if (klarnaStatus === 'active') {
          console.log('   ✅ Klarna is ACTIVE');
        } else if (klarnaStatus === 'pending') {
          console.log('   ⏳ Klarna is PENDING approval');
        } else {
          console.log('   ❌ Klarna status:', klarnaStatus);
        }
      } else {
        console.log('   ❌ Klarna capability not found');
      }
    } catch (error) {
      console.log('❌ Account check failed:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY & NEXT STEPS');
  console.log('='.repeat(60));
  console.log('1. If Klarna worked: You\'re all set! ✅');
  console.log('2. If Klarna failed: Visit https://dashboard.stripe.com/settings/payment_methods');
  console.log('3. Enable Klarna in your Stripe Dashboard');
  console.log('4. Some accounts need manual approval - contact Stripe support');
  console.log('5. Klarna requires specific countries/business types');
}

testKlarna().catch(console.error);
