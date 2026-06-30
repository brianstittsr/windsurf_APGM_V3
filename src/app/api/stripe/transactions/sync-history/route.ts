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
 * Pulls real PaymentIntent history from Stripe for all Firebase users
 * that have a stripeCustomerId, then writes each charge into:
 *   - stripe-tap-transactions/<paymentIntentId>
 *   - users/<firebaseUserId>/transactions/<paymentIntentId>
 *   - updates users/<firebaseUserId>.stripeTotalSpent / stripeTransactionCount
 *
 * Body (optional): { userId?: string }  — limit to one user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const singleUserId: string | undefined = body.userId;

    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    const stripe = getStripe();

    // Fetch all Firebase users that have a Stripe customer ID
    let usersSnap;
    if (singleUserId) {
      const singleDoc = await db.collection('users').doc(singleUserId).get();
      usersSnap = singleDoc.exists && singleDoc.data() ? [singleDoc] : [];
    } else {
      const snap = await db.collection('users').where('stripeCustomerId', '!=', '').get();
      usersSnap = snap.docs;
    }

    const results: Array<{
      userId: string;
      name: string;
      stripeCustomerId: string;
      transactionsSynced: number;
      totalSpentCents: number;
      status: 'ok' | 'error';
      error?: string;
    }> = [];

    for (const userDoc of usersSnap) {
      const data = userDoc.data();
      if (!data) continue;
      const stripeCustomerId: string = data.stripeCustomerId || '';
      if (!stripeCustomerId) continue;

      const profile = (data.profile as Record<string, string>) || {};
      const firstName: string = profile.firstName || data.firstName || '';
      const lastName: string = profile.lastName || data.lastName || '';
      const displayName: string = `${firstName} ${lastName}`.trim() || data.email || userDoc.id;

      try {
        // Fetch all PaymentIntents for this customer from Stripe
        const paymentIntents = await stripe.paymentIntents.list({
          customer: stripeCustomerId,
          limit: 100,
        });

        let totalSpentCents = 0;
        let transactionsSynced = 0;

        for (const pi of paymentIntents.data) {
          // Only write succeeded payments
          if (pi.status !== 'succeeded') continue;

          const procedureType = pi.metadata?.procedureType || pi.description || 'PMU Appointment';
          const source = pi.metadata?.source || 'stripe';
          const firebaseUserId = pi.metadata?.firebaseUserId || userDoc.id;
          const bookingId = pi.metadata?.bookingId || null;

          const createdDate = new Date(pi.created * 1000);

          const txPayload = {
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

          // Write to primary collection
          await db.collection('stripe-tap-transactions').doc(pi.id).set(txPayload, { merge: true });

          // Write to per-user sub-collection
          await db
            .collection('users')
            .doc(userDoc.id)
            .collection('transactions')
            .doc(pi.id)
            .set(txPayload, { merge: true });

          totalSpentCents += pi.amount_received;
          transactionsSynced++;
        }

        // Update user aggregate totals
        if (transactionsSynced > 0) {
          await db.collection('users').doc(userDoc.id).update({
            stripeTotalSpent: totalSpentCents,
            stripeTransactionCount: transactionsSynced,
            stripeLastTransactionAt: new Date(),
            stripeSyncStatus: 'synced',
          });
        }

        results.push({
          userId: userDoc.id,
          name: displayName,
          stripeCustomerId,
          transactionsSynced,
          totalSpentCents,
          status: 'ok',
        });
      } catch (err) {
        results.push({
          userId: userDoc.id,
          name: displayName,
          stripeCustomerId,
          transactionsSynced: 0,
          totalSpentCents: 0,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const summary = {
      usersProcessed: results.length,
      totalTransactionsSynced: results.reduce((s, r) => s + r.transactionsSynced, 0),
      totalRevenueCents: results.reduce((s, r) => s + r.totalSpentCents, 0),
      errors: results.filter(r => r.status === 'error').length,
    };

    return NextResponse.json({ success: true, summary, results });
  } catch (error) {
    console.error('Error syncing transaction history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
