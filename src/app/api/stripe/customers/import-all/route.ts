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
 * POST /api/stripe/customers/import-all
 *
 * Bulk-imports all Firebase users (role='client' OR all non-admin users)
 * into Stripe as Customers, writing stripeCustomerId back to each Firebase doc.
 *
 * Returns per-user results so the UI can show progress.
 *
 * Body (optional): { roleFilter?: 'client' | 'all' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roleFilter: string = body.roleFilter || 'client';

    const stripe = getStripe();
    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    // Fetch users from Firebase
    let usersQuery = db.collection('users');
    const snapshot = roleFilter === 'all'
      ? await usersQuery.get()
      : await usersQuery.where('role', '==', roleFilter).get();

    const results: Array<{
      userId: string;
      name: string;
      email: string;
      status: 'created' | 'updated' | 'skipped' | 'error';
      stripeCustomerId?: string;
      error?: string;
    }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const profile = data.profile || {};
      const firstName = profile.firstName || data.firstName || '';
      const lastName = profile.lastName || data.lastName || '';
      const email = profile.email || data.email || '';
      const phone = profile.phone || data.phone || '';
      const fullName = `${firstName} ${lastName}`.trim() || email || doc.id;

      // Skip admins
      if (data.role === 'admin') {
        results.push({ userId: doc.id, name: fullName, email, status: 'skipped' });
        continue;
      }

      // Skip users without an email — Stripe strongly recommends email
      if (!email) {
        results.push({ userId: doc.id, name: fullName, email: '', status: 'skipped', error: 'No email address' });
        continue;
      }

      try {
        let stripeCustomerId: string = data.stripeCustomerId || '';
        let status: 'created' | 'updated' = 'created';

        if (stripeCustomerId) {
          // Update existing
          await stripe.customers.update(stripeCustomerId, {
            name: fullName,
            email,
            phone: phone || undefined,
            metadata: { firebaseUserId: doc.id, role: data.role || 'client' },
          });
          status = 'updated';
        } else {
          // Search for existing customer in Stripe by email first (avoid duplicates)
          const existing = await stripe.customers.list({ email, limit: 1 });
          if (existing.data.length > 0) {
            stripeCustomerId = existing.data[0].id;
            // Update metadata to ensure Firebase link
            await stripe.customers.update(stripeCustomerId, {
              metadata: { firebaseUserId: doc.id, role: data.role || 'client' },
            });
            status = 'updated';
          } else {
            const customer = await stripe.customers.create({
              name: fullName,
              email,
              phone: phone || undefined,
              metadata: { firebaseUserId: doc.id, role: data.role || 'client' },
            });
            stripeCustomerId = customer.id;
          }
        }

        // Write Stripe ID back to Firebase
        await db.collection('users').doc(doc.id).update({
          stripeCustomerId,
          stripeSyncStatus: 'synced',
          stripeLastSyncAt: new Date(),
        });

        results.push({ userId: doc.id, name: fullName, email, status, stripeCustomerId });
      } catch (err) {
        console.error(`Error syncing user ${doc.id}:`, err);
        results.push({
          userId: doc.id, name: fullName, email, status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const summary = {
      total: results.length,
      created: results.filter(r => r.status === 'created').length,
      updated: results.filter(r => r.status === 'updated').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    };

    return NextResponse.json({ success: true, summary, results });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
