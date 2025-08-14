import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, productName, stripeMode, isTestPayment } = await request.json();

    // Validate required fields
    if (!amount || !currency || !productName) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, productName' },
        { status: 400 }
      );
    }

    // Get the appropriate Stripe secret key based on mode
    const secretKey = stripeMode === 'live' 
      ? process.env.STRIPE_LIVE_SECRET_KEY 
      : process.env.STRIPE_TEST_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: `Stripe ${stripeMode} secret key not configured` },
        { status: 500 }
      );
    }

    // Initialize Stripe with the appropriate key
    const stripe = new Stripe(secretKey);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is an integer
      currency: currency.toLowerCase(),
      metadata: {
        productName,
        isTestPayment: isTestPayment ? 'true' : 'false',
        stripeMode,
        createdAt: new Date().toISOString(),
      },
      description: isTestPayment 
        ? `Test payment for ${productName} - $${(amount / 100).toFixed(2)}`
        : `Payment for ${productName}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      mode: stripeMode,
    });

  } catch (error: any) {
    console.error('Error creating test payment intent:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: `Card error: ${error.message}` },
        { status: 400 }
      );
    } else if (error.type === 'StripeRateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests made to the API too quickly' },
        { status: 429 }
      );
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Invalid parameters: ${error.message}` },
        { status: 400 }
      );
    } else if (error.type === 'StripeAPIError') {
      return NextResponse.json(
        { error: 'An error occurred with our API' },
        { status: 500 }
      );
    } else if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: 'A network error occurred' },
        { status: 500 }
      );
    } else if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Authentication with Stripe API failed' },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }
}
