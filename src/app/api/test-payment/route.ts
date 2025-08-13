import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Payment Intent Creation via API...');
  
  try {
    // Make a request to our own payment intent endpoint
    const baseUrl = request.nextUrl.origin;
    const paymentResponse = await fetch(`${baseUrl}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 15000, // $150.00 in cents
        currency: 'usd'
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    if (paymentResponse.ok) {
      return NextResponse.json({
        success: true,
        message: '✅ Payment Intent Created Successfully!',
        paymentIntent: {
          id: paymentData.payment_intent_id,
          clientSecret: paymentData.client_secret?.substring(0, 20) + '...',
          amount: '$150.00'
        },
        status: 'Stripe integration is working correctly!'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ Payment Intent Creation Failed!',
        error: paymentData.error,
        troubleshooting: [
          'Check that Stripe keys are properly configured in .env.local',
          'Verify Stripe keys have correct format (pk_test_ and sk_test_)',
          'Check server console for detailed error messages'
        ]
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Payment test error:', error);
    
    return NextResponse.json({
      success: false,
      message: '💥 Payment Test Failed!',
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check that your development server is running',
        'Verify .env.local file exists and contains Stripe keys',
        'Restart development server after adding environment variables'
      ]
    }, { status: 500 });
  }
}
