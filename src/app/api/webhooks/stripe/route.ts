import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { workflowEngine } from '@/services/bmad-workflows';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16' as any, // Using as any to bypass strict version checking
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Check if this is a quick deposit payment
    if (session.metadata?.type === 'quick-deposit' && session.metadata?.bookingId) {
      await handleDepositPaid(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleDepositPaid(session: Stripe.Checkout.Session) {
  try {
    if (!session.metadata?.bookingId) {
      console.error('No booking ID found in session metadata');
      return;
    }

    const bookingId = session.metadata.bookingId;
    
    // Get the booking details from Firestore
    const db = getDb();
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    const bookingData = bookingDoc.data();

    // Update the booking status in Firestore
    await updateDoc(bookingRef, {
      status: 'deposit_paid',
      depositPaid: true,
      paymentConfirmedAt: Timestamp.now(),
      stripePaymentIntent: session.payment_intent,
    });

    // Prepare data for the workflow
    const workflowData = {
      name: bookingData.clientName,
      email: bookingData.clientEmail,
      phone: bookingData.clientPhone || '',
      serviceName: bookingData.serviceName,
      serviceId: bookingData.serviceId,
      date: 'To be scheduled', // Will be set during full booking
      time: 'To be scheduled', // Will be set during full booking
      price: bookingData.price || 500,
      depositAmount: bookingData.depositAmount || 50,
      bookingId,
      contactId: bookingData.contactId, // For GHL integration
    };

    // Trigger the deposit_paid workflow
    await workflowEngine.executeWorkflow({
      type: 'deposit_paid',
      data: workflowData,
    });

    console.log(`✅ Successfully processed deposit payment for booking ${bookingId}`);
  } catch (error) {
    console.error('Error handling deposit paid event:', error);
    // We don't want to return an error to Stripe, as it will retry the webhook
  }
}
