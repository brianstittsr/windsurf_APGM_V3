import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch {
    return null;
  }
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2025-08-27' as any });
}

/**
 * POST /api/stripe/checkout/tap
 *
 * Creates a PaymentIntent for Stripe Terminal (Tap to Pay / Reader).
 * Links the payment to a Firebase client and procedure type in metadata.
 *
 * After successful tap, Stripe fires `payment_intent.succeeded` which our
 * webhook at /api/webhooks/stripe picks up to write the transaction to Firebase.
 *
 * Body:
 * {
 *   firebaseUserId: string;      // Firebase user doc ID
 *   stripeCustomerId?: string;   // Optional: pre-resolved Stripe customer ID
 *   amountCents: number;         // Amount in cents (e.g. 50000 = $500)
 *   procedureType: string;       // e.g. "Microblading", "Powder Brows"
 *   bookingId?: string;          // Optional: link to booking doc
 *   notes?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      firebaseUserId,
      stripeCustomerId: providedCustomerId,
      amountCents,
      procedureType,
      bookingId,
      notes,
    } = await req.json();

    if (!firebaseUserId) return NextResponse.json({ error: 'firebaseUserId required' }, { status: 400 });
    if (!amountCents || amountCents < 50) return NextResponse.json({ error: 'amountCents must be >= 50' }, { status: 400 });
    if (!procedureType) return NextResponse.json({ error: 'procedureType required' }, { status: 400 });

    const stripe = getStripe();
    const db = await getFirebaseDb();

    // Resolve Stripe customer ID
    let stripeCustomerId = providedCustomerId || '';

    if (!stripeCustomerId && db) {
      const userDoc = await db.collection('users').doc(firebaseUserId).get();
      if (userDoc.exists) {
        stripeCustomerId = userDoc.data()?.stripeCustomerId || '';
      }
    }

    // Build metadata — these are stored on the PaymentIntent and visible in Stripe Dashboard
    const metadata: Record<string, string> = {
      firebaseUserId,
      procedureType,
      business: 'A Pretty Girl Matter',
      source: 'tap-to-pay',
    };
    if (bookingId) metadata.bookingId = bookingId;
    if (notes) metadata.notes = notes.slice(0, 500); // Stripe metadata value limit

    // Create PaymentIntent configured for Terminal (card_present)
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amountCents),
      currency: 'usd',
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
      metadata,
      description: `${procedureType} — A Pretty Girl Matter`,
    };

    // Attach to Stripe Customer if available (enables payment history per customer)
    if (stripeCustomerId) {
      paymentIntentParams.customer = stripeCustomerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Record the pending intent in Firebase immediately so we can reconcile later
    if (db) {
      await db.collection('stripe-tap-transactions').doc(paymentIntent.id).set({
        paymentIntentId: paymentIntent.id,
        firebaseUserId,
        stripeCustomerId: stripeCustomerId || null,
        procedureType,
        bookingId: bookingId || null,
        amountCents,
        currency: 'usd',
        status: 'pending',
        notes: notes || null,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      stripeCustomerId: stripeCustomerId || null,
      amount: amountCents,
      currency: 'usd',
    });
  } catch (error) {
    console.error('Error creating tap PaymentIntent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PaymentIntent' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/checkout/tap?paymentIntentId=<id>
 * Fetch the current status of a tap payment.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get('paymentIntentId');
    if (!paymentIntentId) return NextResponse.json({ error: 'paymentIntentId required' }, { status: 400 });

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      paymentIntentId: pi.id,
      status: pi.status,
      amount: pi.amount,
      currency: pi.currency,
      metadata: pi.metadata,
      customer: pi.customer,
      created: pi.created,
    });
  } catch (error) {
    console.error('Error fetching PaymentIntent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    );
  }
}
