import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export async function POST(request: Request) {
  try {
    // Create a test Stripe customer to verify the connection works
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Successfully created test Stripe customer:', customer.id);

    // Delete the test customer immediately
    await stripe.customers.del(customer.id);
    console.log('✅ Successfully deleted test Stripe customer');

    return NextResponse.json({
      success: true,
      message: 'Stripe connection test successful',
      customerId: customer.id
    });

  } catch (error) {
    console.error('❌ Stripe connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
