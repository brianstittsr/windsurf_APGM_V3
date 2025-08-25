import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey, getStripeModeDescription } from '@/lib/stripe-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing payment intent creation directly...');
    
    const secretKey = getStripeSecretKey();
    console.log('🔑 Secret key status:', secretKey.includes('placeholder') ? 'PLACEHOLDER' : 'CONFIGURED');
    console.log('🔑 Secret key prefix:', secretKey.substring(0, 12) + '...');
    
    const stripe = new Stripe(secretKey);
    
    const testPaymentIntent = await stripe.paymentIntents.create({
      amount: 20000, // $200.00
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        test: 'direct_api_test',
        business: 'A Pretty Girl Matter'
      }
    });
    
    console.log('✅ Payment intent created successfully:', {
      id: testPaymentIntent.id,
      amount: testPaymentIntent.amount,
      status: testPaymentIntent.status,
      client_secret_exists: !!testPaymentIntent.client_secret
    });
    
    return NextResponse.json({
      success: true,
      message: 'Payment intent created successfully',
      paymentIntent: {
        id: testPaymentIntent.id,
        amount: testPaymentIntent.amount,
        currency: testPaymentIntent.currency,
        status: testPaymentIntent.status,
        client_secret: testPaymentIntent.client_secret
      },
      stripeMode: getStripeModeDescription()
    });
    
  } catch (error) {
    console.error('❌ Direct payment intent test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      details: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
