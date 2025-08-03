import { NextResponse } from 'next/server';
import { testDepositPayment } from '@/scripts/testDepositPayment';
import { isStripeLiveMode, getStripeModeDescription } from '@/lib/stripe-config';

export async function POST() {
  try {
    // Safety check - only allow in test mode
    if (isStripeLiveMode()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test payments are not allowed in LIVE mode. Switch to test mode first.',
          currentMode: getStripeModeDescription()
        },
        { status: 400 }
      );
    }
    
    console.log('🧪 Starting deposit payment test via API...');
    
    // Run the deposit payment test
    await testDepositPayment();
    
    const response = {
      success: true,
      message: 'Deposit payment test completed successfully!',
      amount: 200,
      currency: 'USD',
      mode: getStripeModeDescription(),
      timestamp: new Date().toISOString(),
      testDetails: {
        description: 'Successfully created and confirmed a $200 deposit payment',
        testCard: 'Visa test card (4242 4242 4242 4242)',
        nextSteps: [
          'Your Stripe integration is working correctly',
          'You can now process real deposits through your booking system',
          'Check your Stripe Dashboard to see the test payment'
        ]
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Deposit payment test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        mode: getStripeModeDescription(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return information about the test endpoint
  return NextResponse.json({
    endpoint: '/api/stripe/test-deposit',
    method: 'POST',
    description: 'Tests a successful $200 deposit payment in Stripe sandbox',
    requirements: [
      'STRIPE_MODE must be set to "test"',
      'Valid STRIPE_TEST_SECRET_KEY required',
      'Only works in test/sandbox mode for safety'
    ],
    testFlow: [
      '1. Creates a payment intent for $200',
      '2. Confirms payment with test Visa card',
      '3. Verifies successful payment processing',
      '4. Returns detailed test results'
    ]
  });
}
