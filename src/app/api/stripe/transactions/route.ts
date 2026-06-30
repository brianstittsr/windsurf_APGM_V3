import { NextRequest, NextResponse } from 'next/server';

async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch {
    return null;
  }
}

/**
 * GET /api/stripe/transactions
 *
 * Returns tap-to-pay transactions from Firebase using Admin SDK
 * (bypasses Firestore security rules for admin UI use).
 *
 * Query params:
 *   limit  — max results (default 50)
 *   userId — optional filter by firebaseUserId
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const userId = searchParams.get('userId');

    const db = await getFirebaseDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });

    let query = db.collection('stripe-tap-transactions')
      .orderBy('createdAt', 'desc')
      .limit(limitParam);

    if (userId) {
      query = db.collection('stripe-tap-transactions')
        .where('firebaseUserId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitParam) as any;
    }

    const snap = await query.get();

    const transactions = snap.docs.map(doc => {
      const data = doc.data();
      return {
        paymentIntentId: doc.id,
        firebaseUserId: data.firebaseUserId || null,
        stripeCustomerId: data.stripeCustomerId || null,
        procedureType: data.procedureType || '',
        bookingId: data.bookingId || null,
        amountCents: data.amountCents || 0,
        amountReceived: data.amountReceived || null,
        currency: data.currency || 'usd',
        status: data.status || 'pending',
        notes: data.notes || null,
        paidAt: data.paidAt ? { seconds: data.paidAt._seconds || data.paidAt.seconds } : null,
        createdAt: data.createdAt ? { seconds: data.createdAt._seconds || data.createdAt.seconds || Math.floor(new Date(data.createdAt).getTime() / 1000) } : null,
      };
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching tap transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    );
  }
}
