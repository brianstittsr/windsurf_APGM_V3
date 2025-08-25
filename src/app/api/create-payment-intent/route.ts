import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey, getStripeModeDescription } from '@/lib/stripe-config';

let stripe: Stripe;

try {
  const secretKey = getStripeSecretKey();
  if (secretKey.includes('placeholder')) {
    console.warn('⚠️ Using placeholder Stripe key - payments will not work');
  }
  stripe = new Stripe(secretKey);
} catch (error) {
  console.error('❌ Stripe initialization failed:', error);
  throw error;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly initialized
    const secretKey = getStripeSecretKey();
    if (secretKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please set up Stripe environment variables.' },
        { status: 500 }
      );
    }

    const { amount, currency = 'usd', payment_method_types } = await request.json();

    if (!amount || amount < 50) { // Minimum 50 cents
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log(`💳 Creating payment intent in ${getStripeModeDescription()} mode for $${(amount / 100).toFixed(2)}`);
    console.log(`💳 Payment methods requested: ${payment_method_types ? payment_method_types.join(', ') : 'automatic'}`);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount), // Amount in cents
      currency,
      metadata: {
        business: 'A Pretty Girl Matter',
        service_type: 'permanent_makeup',
      },
    };

    // Configure payment methods
    if (payment_method_types && payment_method_types.length > 0) {
      paymentIntentConfig.payment_method_types = payment_method_types;
      
      // Add payment method specific options
      const paymentMethodOptions: any = {};
      
      if (payment_method_types.includes('klarna')) {
        paymentMethodOptions.klarna = {
          preferred_locale: 'en-US',
        };
      }
      
      if (payment_method_types.includes('affirm')) {
        paymentMethodOptions.affirm = {
          preferred_locale: 'en-US',
        };
      }
      
      if (Object.keys(paymentMethodOptions).length > 0) {
        paymentIntentConfig.payment_method_options = paymentMethodOptions;
      }
    } else {
      paymentIntentConfig.automatic_payment_methods = {
        enabled: true,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Log Stripe configuration status
    try {
      const secretKey = getStripeSecretKey();
      console.error('❌ Stripe secret key status:', secretKey.includes('placeholder') ? 'PLACEHOLDER' : 'CONFIGURED');
    } catch (configError) {
      console.error('❌ Stripe config error:', configError);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : 'Unknown error type'
      },
      { status: 500 }
    );
  }
}
