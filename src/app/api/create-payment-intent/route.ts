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
    console.log('🚀 Payment intent creation API called');
    
    // Check if Stripe is properly initialized
    const secretKey = getStripeSecretKey();
    console.log('🔑 Stripe key status:', secretKey.includes('placeholder') ? 'PLACEHOLDER' : 'CONFIGURED');
    
    if (secretKey.includes('placeholder')) {
      console.error('❌ Stripe not configured - using placeholder key');
      return NextResponse.json(
        { error: 'Payment system not configured. Please set up Stripe environment variables.' },
        { status: 500 }
      );
    }

    const requestBody = await request.json();
    console.log('📨 Request body received:', requestBody);
    
    const { amount, currency = 'usd', payment_method_types } = requestBody;

    if (!amount || amount < 50) { // Minimum 50 cents
      console.error('❌ Invalid amount:', amount);
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
    
    console.log('⚙️ Payment intent config:', JSON.stringify(paymentIntentConfig, null, 2));

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

    console.log('🔧 Final payment intent config:', JSON.stringify(paymentIntentConfig, null, 2));
    
    console.log('🚀 Calling Stripe API to create payment intent...');
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);
    
    console.log('✅ Payment intent created successfully:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret_exists: !!paymentIntent.client_secret
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Log more specific Stripe error details
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('❌ Stripe error type:', (error as any).type);
      console.error('❌ Stripe error code:', (error as any).code);
      console.error('❌ Stripe error param:', (error as any).param);
    }
    
    // Log Stripe configuration status
    try {
      const secretKey = getStripeSecretKey();
      console.error('❌ Stripe secret key status:', secretKey.includes('placeholder') ? 'PLACEHOLDER' : 'CONFIGURED');
      console.error('❌ Stripe mode:', getStripeModeDescription());
    } catch (configError) {
      console.error('❌ Stripe config error:', configError);
    }
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Stripe API key is invalid. Please check your environment configuration.';
      } else if (error.message.includes('No such')) {
        errorMessage = 'Stripe resource not found. Please check your configuration.';
      } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Network error connecting to Stripe. Please check your internet connection.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error type',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
