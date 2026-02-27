import { Stripe } from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

async function testStripeService() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY not found in .env.local');
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil'
  });

  try {
    console.log('Testing Stripe payment intent creation with live credentials...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      description: 'Test payment'
    });

    console.log('Success! Payment intent created:');
    console.log(`- Client Secret: ${paymentIntent.client_secret}`);
    console.log(`- Payment ID: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Stripe test failed:', error);
  }
}

testStripeService();
