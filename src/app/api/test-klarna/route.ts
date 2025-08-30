import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey, getStripeModeDescription } from '@/lib/stripe-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Klarna availability...');
    
    const secretKey = getStripeSecretKey();
    if (secretKey.includes('placeholder')) {
      return NextResponse.json({
        error: 'Stripe not configured - using placeholder key',
        klarna_available: false
      });
    }

    const stripe = new Stripe(secretKey);
    const mode = getStripeModeDescription();
    
    console.log(`📋 Testing in ${mode} mode`);

    // Test 1: Try to create a payment intent with Klarna
    let klarnaTest = {
      success: false,
      error: null,
      payment_intent_id: null
    };

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
      
      klarnaTest.success = true;
      klarnaTest.payment_intent_id = paymentIntent.id;
      console.log('✅ Klarna payment intent created successfully');
      
    } catch (error: any) {
      klarnaTest.error = error.message;
      console.log('❌ Klarna payment intent failed:', error.message);
    }

    // Test 2: Check account capabilities
    let accountInfo = {
      country: null,
      business_type: null,
      klarna_capability: null,
      error: null
    };

    try {
      const account = await stripe.accounts.retrieve();
      accountInfo.country = account.country;
      accountInfo.business_type = account.business_type;
      
      if (account.capabilities) {
        accountInfo.klarna_capability = account.capabilities.klarna_payments;
      }
      
      console.log('✅ Account information retrieved');
      
    } catch (error: any) {
      accountInfo.error = error.message;
      console.log('❌ Could not retrieve account info:', error.message);
    }

    // Test 3: Basic API connectivity
    let basicTest = {
      success: false,
      error: null
    };

    try {
      await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      basicTest.success = true;
      console.log('✅ Basic API connectivity confirmed');
      
    } catch (error: any) {
      basicTest.error = error.message;
      console.log('❌ Basic API test failed:', error.message);
    }

    // Determine overall Klarna status
    let klarnaStatus = 'unknown';
    let recommendation = '';

    if (klarnaTest.success) {
      klarnaStatus = 'enabled';
      recommendation = 'Klarna is fully enabled and working!';
    } else if (accountInfo.klarna_capability === 'active') {
      klarnaStatus = 'enabled_but_failed';
      recommendation = 'Klarna capability is active but payment intent creation failed. Check error details.';
    } else if (accountInfo.klarna_capability === 'pending') {
      klarnaStatus = 'pending';
      recommendation = 'Klarna capability is pending approval from Stripe.';
    } else if (klarnaTest.error?.includes('payment_method_type')) {
      klarnaStatus = 'not_enabled';
      recommendation = 'Klarna is not enabled. Visit https://dashboard.stripe.com/settings/payment_methods to enable it.';
    } else {
      klarnaStatus = 'error';
      recommendation = 'Unable to determine Klarna status due to API errors.';
    }

    return NextResponse.json({
      stripe_mode: mode,
      klarna_status: klarnaStatus,
      recommendation,
      tests: {
        klarna_payment_intent: klarnaTest,
        account_info: accountInfo,
        basic_api: basicTest
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Test script error:', error);
    
    return NextResponse.json({
      error: 'Test script failed',
      details: error.message,
      klarna_available: false
    }, { status: 500 });
  }
}
