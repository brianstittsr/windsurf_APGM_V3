import { NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';

type PaymentIntentRequest = {
  amount: number;
  description?: string;
  metadata?: Record<string, string>;
};

export async function POST(request: Request) {
  const body = await request.json() as PaymentIntentRequest;
  
  try {
    const stripeService = new StripeService();
    const result = await stripeService.createPaymentIntent({
      amount: body.amount,
      description: body.description,
      metadata: body.metadata || {}
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Payment intent creation failed' },
      { status: 500 }
    );
  }
}
