import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getStripeSecretKey, getStripeWebhookSecret, getStripeModeDescription } from '@/lib/stripe-config';
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
        // Note: Deposit amount is now configurable via business settings
        // This webhook would need service context to calculate exact deposit amount
        // For now, we'll process all successful payments as potential deposits
        
        console.log('🧾 Processing payment, preparing invoice...');
          
          // Note: In a real implementation, you would retrieve customer and service details
          // from your database using the payment intent metadata or customer ID
          // For now, we'll log that invoice processing should happen here
          
          console.log('📧 Invoice processing available for both test and live modes');
          console.log('💡 To enable: Add customer/service data retrieval from database');
          
          // Example of what the invoice data structure would look like:
          /*
          const invoiceData = {
            invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
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
          
          // Send via API: await fetch('/api/send-invoice', { method: 'POST', body: JSON.stringify(invoiceData) });
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
