import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Lazy-load Firebase Admin to avoid Turbopack symlink issues on Windows.
 */
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
 * POST /api/stripe/customers/sync
 *
 * Syncs a single Firebase user to Stripe.
 * - If the user already has a stripeCustomerId, updates the Stripe record.
 * - Otherwise creates a new Stripe Customer and writes the ID back to Firebase.
 *
 * Body: { userId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const stripe = getStripe();
    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const data = userDoc.data()!;
    const profile = data.profile || {};

    const firstName = profile.firstName || data.firstName || '';
    const lastName = profile.lastName || data.lastName || '';
    const email = profile.email || data.email || '';
    const phone = profile.phone || data.phone || '';
    const fullName = `${firstName} ${lastName}`.trim() || email;

    let stripeCustomerId: string = data.stripeCustomerId || '';
    let action: 'created' | 'updated' = 'created';

    if (stripeCustomerId) {
      // Update existing Stripe customer
      await stripe.customers.update(stripeCustomerId, {
        name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        metadata: {
          firebaseUserId: userId,
          role: data.role || 'client',
        },
      });
      action = 'updated';
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        metadata: {
          firebaseUserId: userId,
          role: data.role || 'client',
        },
      });
      stripeCustomerId = customer.id;
    }

    // Write Stripe customer ID back to Firebase
    await db.collection('users').doc(userId).update({
      stripeCustomerId,
      stripeSyncStatus: 'synced',
      stripeLastSyncAt: new Date(),
    });

    return NextResponse.json({ success: true, action, stripeCustomerId });
  } catch (error) {
    console.error('Error syncing user to Stripe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/customers/sync?userId=<id>
 * Returns the Stripe customer info for a Firebase user.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const data = userDoc.data()!;
    const stripeCustomerId = data.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json({ synced: false, stripeCustomerId: null });
    }

    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    return NextResponse.json({ synced: true, stripeCustomerId, customer });
  } catch (error) {
    console.error('Error fetching Stripe customer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    );
  }
}
