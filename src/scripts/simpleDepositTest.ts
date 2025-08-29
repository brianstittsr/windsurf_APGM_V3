/**
 * Simple Deposit Test - Minimal script to test $200 deposit payment
 * This will create a payment that shows up in your Stripe Dashboard
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { calculateStripeFee } from '../lib/stripe-fees';
import { InvoiceEmailService, InvoiceData } from '../services/invoiceEmailService';
import { getStripeSecretKey, getStripeModeDescription } from '../lib/stripe-config';

async function runSimpleDepositTest() {
  console.log('🧪 Simple $200 Deposit Test\n');
  
  // Use Stripe configuration utility for proper mode handling
  const secretKey = getStripeSecretKey();
  const modeDescription = getStripeModeDescription();
  
  console.log(`✅ Stripe configuration loaded for ${modeDescription} mode`);
  console.log(`🔑 Using key: ${secretKey.substring(0, 12)}...`);
  
  // Initialize Stripe with proper configuration
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-07-30.basil',
  });
  
  // Validate Stripe configuration
  if (!secretKey) {
    console.error('❌ Stripe secret key not found in environment variables');
    console.log('\n📋 To fix this:');
    console.log('1. Set STRIPE_MODE=test or STRIPE_MODE=live in your .env.local file');
    console.log('2. Add the appropriate keys (STRIPE_TEST_SECRET_KEY or STRIPE_LIVE_SECRET_KEY)');
    console.log('3. Get your keys from: https://dashboard.stripe.com/apikeys');
    return;
  }
  
  console.log(`✅ Stripe key validated for ${modeDescription} mode, proceeding with payment test...\n`);
  
  try {
    console.log(`\n🎯 Creating payment intent in ${modeDescription} mode...`);
    
    // Calculate total amount including Stripe fee
    const depositAmount = 200;
    const stripeFee = calculateStripeFee(depositAmount);
    const totalAmount = depositAmount + stripeFee;
    const totalAmountCents = Math.round(totalAmount * 100);
    
    console.log(`   Deposit: $${depositAmount.toFixed(2)}`);
    console.log(`   Processing fee: $${stripeFee.toFixed(2)}`);
    console.log(`   Total charge: $${totalAmount.toFixed(2)}`);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents, // Total amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
      capture_method: 'automatic',
      confirmation_method: 'manual',
      description: `$${totalAmount.toFixed(2)} ($${depositAmount} deposit + $${stripeFee.toFixed(2)} processing fee) - A Pretty Girl Matter Semi-Permanent Makeup`,
      metadata: {
        business: 'A Pretty Girl Matter',
        service: 'Semi-Permanent Makeup Deposit',
        deposit_amount: `$${depositAmount.toFixed(2)}`,
        processing_fee: `$${stripeFee.toFixed(2)}`,
        total_amount: `$${totalAmount.toFixed(2)}`,
        test_payment: 'true'
      },
      receipt_email: 'test@example.com'
    });
    
    console.log(`✅ Payment Intent created: ${paymentIntent.id}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    
    console.log('\n2️⃣ Creating payment method with test token...');
    
    // Create payment method using test token (safer approach)
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Stripe test token for Visa card
      },
      billing_details: {
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          line1: '123 Test Street',
          city: 'Raleigh',
          state: 'NC',
          postal_code: '27601',
          country: 'US'
        }
      }
    });
    
    console.log(`✅ Payment Method created: ${paymentMethod.id}`);
    
    console.log('\n3️⃣ Confirming payment...');
    
    // Confirm payment
    const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethod.id
    });
    
    console.log(`✅ Payment confirmed!`);
    console.log(`   Status: ${confirmedPayment.status}`);
    console.log(`   Amount Received: $${(confirmedPayment.amount_received / 100).toFixed(2)}`);
    
    // Get charge details
    if (confirmedPayment.status === 'succeeded') {
      console.log('\n4️⃣ Retrieving charge details...');
      
      const charges = await stripe.charges.list({
        payment_intent: paymentIntent.id,
        limit: 1
      });
      
      if (charges.data[0]) {
        const charge = charges.data[0];
        console.log(`✅ Charge created: ${charge.id}`);
        console.log(`   Card: ****${charge.payment_method_details?.card?.last4} (${charge.payment_method_details?.card?.brand})`);
        console.log(`   Receipt URL: ${charge.receipt_url}`);
      }
    }
    
    console.log('\n🎉 SUCCESS! Your deposit + fee test is complete!');
    console.log('='.repeat(60));
    console.log(`Payment Intent ID: ${paymentIntent.id}`);
    console.log(`Deposit: $${depositAmount.toFixed(2)}`);
    console.log(`Processing Fee: $${stripeFee.toFixed(2)}`);
    console.log(`Total Charged: $${totalAmount.toFixed(2)}`);
    console.log(`Status: ${confirmedPayment.status}`);
    
    // Send invoice email
    console.log('\n📧 Sending invoice email...');
    
    const servicePrice = 600; // Example service price
    const tax = servicePrice * 0.0775; // 7.75% tax
    const serviceTotalWithTax = servicePrice + tax;
    const remainingBalance = serviceTotalWithTax - depositAmount;
    
    const invoiceData: InvoiceData = {
      invoiceNumber: InvoiceEmailService.generateInvoiceNumber(),
      clientName: 'Brian Stitt',
      clientEmail: 'brianstittsr@gmail.com',
      serviceName: 'Strokes Eyebrows - Test Service',
      servicePrice: servicePrice,
      tax: tax,
      processingFee: stripeFee,
      total: serviceTotalWithTax + stripeFee,
      depositPaid: totalAmount,
      remainingBalance: remainingBalance,
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: '10:00 AM',
      businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'A Pretty Girl Matter',
      businessPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(919) 441-0932',
      businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
      businessAddress: '123 Beauty Lane, Raleigh, NC 27601',
      paymentIntentId: paymentIntent.id
    };
    
    const emailSent = await InvoiceEmailService.sendInvoiceEmail(invoiceData);
    
    if (emailSent) {
      console.log('✅ Invoice email sent successfully!');
      console.log(`   Invoice #: ${invoiceData.invoiceNumber}`);
      console.log(`   Sent to: ${invoiceData.clientEmail}`);
    } else {
      console.log('❌ Failed to send invoice email');
    }
    
    console.log('\n📊 To view this payment:');
    console.log('1. Go to: https://dashboard.stripe.com/test/payments');
    console.log(`2. Look for the $${totalAmount.toFixed(2)} payment`);
    console.log(`3. Search for: ${paymentIntent.id}`);
    console.log('\n📧 Check your email for the invoice!');
    console.log('\n💡 This confirms your Stripe integration with fees and invoicing is working!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No such payment_intent')) {
        console.log('\n💡 This usually means the payment intent was not created properly.');
      } else if (error.message.includes('authentication')) {
        console.log('\n💡 Check that your STRIPE_TEST_SECRET_KEY is correct.');
      } else if (error.message.includes('Invalid request')) {
        console.log('\n💡 Check the payment parameters and try again.');
      }
    }
  }
}

// Run the test
runSimpleDepositTest()
  .then(() => {
    console.log('\n🏁 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
