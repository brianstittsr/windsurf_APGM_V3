import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { StripeService } from '@/services/stripeService';
import { getStripeWebhookSecret } from '@/lib/stripe-config';

const endpointSecret = getStripeWebhookSecret();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27'
});
const stripeService = new StripeService();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sigHeader = headers().get('stripe-signature');

  if (!sigHeader) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sigHeader, endpointSecret);
    await stripeService.handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
