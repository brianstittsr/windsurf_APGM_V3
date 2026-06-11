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
 * GHL Webhook Handler for Contact Events
 *
 * Triggered when a new contact is created in GoHighLevel.
 * Creates a matching Stripe customer and writes the Stripe ID
 * back to the GHL contact for cross-platform reporting.
 *
 * Setup in GHL:
 * 1. Go to Settings → Integrations → Webhooks
 * 2. Create webhook for "Contact" events
 * 3. URL: https://www.aprettygirlmatter.com/api/webhooks/ghl-contact
 * 4. Select event: contact.create
 *
 * Required GHL custom field: "stripe_customer_id" (text field)
 * Create it at: Settings → Custom Fields → Add Field
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const eventType: string = payload.type || payload.event || '';
    const contact = payload.contact || payload;

    console.log('[ghl-contact-webhook] Event type:', eventType);
    console.log('[ghl-contact-webhook] Contact ID:', contact.id);

    // Only process contact creation events
    if (eventType && !['contact.create', 'ContactCreate', 'contact.created'].includes(eventType)) {
      console.log('[ghl-contact-webhook] Ignoring non-create event:', eventType);
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    if (!contact.id) {
      return NextResponse.json({ error: 'No contact ID in payload' }, { status: 400 });
    }

    // Check if this contact was already synced (idempotency)
    const existingSync = await db
      .collection('ghl-stripe-sync')
      .doc(contact.id)
      .get();

    if (existingSync.exists) {
      const data = existingSync.data();
      console.log('[ghl-contact-webhook] Contact already synced, Stripe ID:', data?.stripeCustomerId);
      return NextResponse.json({
        success: true,
        message: 'Already synced',
        stripeCustomerId: data?.stripeCustomerId,
      });
    }

    // Build Stripe customer data from GHL contact
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
      contact.name ||
      contact.email ||
      'Unknown';

    const stripeCustomerData: Stripe.CustomerCreateParams = {
      email: contact.email || undefined,
      name: fullName,
      phone: contact.phone || undefined,
      metadata: {
        ghlContactId: contact.id,
        ghlLocationId: contact.locationId || '',
        source: 'ghl_webhook',
        createdVia: 'ghl_contact_sync',
      },
    };

    if (contact.address1 || contact.city || contact.state || contact.postalCode) {
      stripeCustomerData.address = {
        line1: contact.address1 || '',
        city: contact.city || '',
        state: contact.state || '',
        postal_code: contact.postalCode || '',
        country: contact.country || 'US',
      };
    }

    // Create Stripe customer
    console.log('[ghl-contact-webhook] Creating Stripe customer for:', fullName);
    const stripeCustomer = await stripe.customers.create(stripeCustomerData);
    console.log('[ghl-contact-webhook] Stripe customer created:', stripeCustomer.id);

    // Write Stripe ID back to GHL contact
    const apiKey = await getGHLApiKey();
    await writeStripeIdToGHLContact(contact.id, stripeCustomer.id, apiKey);

    // Store the sync record in Firestore for auditing and reporting
    await db.collection('ghl-stripe-sync').doc(contact.id).set({
      ghlContactId: contact.id,
      stripeCustomerId: stripeCustomer.id,
      contactName: fullName,
      contactEmail: contact.email || '',
      contactPhone: contact.phone || '',
      ghlLocationId: contact.locationId || '',
      syncedAt: FieldValue.serverTimestamp(),
      status: 'synced',
    });

    console.log('[ghl-contact-webhook] Sync record saved to Firestore');

    return NextResponse.json({
      success: true,
      ghlContactId: contact.id,
      stripeCustomerId: stripeCustomer.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ghl-contact-webhook] Error:', error);

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Update GHL contact with the Stripe customer ID.
 * Tries custom field update first, then falls back to a contact note.
 */
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

  // Step 1 – try to find the "stripe_customer_id" custom field key
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
      if (match) {
        stripeFieldKey = match.fieldKey;
        console.log('[ghl-contact-webhook] Found Stripe custom field key:', stripeFieldKey);
      }
    }
  } catch (err) {
    console.warn('[ghl-contact-webhook] Could not fetch custom fields:', err);
  }

  // Step 2 – update the contact (custom field if found, always include in customField map)
  const updateBody: Record<string, unknown> = {};

  if (stripeFieldKey) {
    updateBody.customFields = [{ key: stripeFieldKey, field_value: stripeCustomerId }];
  } else {
    // Use a well-known key name; GHL will create it if the field exists with this key
    updateBody.customFields = [{ key: 'contact.stripe_customer_id', field_value: stripeCustomerId }];
  }

  const updateRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contactId}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateBody),
    }
  );

  if (updateRes.ok) {
    console.log('[ghl-contact-webhook] Stripe ID written to GHL contact via custom field');
    return;
  }

  const updateError = await updateRes.text();
  console.warn(
    '[ghl-contact-webhook] Custom field update failed, adding note as fallback:',
    updateError
  );

  // Step 3 – fallback: add a note on the contact with the Stripe ID
  const noteRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        body: `Stripe Customer ID: ${stripeCustomerId}`,
        userId: 'system',
      }),
    }
  );

  if (noteRes.ok) {
    console.log('[ghl-contact-webhook] Stripe ID written to GHL contact as note (fallback)');
  } else {
    const noteError = await noteRes.text();
    console.error('[ghl-contact-webhook] Note fallback also failed:', noteError);
  }
}

async function getGHLApiKey(): Promise<string> {
  try {
    const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
    if (!settingsSnapshot.empty) {
      const data = settingsSnapshot.docs[0].data();
      if (data?.apiKey) return data.apiKey;
    }

    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      if (data?.apiKey) return data.apiKey;
    }
  } catch (error) {
    console.error('[ghl-contact-webhook] Error fetching GHL API key:', error);
  }
  return process.env.GHL_API_KEY || '';
}
