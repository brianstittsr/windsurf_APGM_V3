import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getStripeSecretKey, getStripeWebhookSecret, getStripeModeDescription } from '@/lib/stripe-config';
import { InvoiceEmailService } from '@/services/invoiceEmailService';
import { calculateStripeFee } from '@/lib/stripe-fees';

const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2025-07-30.basil',
});

const endpointSecret = getStripeWebhookSecret();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  console.log(`🔔 Webhook received in ${getStripeModeDescription()} mode: ${event.type}`);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`💳 Payment succeeded in ${getStripeModeDescription()} mode:`, paymentIntent.id);
      
      // Send invoice email as backup (in case client-side failed)
      try {
        // Check if this is a deposit payment (amount matches our deposit + fee structure)
        const depositAmount = 200; // Fixed $200 deposit
        const stripeFee = calculateStripeFee(depositAmount);
        const expectedAmount = Math.round((depositAmount + stripeFee) * 100); // Convert to cents
        
        if (paymentIntent.amount === expectedAmount) {
          console.log('🧾 Detected deposit payment, preparing invoice...');
          
          // Note: In a real implementation, you would retrieve customer and service details
          // from your database using the payment intent metadata or customer ID
          // For now, we'll log that invoice processing should happen here
          
          console.log('📧 Invoice processing available for both test and live modes');
          console.log('💡 To enable: Add customer/service data retrieval from database');
          
          // Example of what the invoice data structure would look like:
          /*
          const invoiceData = {
            invoiceNumber: InvoiceEmailService.generateInvoiceNumber(),
            clientName: 'Retrieved from database',
            clientEmail: 'Retrieved from database', 
            serviceName: 'Retrieved from database',
            servicePrice: 600, // Retrieved from database
            tax: 46.50, // Calculated
            processingFee: stripeFee,
            total: 652.60, // Calculated
            depositPaid: depositAmount + stripeFee,
            remainingBalance: 446.50, // Calculated
            appointmentDate: 'Retrieved from database',
            appointmentTime: 'Retrieved from database',
            businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'A Pretty Girl Matter',
            businessPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(919) 441-0932',
            businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
            businessAddress: '123 Beauty Lane, Raleigh, NC 27601',
            paymentIntentId: paymentIntent.id
          };
          
          await InvoiceEmailService.sendInvoiceEmail(invoiceData);
          */
        }
      } catch (error) {
        console.error('Error processing invoice in webhook:', error);
        // Don't fail the webhook if invoice processing fails
      }
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      
      // Handle failed payment
      // 1. Log the failure
      // 2. Notify administrators
      // 3. Update appointment status if needed
      
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
