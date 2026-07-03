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
  return new Stripe(key, { apiVersion: '2023-10-16' as any });
}

/**
 * POST /api/stripe/transactions/sync-history
 *
 * Pulls ALL PaymentIntents directly from Stripe (paginated, up to 500),
 * then writes each succeeded payment into Firebase:
 *   - stripe-tap-transactions/<paymentIntentId>
 *   - users/<firebaseUserId>/transactions/<paymentIntentId>  (if user matched)
 *   - updates user aggregate spend totals (if user matched)
 *
 * Matches back to Firebase users via:
 *   1. pi.metadata.firebaseUserId  (set by our tap checkout route)
 *   2. Stripe customer email → Firebase user lookup
 */
export async function POST(_req: NextRequest) {
  try {
    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    const stripe = getStripe();

    // Build email→firebaseUserId lookup map from Firebase
    const allUsersSnap = await db.collection('users').get();
    const emailToUid: Record<string, string> = {};
    const customerIdToUid: Record<string, string> = {};
    for (const doc of allUsersSnap.docs) {
      const d = doc.data();
      const email: string = d.profile?.email || d.email || '';
      const stripeId: string = d.stripeCustomerId || '';
      if (email) emailToUid[email.toLowerCase()] = doc.id;
      if (stripeId) customerIdToUid[stripeId] = doc.id;
    }

    // Paginate through ALL PaymentIntents in Stripe account
    const allPaymentIntents: Stripe.PaymentIntent[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const params: Stripe.PaymentIntentListParams = { limit: 100 };
      if (startingAfter) params.starting_after = startingAfter;

      const page = await stripe.paymentIntents.list(params);
      allPaymentIntents.push(...page.data);
      hasMore = page.has_more;
      if (page.data.length > 0) {
        startingAfter = page.data[page.data.length - 1].id;
      }
      // Safety cap at 500 to avoid very long requests
      if (allPaymentIntents.length >= 500) break;
    }

    // Track spend per Firebase user for aggregate update
    const userSpend: Record<string, { total: number; count: number; lastDate: Date }> = {};

    let totalTransactionsSynced = 0;
    let totalRevenueCents = 0;

    for (const pi of allPaymentIntents) {
      if (pi.status !== 'succeeded') continue;

      const stripeCustomerId =
        typeof pi.customer === 'string' ? pi.customer : (pi.customer as Stripe.Customer)?.id || null;

      // Resolve firebaseUserId
      let firebaseUserId: string | null = pi.metadata?.firebaseUserId || null;
      if (!firebaseUserId && stripeCustomerId) {
        firebaseUserId = customerIdToUid[stripeCustomerId] || null;
      }
      if (!firebaseUserId && stripeCustomerId) {
        // Look up customer email from Stripe if not in our map
        try {
          const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
          if (customer.email) {
            firebaseUserId = emailToUid[customer.email.toLowerCase()] || null;
          }
        } catch {
          // ignore individual lookup failures
        }
      }

      const procedureType = pi.metadata?.procedureType || pi.description || 'PMU Service';
      const source = pi.metadata?.source || 'stripe';
      const bookingId = pi.metadata?.bookingId || null;
      const createdDate = new Date(pi.created * 1000);

      const txPayload: Record<string, unknown> = {
        paymentIntentId: pi.id,
        firebaseUserId,
        stripeCustomerId,
        procedureType,
        bookingId,
        amountCents: pi.amount,
        amountReceived: pi.amount_received,
        currency: pi.currency,
        status: 'succeeded',
        source,
        paymentMethod: pi.payment_method_types?.[0] || 'card',
        metadata: pi.metadata || {},
        paidAt: createdDate,
        createdAt: createdDate,
        importedAt: new Date(),
      };

      // Write to primary tap-transactions collection
      await db.collection('stripe-tap-transactions').doc(pi.id).set(txPayload, { merge: true });

      // Write to per-user sub-collection if matched
      if (firebaseUserId) {
        await db
          .collection('users')
          .doc(firebaseUserId)
          .collection('transactions')
          .doc(pi.id)
          .set(txPayload, { merge: true });

        // Accumulate spend
        if (!userSpend[firebaseUserId]) {
          userSpend[firebaseUserId] = { total: 0, count: 0, lastDate: createdDate };
        }
        userSpend[firebaseUserId].total += pi.amount_received;
        userSpend[firebaseUserId].count += 1;
        if (createdDate > userSpend[firebaseUserId].lastDate) {
          userSpend[firebaseUserId].lastDate = createdDate;
        }
      }

      totalTransactionsSynced++;
      totalRevenueCents += pi.amount_received;
    }

    // Update aggregate totals on each matched Firebase user
    for (const [uid, spend] of Object.entries(userSpend)) {
      await db.collection('users').doc(uid).update({
        stripeTotalSpent: spend.total,
        stripeTransactionCount: spend.count,
        stripeLastTransactionAt: spend.lastDate,
      });
    }

    const summary = {
      stripePaymentIntentsScanned: allPaymentIntents.length,
      usersMatched: Object.keys(userSpend).length,
      totalTransactionsSynced,
      totalRevenueCents,
    };

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error syncing transaction history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
