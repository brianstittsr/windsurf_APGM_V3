import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { workflowEngine } from '@/services/bmad-workflows';

async function getFirebaseAdminDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch {
    return null;
  }
}

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

  // Handle tap-to-pay (Terminal) payment completions
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    if (pi.metadata?.source === 'tap-to-pay') {
      await handleTapPaymentSucceeded(pi);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    if (pi.metadata?.source === 'tap-to-pay') {
      await handleTapPaymentFailed(pi);
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

/**
 * Handles a succeeded tap-to-pay PaymentIntent.
 * Writes/updates the transaction in:
 *   - stripe-tap-transactions/<paymentIntentId>  (primary record)
 *   - users/<firebaseUserId>/transactions/<paymentIntentId>  (per-user history)
 *   - bookings/<bookingId>  (marks booking as paid, if bookingId present)
 */
async function handleTapPaymentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  try {
    const { firebaseUserId, procedureType, bookingId } = pi.metadata || {};
    const now = Timestamp.now();
    const paidAt = Timestamp.fromDate(new Date(pi.created * 1000));

    const transactionPayload = {
      paymentIntentId: pi.id,
      firebaseUserId: firebaseUserId || null,
      stripeCustomerId: typeof pi.customer === 'string' ? pi.customer : pi.customer?.id || null,
      procedureType: procedureType || 'PMU Appointment',
      bookingId: bookingId || null,
      amountCents: pi.amount,
      amountReceived: pi.amount_received,
      currency: pi.currency,
      status: 'succeeded',
      paymentMethod: pi.payment_method_types?.[0] || 'card_present',
      metadata: pi.metadata,
      paidAt,
      updatedAt: now,
    };

    // 1. Update primary tap-transaction record (Admin SDK preferred for server-side)
    const adminDb = await getFirebaseAdminDb();
    if (adminDb) {
      await adminDb.collection('stripe-tap-transactions').doc(pi.id).set(transactionPayload, { merge: true });

      // 2. Write to per-user transaction sub-collection
      if (firebaseUserId) {
        await adminDb
          .collection('users')
          .doc(firebaseUserId)
          .collection('transactions')
          .doc(pi.id)
          .set(transactionPayload, { merge: true });

        // 3. Update user's aggregate spend totals
        const userDoc = await adminDb.collection('users').doc(firebaseUserId).get();
        if (userDoc.exists) {
          const existing = userDoc.data() || {};
          const prevSpent: number = existing.stripeTotalSpent || 0;
          const prevCount: number = existing.stripeTransactionCount || 0;
          await adminDb.collection('users').doc(firebaseUserId).update({
            stripeTotalSpent: prevSpent + pi.amount_received,
            stripeTransactionCount: prevCount + 1,
            stripeLastTransactionAt: paidAt,
          });
        }
      }
    } else {
      // Fallback: client-side Firebase SDK
      const db = getDb();
      await setDoc(doc(db, 'stripe-tap-transactions', pi.id), transactionPayload, { merge: true });
      if (firebaseUserId) {
        await setDoc(
          doc(db, 'users', firebaseUserId, 'transactions', pi.id),
          transactionPayload,
          { merge: true }
        );
      }
    }

    // 4. If this payment is tied to a booking, mark it paid
    if (bookingId) {
      try {
        const db = getDb();
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingDoc = await getDoc(bookingRef);
        if (bookingDoc.exists()) {
          await updateDoc(bookingRef, {
            status: 'completed',
            pricePaid: pi.amount_received / 100,
            paymentConfirmedAt: now,
            stripePaymentIntentId: pi.id,
            stripeCustomerId: typeof pi.customer === 'string' ? pi.customer : null,
            procedureType: procedureType || bookingDoc.data()?.serviceName,
          });
        }
      } catch (bookingErr) {
        console.warn('Could not update booking after tap payment:', bookingErr);
      }
    }

    // 5. Trigger BMAD payment_received workflow
    try {
      if (firebaseUserId) {
        let clientName = 'Client';
        let clientEmail = '';
        const db = getDb();
        const userSnap = await getDoc(doc(db, 'users', firebaseUserId));
        if (userSnap.exists()) {
          const ud = userSnap.data();
          clientName = ud.displayName || `${ud.profile?.firstName || ''} ${ud.profile?.lastName || ''}`.trim() || clientName;
          clientEmail = ud.email || ud.profile?.email || '';
        }
        await workflowEngine.executeWorkflow({
          type: 'payment_received',
          data: {
            name: clientName,
            email: clientEmail,
            serviceName: procedureType || 'PMU Appointment',
            price: pi.amount_received / 100,
            bookingId: bookingId || '',
          },
        });
      }
    } catch (wfErr) {
      console.warn('Non-fatal: BMAD workflow error after tap payment:', wfErr);
    }

    console.log(`✅ Tap payment succeeded: ${pi.id} | user: ${firebaseUserId} | procedure: ${procedureType} | $${pi.amount_received / 100}`);
  } catch (error) {
    console.error('Error handling tap payment succeeded:', error);
  }
}

async function handleTapPaymentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  try {
    const adminDb = await getFirebaseAdminDb();
    const failedPayload = {
      status: 'failed',
      failureMessage: pi.last_payment_error?.message || 'Payment failed',
      failureCode: pi.last_payment_error?.code || null,
      updatedAt: new Date(),
    };

    if (adminDb) {
      await adminDb.collection('stripe-tap-transactions').doc(pi.id).set(failedPayload, { merge: true });
    } else {
      const db = getDb();
      await setDoc(doc(db, 'stripe-tap-transactions', pi.id), failedPayload, { merge: true });
    }

    console.warn(`⚠️ Tap payment failed: ${pi.id} — ${failedPayload.failureMessage}`);
  } catch (error) {
    console.error('Error handling tap payment failed:', error);
  }
}
