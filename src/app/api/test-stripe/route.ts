import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY not configured' },
      { status: 400 }
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      description: 'Test payment'
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Stripe test failed', details: error },
      { status: 500 }
    );
  }
}
