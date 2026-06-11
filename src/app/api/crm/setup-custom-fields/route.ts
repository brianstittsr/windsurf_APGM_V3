import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

const REQUIRED_FIELDS = [
  {
    name: 'Stripe Customer ID',
    fieldKey: 'contact.stripe_customer_id',
    dataType: 'TEXT',
    placeholder: 'cus_...',
  },
];

/**
 * POST /api/crm/setup-custom-fields
 *
 * Creates the required GHL custom fields for Stripe integration.
 * Idempotent — skips fields that already exist.
 *
 * Body: { apiKey?: string, locationId?: string }
 * Both optional — falls back to Firestore crmSettings / env vars.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const apiKey = body.apiKey || (await getGHLApiKey());
    const locationId = body.locationId || (await getGHLLocationId());

    if (!apiKey) {
      return NextResponse.json({ error: 'GHL API key not configured' }, { status: 400 });
    }
    if (!locationId) {
      return NextResponse.json({ error: 'GHL Location ID not configured' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    };

    // Fetch existing custom fields
    const existingRes = await fetch(
      `https://services.leadconnectorhq.com/locations/${locationId}/customFields`,
      { headers }
    );

    let existingKeys: Set<string> = new Set();
    if (existingRes.ok) {
      const data = await existingRes.json();
      const fields: Array<{ fieldKey: string }> = data.customFields || [];
      existingKeys = new Set(fields.map((f) => f.fieldKey));
      console.log('[setup-custom-fields] Existing field keys:', [...existingKeys]);
    } else {
      console.warn('[setup-custom-fields] Could not fetch existing fields:', existingRes.status);
    }

    const results: Array<{ field: string; status: 'created' | 'exists' | 'error'; error?: string }> = [];

    for (const field of REQUIRED_FIELDS) {
      if (existingKeys.has(field.fieldKey)) {
        console.log(`[setup-custom-fields] Field already exists: ${field.fieldKey}`);
        results.push({ field: field.name, status: 'exists' });
        continue;
      }

      const createRes = await fetch(
        `https://services.leadconnectorhq.com/locations/${locationId}/customFields`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: field.name,
            fieldKey: field.fieldKey,
            dataType: field.dataType,
            placeholder: field.placeholder,
          }),
        }
      );

      if (createRes.ok) {
        console.log(`[setup-custom-fields] Created field: ${field.name}`);
        results.push({ field: field.name, status: 'created' });
      } else {
        const errText = await createRes.text();
        console.error(`[setup-custom-fields] Failed to create ${field.name}:`, errText);
        results.push({ field: field.name, status: 'error', error: errText });
      }
    }

    const allSuccess = results.every((r) => r.status !== 'error');
    return NextResponse.json({ success: allSuccess, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[setup-custom-fields] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/crm/setup-custom-fields
 * Returns the list of custom fields currently in GHL for inspection.
 */
export async function GET() {
  try {
    const apiKey = await getGHLApiKey();
    const locationId = await getGHLLocationId();

    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'GHL not configured' }, { status: 400 });
    }

    const res = await fetch(
      `https://services.leadconnectorhq.com/locations/${locationId}/customFields`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: '2021-07-28',
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `GHL error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ customFields: data.customFields || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getGHLApiKey(): Promise<string> {
  try {
    const snap = await db.collection('crmSettings').limit(1).get();
    if (!snap.empty) {
      const d = snap.docs[0].data();
      if (d?.apiKey) return d.apiKey;
    }
    const doc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (doc.exists) {
      const d = doc.data();
      if (d?.apiKey) return d.apiKey;
    }
  } catch {
    // fall through
  }
  return process.env.GHL_API_KEY || '';
}

async function getGHLLocationId(): Promise<string> {
  try {
    const snap = await db.collection('crmSettings').limit(1).get();
    if (!snap.empty) {
      const d = snap.docs[0].data();
      if (d?.locationId) return d.locationId;
    }
    const doc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (doc.exists) {
      const d = doc.data();
      if (d?.locationId) return d.locationId;
    }
  } catch {
    // fall through
  }
  return process.env.GHL_LOCATION_ID || '';
}
