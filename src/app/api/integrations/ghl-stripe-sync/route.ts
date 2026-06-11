import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    } as any),
  });
}

const db = getFirestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16' as any,
});

/**
 * POST /api/integrations/ghl-stripe-sync
 *
 * Manual / bulk sync endpoint to create Stripe customers for GHL contacts
 * that don't already have a Stripe ID.
 *
 * Body (optional):
 *   { "contactId": "abc123" }   – sync a single contact
 *   {}                          – sync all contacts (paginated, max 100)
 *
 * GET /api/integrations/ghl-stripe-sync
 *   Returns the current sync log from Firestore.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { contactId } = body as { contactId?: string };

    const apiKey = await getGHLApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'GHL API key not configured' }, { status: 500 });
    }

    if (contactId) {
      // Single contact sync
      const result = await syncSingleContact(contactId, apiKey);
      return NextResponse.json(result);
    }

    // Bulk sync – fetch GHL contacts and process those without Stripe IDs
    const results = await bulkSync(apiKey);
    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ghl-stripe-sync] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await db
      .collection('ghl-stripe-sync')
      .orderBy('syncedAt', 'desc')
      .limit(100)
      .get();

    const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ records, total: records.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function syncSingleContact(
  contactId: string,
  apiKey: string
): Promise<{ success: boolean; contactId: string; stripeCustomerId?: string; error?: string }> {
  try {
    // Idempotency check
    const existing = await db.collection('ghl-stripe-sync').doc(contactId).get();
    if (existing.exists) {
      return {
        success: true,
        contactId,
        stripeCustomerId: existing.data()?.stripeCustomerId,
      };
    }

    // Fetch contact from GHL
    const res = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: '2021-07-28',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`GHL contact fetch failed: ${res.status}`);
    }

    const data = await res.json();
    const contact = data.contact || data;

    const fullName =
      [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
      contact.name ||
      contact.email ||
      'Unknown';

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: contact.email || undefined,
      name: fullName,
      phone: contact.phone || undefined,
      metadata: {
        ghlContactId: contact.id,
        ghlLocationId: contact.locationId || '',
        source: 'manual_sync',
      },
    });

    // Write back Stripe ID to GHL
    await writeStripeIdToGHLContact(contact.id, stripeCustomer.id, apiKey);

    // Log to Firestore
    await db.collection('ghl-stripe-sync').doc(contactId).set({
      ghlContactId: contactId,
      stripeCustomerId: stripeCustomer.id,
      contactName: fullName,
      contactEmail: contact.email || '',
      contactPhone: contact.phone || '',
      ghlLocationId: contact.locationId || '',
      syncedAt: FieldValue.serverTimestamp(),
      status: 'synced',
    });

    return { success: true, contactId, stripeCustomerId: stripeCustomer.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ghl-stripe-sync] Single contact error:', error);

    await db.collection('ghl-stripe-sync').doc(contactId).set(
      {
        ghlContactId: contactId,
        status: 'error',
        error: message,
        syncedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: false, contactId, error: message };
  }
}

async function bulkSync(
  apiKey: string
): Promise<{ synced: number; skipped: number; errors: number; results: unknown[] }> {
  const locationId = await getGHLLocationId(apiKey);
  if (!locationId) {
    throw new Error('GHL Location ID not configured');
  }

  // Fetch up to 100 contacts from GHL
  const res = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: '2021-07-28',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GHL contacts fetch failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const contacts: Array<{ id: string }> = data.contacts || [];

  let synced = 0;
  let skipped = 0;
  let errors = 0;
  const results: unknown[] = [];

  for (const c of contacts) {
    // Check existing sync record
    const existing = await db.collection('ghl-stripe-sync').doc(c.id).get();
    if (existing.exists && existing.data()?.status === 'synced') {
      skipped++;
      continue;
    }

    const result = await syncSingleContact(c.id, apiKey);
    results.push(result);
    if (result.success) synced++;
    else errors++;
  }

  return { synced, skipped, errors, results };
}

async function writeStripeIdToGHLContact(
  contactId: string,
  stripeCustomerId: string,
  apiKey: string
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  };

  // Try to find a Stripe custom field key
  let stripeFieldKey: string | null = null;
  try {
    const fieldsRes = await fetch(
      'https://services.leadconnectorhq.com/contacts/custom-fields',
      { headers }
    );
    if (fieldsRes.ok) {
      const fieldsData = await fieldsRes.json();
      const fields: Array<{ id: string; name: string; fieldKey: string }> =
        fieldsData.customFields || fieldsData.fields || [];
      const match = fields.find(
        (f) =>
          f.fieldKey?.toLowerCase().includes('stripe') ||
          f.name?.toLowerCase().includes('stripe')
      );
      if (match) stripeFieldKey = match.fieldKey;
    }
  } catch {
    // non-fatal
  }

  const updateBody = {
    customFields: [
      {
        key: stripeFieldKey || 'contact.stripe_customer_id',
        field_value: stripeCustomerId,
      },
    ],
  };

  const updateRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contactId}`,
    { method: 'PUT', headers, body: JSON.stringify(updateBody) }
  );

  if (!updateRes.ok) {
    // Fallback: add a note
    await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        body: `Stripe Customer ID: ${stripeCustomerId}`,
        userId: 'system',
      }),
    });
  }
}

async function getGHLApiKey(): Promise<string> {
  try {
    const snap = await db.collection('crmSettings').limit(1).get();
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data?.apiKey) return data.apiKey;
    }
    const doc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.apiKey) return data.apiKey;
    }
  } catch {
    // fall through
  }
  return process.env.GHL_API_KEY || '';
}

async function getGHLLocationId(apiKey: string): Promise<string> {
  try {
    const snap = await db.collection('crmSettings').limit(1).get();
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data?.locationId) return data.locationId;
    }
    const doc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.locationId) return data.locationId;
    }
  } catch {
    // fall through
  }
  if (process.env.GHL_LOCATION_ID) return process.env.GHL_LOCATION_ID;

  // Last resort: fetch from GHL API
  try {
    const res = await fetch('https://services.leadconnectorhq.com/locations/search', {
      headers: { Authorization: `Bearer ${apiKey}`, Version: '2021-07-28' },
    });
    if (res.ok) {
      const data = await res.json();
      return data.locations?.[0]?.id || '';
    }
  } catch {
    // non-fatal
  }
  return '';
}
