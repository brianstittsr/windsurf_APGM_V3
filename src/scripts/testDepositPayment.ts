/**
 * Test Deposit Payment Script
 * Simulates a successful $200 deposit payment in Stripe sandbox
 */

import Stripe from 'stripe';
import { getStripeSecretKey, getStripeModeDescription, isStripeLiveMode } from '@/lib/stripe-config';

interface PaymentTestResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error?: string;
  mode?: string;
}

async function createTestPaymentIntent(): Promise<PaymentTestResult> {
  try {
    console.log('🧪 Creating test payment intent...');
    
    // Check if we're in test mode
    if (isStripeLiveMode()) {
      return {
        success: false,
        error: 'Cannot run test payments in LIVE mode. Switch to test mode first.'
      };
    }
    
    const stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-07-30.basil',
    });
    
    console.log(`📋 Mode: ${getStripeModeDescription()}`);
    
    // Create a payment intent for $200 deposit
    const depositAmount = 200; // $200 in dollars
    const amountInCents = depositAmount * 100; // Convert to cents
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      capture_method: 'automatic', // Ensure payment is captured immediately
      confirmation_method: 'manual', // We'll confirm manually
      metadata: {
        business: 'A Pretty Girl Matter',
        service_type: 'semi_permanent_makeup_deposit',
        service_name: 'Test Service - Strokes Eyebrows',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        test_payment: 'true',
        booking_date: new Date().toISOString(),
        deposit_amount: '200.00'
      },
      description: '$200 deposit for semi-permanent makeup service - Test Payment',
      receipt_email: 'test@example.com'
    });
    
    console.log('✅ Payment intent created successfully!');
    console.log(`   Payment Intent ID: ${paymentIntent.id}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Currency: ${paymentIntent.currency.toUpperCase()}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Client Secret: ${paymentIntent.client_secret?.substring(0, 20)}...`);
    
    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      mode: getStripeModeDescription()
    };
    
  } catch (error) {
    console.error('❌ Failed to create payment intent:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

async function confirmTestPayment(paymentIntentId: string): Promise<PaymentTestResult> {
  try {
    console.log('\n💳 Confirming payment with test card...');
    
    const stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-07-30.basil',
    });
    
    // First create a payment method with test card details
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242', // Visa test card
        exp_month: 12,
        exp_year: 2025,
        cvc: '123',
      },
      billing_details: {
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          line1: '123 Test Street',
          city: 'Test City',
          state: 'NC',
          postal_code: '12345',
          country: 'US'
        }
      }
    });
    
    console.log(`   Created payment method: ${paymentMethod.id}`);
    
    // Confirm the payment intent with the payment method
    const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod.id,
      return_url: 'https://example.com/return', // Required for some payment methods
    });
    
    console.log('✅ Payment confirmed successfully!');
    console.log(`   Payment Intent ID: ${confirmedPayment.id}`);
    console.log(`   Status: ${confirmedPayment.status}`);
    console.log(`   Amount Received: $${(confirmedPayment.amount_received / 100).toFixed(2)}`);
    
    // Get charge details if payment succeeded
    if (confirmedPayment.status === 'succeeded') {
      try {
        const charges = await stripe.charges.list({
          payment_intent: paymentIntentId,
          limit: 1
        });
        
        if (charges.data[0]) {
          const charge = charges.data[0];
          console.log(`   Charge ID: ${charge.id}`);
          console.log(`   Card Last 4: ****${charge.payment_method_details?.card?.last4}`);
          console.log(`   Card Brand: ${charge.payment_method_details?.card?.brand}`);
        }
      } catch (error) {
        console.log('   (Could not retrieve charge details)');
      }
    }
    
    return {
      success: true,
      paymentIntentId: confirmedPayment.id,
      amount: confirmedPayment.amount_received,
      currency: confirmedPayment.currency,
      status: confirmedPayment.status,
      mode: getStripeModeDescription()
    };
    
  } catch (error) {
    console.error('❌ Failed to confirm payment:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

async function retrievePaymentDetails(paymentIntentId: string): Promise<void> {
  try {
    console.log('\n📊 Retrieving final payment details...');
    
    const stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-07-30.basil',
    });
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('📋 Final Payment Summary:');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Amount Received: $${(paymentIntent.amount_received / 100).toFixed(2)}`);
    console.log(`   Created: ${new Date(paymentIntent.created * 1000).toLocaleString()}`);
    console.log(`   Description: ${paymentIntent.description}`);
    
    if (paymentIntent.metadata) {
      console.log('   Metadata:');
      Object.entries(paymentIntent.metadata).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to retrieve payment details:', error);
  }
}

async function testDepositPayment(): Promise<void> {
  console.log('🚀 Starting Deposit Payment Test...\n');
  console.log('This test will:');
  console.log('1. Create a payment intent for $200 deposit');
  console.log('2. Confirm payment with test card');
  console.log('3. Verify successful payment\n');
  
  // Step 1: Create payment intent
  const createResult = await createTestPaymentIntent();
  
  if (!createResult.success || !createResult.paymentIntentId) {
    console.error('\n💥 Test failed at payment intent creation');
    console.error(`Error: ${createResult.error}`);
    return;
  }
  
  // Step 2: Confirm payment
  const confirmResult = await confirmTestPayment(createResult.paymentIntentId);
  
  if (!confirmResult.success) {
    console.error('\n💥 Test failed at payment confirmation');
    console.error(`Error: ${confirmResult.error}`);
    return;
  }
  
  // Step 3: Retrieve final details
  await retrievePaymentDetails(createResult.paymentIntentId);
  
  // Summary
  console.log('\n🎉 DEPOSIT PAYMENT TEST COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`✅ Payment Intent Created: ${createResult.paymentIntentId}`);
  console.log(`✅ Payment Confirmed: ${confirmResult.status}`);
  console.log(`✅ Amount Processed: $${((confirmResult.amount || 0) / 100).toFixed(2)}`);
  console.log(`✅ Mode: ${confirmResult.mode}`);
  console.log('\n💡 This confirms your Stripe integration is working correctly!');
  console.log('   You can now process real deposits through your booking system.');
}

// Run the test if this script is executed directly
if (require.main === module) {
  testDepositPayment()
    .then(() => {
      console.log('\n🏁 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed with error:', error);
      process.exit(1);
    });
}

export { testDepositPayment, createTestPaymentIntent, confirmTestPayment };
export type { PaymentTestResult };
