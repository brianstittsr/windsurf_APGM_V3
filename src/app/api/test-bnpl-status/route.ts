import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export async function GET() {
  try {
    const results = {
      card: { enabled: false, error: null as string | null },
      klarna: { enabled: false, error: null as string | null },
      afterpay_clearpay: { enabled: false, error: null as string | null },
      affirm: { enabled: false, error: null as string | null },
    };

    // Test each payment method individually
    const testPaymentMethod = async (method: 'card' | 'klarna' | 'afterpay_clearpay' | 'affirm') => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: [method],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Test Payment Method',
                },
                unit_amount: 5000,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
        });
        // If we get here, the payment method is enabled
        return { enabled: true, error: null };
      } catch (error: any) {
        return { enabled: false, error: error.message };
      }
    };

    // Test all methods
    const [card, klarna, afterpay_clearpay, affirm] = await Promise.all([
      testPaymentMethod('card'),
      testPaymentMethod('klarna'),
      testPaymentMethod('afterpay_clearpay'),
      testPaymentMethod('affirm'),
    ]);

    results.card = card;
    results.klarna = klarna;
    results.afterpay_clearpay = afterpay_clearpay;
    results.affirm = affirm;

    // Determine working methods
    const workingMethods = Object.entries(results)
      .filter(([, value]) => value.enabled)
      .map(([key]) => key);

    return NextResponse.json({
      status: 'success',
      results,
      workingMethods,
      summary: {
        totalTested: 4,
        working: workingMethods.length,
        failed: 4 - workingMethods.length,
      },
      instructions: {
        klarna: 'Enable at: https://dashboard.stripe.com/settings/payment_methods → Klarna',
        afterpay_clearpay: 'Enable at: https://dashboard.stripe.com/settings/payment_methods → Afterpay',
        affirm: 'Enable at: https://dashboard.stripe.com/settings/payment_methods → Affirm',
      },
    });

  } catch (error: any) {
    console.error('Error testing payment methods:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message,
        hint: 'Make sure STRIPE_SECRET_KEY is set in environment variables'
      },
      { status: 500 }
    );
  }
}
