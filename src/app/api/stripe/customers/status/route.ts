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
 * GET /api/stripe/customers/status
 *
 * Compares Firebase users against Stripe customers and returns a full
 * sync status report — which are synced, which are missing, which have
 * data mismatches (name/email changed in Firebase since last sync).
 */
export async function GET(_req: NextRequest) {
  try {
    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    const stripe = getStripe();

    // 1. Fetch all non-admin Firebase users
    const snapshot = await db.collection('users').get();

    const clients: Array<{
      userId: string;
      displayName: string;
      email: string;
      phone: string;
      stripeCustomerId: string | null;
      stripeSyncStatus: string | null;
      stripeLastSyncAt: string | null;
      stripeName?: string;
      stripeEmail?: string;
      nameMismatch?: boolean;
      emailMismatch?: boolean;
      syncState: 'synced' | 'not_synced' | 'mismatch' | 'skipped';
    }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.role === 'admin') continue;

      const profile = data.profile || {};
      const firstName = profile.firstName || data.firstName || '';
      const lastName = profile.lastName || data.lastName || '';
      const email = profile.email || data.email || '';
      const phone = profile.phone || data.phone || '';
      const fullName = `${firstName} ${lastName}`.trim() || email;
      const stripeCustomerId: string | null = data.stripeCustomerId || null;

      if (!email) {
        clients.push({
          userId: doc.id, displayName: fullName, email, phone,
          stripeCustomerId: null, stripeSyncStatus: null, stripeLastSyncAt: null,
          syncState: 'skipped',
        });
        continue;
      }

      if (!stripeCustomerId) {
        clients.push({
          userId: doc.id, displayName: fullName, email, phone,
          stripeCustomerId: null, stripeSyncStatus: data.stripeSyncStatus || null,
          stripeLastSyncAt: data.stripeLastSyncAt ? new Date(data.stripeLastSyncAt._seconds * 1000).toISOString() : null,
          syncState: 'not_synced',
        });
        continue;
      }

      // Fetch Stripe customer to detect mismatches
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
        if (customer.deleted) {
          clients.push({
            userId: doc.id, displayName: fullName, email, phone,
            stripeCustomerId, stripeSyncStatus: 'deleted_in_stripe',
            stripeLastSyncAt: null,
            syncState: 'not_synced',
          });
          continue;
        }

        const nameMismatch = customer.name ? customer.name !== fullName : false;
        const emailMismatch = customer.email ? customer.email !== email : false;

        clients.push({
          userId: doc.id, displayName: fullName, email, phone,
          stripeCustomerId,
          stripeSyncStatus: data.stripeSyncStatus || 'synced',
          stripeLastSyncAt: data.stripeLastSyncAt ? new Date(data.stripeLastSyncAt._seconds * 1000).toISOString() : null,
          stripeName: customer.name || undefined,
          stripeEmail: customer.email || undefined,
          nameMismatch,
          emailMismatch,
          syncState: nameMismatch || emailMismatch ? 'mismatch' : 'synced',
        });
      } catch {
        clients.push({
          userId: doc.id, displayName: fullName, email, phone,
          stripeCustomerId, stripeSyncStatus: 'error',
          stripeLastSyncAt: null,
          syncState: 'not_synced',
        });
      }
    }

    const summary = {
      total: clients.length,
      synced: clients.filter(c => c.syncState === 'synced').length,
      notSynced: clients.filter(c => c.syncState === 'not_synced').length,
      mismatch: clients.filter(c => c.syncState === 'mismatch').length,
      skipped: clients.filter(c => c.syncState === 'skipped').length,
    };

    return NextResponse.json({ success: true, summary, clients });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
