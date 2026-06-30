import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

/**
 * APGM Pipeline Setup API
 * 
 * Creates the 8-stage PMU sales pipeline in GHL:
 * 
 * Stage 1: New Lead - Just came in
 * Stage 2: Contacted - VA reached out  
 * Stage 3: Engaged - Lead responded
 * Stage 4: Consultation Scheduled - Appointment booked
 * Stage 5: Consultation Completed - Consultation done
 * Stage 6: Deposit Paid - Ready for service
 * Stage 7: Procedure Scheduled - Service booked
 * Stage 8: Touch-Up Due / Annual Refresh - Long-term retention
 * 
 * Also creates:
 * - Custom fields for PMU-specific data
 * - Tags for lead sources and status
 * - Automation triggers for stage movements
 * 
 * POST /api/crm/setup-apgm-pipeline
 * GET  /api/crm/setup-apgm-pipeline (returns current setup status)
 */

// APGM Pipeline Definition
const APGM_PIPELINE = {
  name: 'APGM PMU Sales Pipeline',
  stages: [
    {
      name: 'New Lead',
      position: 0,
      description: 'Lead just came in from Facebook, Instagram, or website',
      color: '#6366f1', // Indigo
      actions: ['send_welcome_sms', 'add_to_nurture_sequence'],
    },
    {
      name: 'Contacted',
      position: 1,
      description: 'VA has reached out via SMS or call',
      color: '#8b5cf6', // Violet
      actions: ['log_contact_attempt', 'schedule_follow_up_24h'],
    },
    {
      name: 'Engaged',
      position: 2,
      description: 'Lead has responded to our outreach',
      color: '#ec4899', // Pink
      actions: ['remove_from_automation', 'assign_to_consultation_booking'],
    },
    {
      name: 'Consultation Scheduled',
      position: 3,
      description: 'Consultation appointment is booked',
      color: '#f59e0b', // Amber
      actions: ['send_confirmation', 'send_preparation_info'],
    },
    {
      name: 'Consultation Completed',
      position: 4,
      description: 'Consultation has been completed',
      color: '#10b981', // Emerald
      actions: ['request_deposit', 'send_proposal'],
    },
    {
      name: 'Deposit Paid',
      position: 5,
      description: 'Deposit received, ready to schedule procedure',
      color: '#14b8a6', // Teal
      actions: ['send_thank_you', 'open_procedure_scheduling'],
    },
    {
      name: 'Procedure Scheduled',
      position: 6,
      description: 'Procedure date is confirmed',
      color: '#3b82f6', // Blue
      actions: ['send_prep_instructions', 'send_reminder_48h'],
    },
    {
      name: 'Touch-Up Due',
      position: 7,
      description: '6-8 weeks post-procedure, touch-up scheduling',
      color: '#f97316', // Orange
      actions: ['send_touchup_reminder', 'schedule_touchup'],
    },
    {
      name: 'Annual Refresh',
      position: 8,
      description: 'Annual color boost due (Year 1+)',
      color: '#84cc16', // Lime
      actions: ['send_annual_reminder', 'offer_discount'],
    },
  ],
};

// Custom fields for PMU business
const APGM_CUSTOM_FIELDS = [
  {
    name: 'Lead Source',
    fieldKey: 'contact.lead_source',
    dataType: 'TEXT',
    placeholder: 'Facebook Ad, Instagram, Website, Referral',
    description: 'Where the lead originated from',
  },
  {
    name: 'Service Interest',
    fieldKey: 'contact.service_interest',
    dataType: 'TEXT',
    placeholder: 'Microblading, Powder Brows, Lip Blush, Eyeliner',
    description: 'Which PMU service they are interested in',
  },
  {
    name: 'Previous PMU Experience',
    fieldKey: 'contact.previous_pmu',
    dataType: 'TEXT',
    placeholder: 'None, Previous work elsewhere, Touch-up needed',
    description: 'Client PMU history',
  },
  {
    name: 'Consultation Date',
    fieldKey: 'contact.consultation_date',
    dataType: 'DATE',
    placeholder: 'YYYY-MM-DD',
    description: 'Scheduled consultation date',
  },
  {
    name: 'Procedure Date',
    fieldKey: 'contact.procedure_date',
    dataType: 'DATE',
    placeholder: 'YYYY-MM-DD',
    description: 'Scheduled procedure date',
  },
  {
    name: 'Deposit Amount',
    fieldKey: 'contact.deposit_amount',
    dataType: 'TEXT',
    placeholder: '$100',
    description: 'Deposit paid amount',
  },
  {
    name: 'Total Service Value',
    fieldKey: 'contact.service_value',
    dataType: 'TEXT',
    placeholder: '$450',
    description: 'Total quoted service price',
  },
  {
    name: 'Touch-Up Due Date',
    fieldKey: 'contact.touchup_due_date',
    dataType: 'DATE',
    placeholder: 'YYYY-MM-DD',
    description: '6-8 week touch-up due date',
  },
  {
    name: 'Annual Refresh Due',
    fieldKey: 'contact.annual_refresh_due',
    dataType: 'DATE',
    placeholder: 'YYYY-MM-DD',
    description: 'Annual color boost due date',
  },
  {
    name: 'VA Assigned',
    fieldKey: 'contact.va_assigned',
    dataType: 'TEXT',
    placeholder: 'VA Name',
    description: 'Philippines VA assigned to this lead',
  },
  {
    name: 'OpenPhone Number',
    fieldKey: 'contact.openphone_number',
    dataType: 'TEXT',
    placeholder: '(980) XXX-XXXX',
    description: 'Shared OpenPhone number used for communication',
  },
  {
    name: 'Client Notes',
    fieldKey: 'contact.client_notes',
    dataType: 'TEXT',
    placeholder: 'Skin type, preferences, concerns',
    description: 'VA notes about client preferences',
  },
];

// Tags for lead organization
const APGM_TAGS = [
  { name: 'facebook-lead', color: '#1877f2' },
  { name: 'instagram-lead', color: '#e4405f' },
  { name: 'website-lead', color: '#10b981' },
  { name: 'referral', color: '#8b5cf6' },
  { name: 'microblading-interest', color: '#f59e0b' },
  { name: 'powder-brows-interest', color: '#ec4899' },
  { name: 'lip-blush-interest', color: '#ef4444' },
  { name: 'eyeliner-interest', color: '#6366f1' },
  { name: 'high-intent', color: '#14b8a6' },
  { name: 'needs-follow-up', color: '#f97316' },
  { name: 'consultation-booked', color: '#3b82f6' },
  { name: 'deposit-paid', color: '#10b981' },
  { name: 'procedure-completed', color: '#84cc16' },
  { name: 'touch-up-needed', color: '#f59e0b' },
  { name: 'annual-refresh-due', color: '#8b5cf6' },
  { name: 'vip-client', color: '#fbbf24' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      apiKey, 
      locationId, 
      createPipeline = true,
      createFields = true,
      createTags = true,
      testMode = false,
    } = body;

    const ghlApiKey = apiKey || (await getGHLApiKey());
    const ghlLocationId = locationId || (await getGHLLocationId());

    if (!ghlApiKey) {
      return NextResponse.json({ error: 'GHL API key not configured' }, { status: 400 });
    }
    if (!ghlLocationId) {
      return NextResponse.json({ error: 'GHL Location ID not configured' }, { status: 400 });
    }

    const results: any = {
      pipeline: { success: false, data: null, error: null },
      customFields: { created: [], existing: [], failed: [] },
      tags: { created: [], existing: [], failed: [] },
    };

    const headers = {
      Authorization: `Bearer ${ghlApiKey}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    };

    // 1. Create Pipeline
    if (createPipeline) {
      try {
        // Check if pipeline already exists
        const existingPipelines = await fetch(
          `https://services.leadconnectorhq.com/opportunities/pipelines`,
          { headers }
        );

        if (existingPipelines.ok) {
          const data = await existingPipelines.json();
          const existing = data.pipelines?.find(
            (p: any) => p.name === APGM_PIPELINE.name
          );

          if (existing) {
            results.pipeline = { 
              success: true, 
              data: existing, 
              error: null,
              message: 'Pipeline already exists',
            };
          } else {
            // Create new pipeline
            const createRes = await fetch(
              `https://services.leadconnectorhq.com/opportunities/pipelines`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  name: APGM_PIPELINE.name,
                  stages: APGM_PIPELINE.stages.map(s => ({
                    name: s.name,
                    position: s.position,
                  })),
                }),
              }
            );

            if (createRes.ok) {
              const pipeline = await createRes.json();
              results.pipeline = { 
                success: true, 
                data: pipeline, 
                error: null,
                message: 'Pipeline created successfully',
              };
            } else {
              results.pipeline = { 
                success: false, 
                data: null, 
                error: await createRes.text(),
              };
            }
          }
        }
      } catch (error) {
        results.pipeline.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // 2. Create Custom Fields
    if (createFields) {
      try {
        // Get existing fields
        const existingRes = await fetch(
          `https://services.leadconnectorhq.com/locations/${ghlLocationId}/customFields`,
          { headers }
        );

        let existingKeys: Set<string> = new Set();
        if (existingRes.ok) {
          const data = await existingRes.json();
          existingKeys = new Set((data.customFields || []).map((f: any) => f.fieldKey));
        }

        for (const field of APGM_CUSTOM_FIELDS) {
          if (existingKeys.has(field.fieldKey)) {
            results.customFields.existing.push(field.name);
            continue;
          }

          if (testMode) {
            results.customFields.created.push(`${field.name} (would create in test mode)`);
            continue;
          }

          const createRes = await fetch(
            `https://services.leadconnectorhq.com/locations/${ghlLocationId}/customFields`,
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
            results.customFields.created.push(field.name);
          } else {
            results.customFields.failed.push({
              name: field.name,
              error: await createRes.text(),
            });
          }
        }
      } catch (error) {
        results.customFields.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // 3. Create Tags
    if (createTags) {
      try {
        // Get existing tags
        const existingRes = await fetch(
          `https://services.leadconnectorhq.com/locations/${ghlLocationId}/tags`,
          { headers }
        );

        let existingNames: Set<string> = new Set();
        if (existingRes.ok) {
          const data = await existingRes.json();
          existingNames = new Set((data.tags || []).map((t: any) => t.name));
        }

        for (const tag of APGM_TAGS) {
          if (existingNames.has(tag.name)) {
            results.tags.existing.push(tag.name);
            continue;
          }

          if (testMode) {
            results.tags.created.push(`${tag.name} (would create in test mode)`);
            continue;
          }

          const createRes = await fetch(
            `https://services.leadconnectorhq.com/locations/${ghlLocationId}/tags`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                name: tag.name,
                color: tag.color,
              }),
            }
          );

          if (createRes.ok) {
            results.tags.created.push(tag.name);
          } else {
            results.tags.failed.push({
              name: tag.name,
              error: await createRes.text(),
            });
          }
        }
      } catch (error) {
        results.tags.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Save setup status to Firestore
    await db.collection('crmSetup').doc('apgm-pipeline').set({
      setupAt: FieldValue.serverTimestamp(),
      pipelineName: APGM_PIPELINE.name,
      stages: APGM_PIPELINE.stages.map(s => s.name),
      customFieldsCreated: results.customFields.created.length,
      tagsCreated: results.tags.created.length,
      results,
    }, { merge: true });

    const allSuccess = 
      results.pipeline.success && 
      results.customFields.failed.length === 0 &&
      results.tags.failed.length === 0;

    return NextResponse.json({
      success: allSuccess,
      testMode,
      results,
      summary: {
        pipeline: results.pipeline.success ? (results.pipeline.message || 'OK') : 'Failed',
        customFields: `${results.customFields.created.length} created, ${results.customFields.existing.length} existing`,
        tags: `${results.tags.created.length} created, ${results.tags.existing.length} existing`,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[setup-apgm-pipeline] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const setupDoc = await db.collection('crmSetup').doc('apgm-pipeline').get();
    const settings = setupDoc.exists ? setupDoc.data() : null;

    return NextResponse.json({
      configured: !!settings,
      pipelineName: APGM_PIPELINE.name,
      stages: APGM_PIPELINE.stages,
      customFields: APGM_CUSTOM_FIELDS,
      tags: APGM_TAGS,
      setupInfo: settings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==================== HELPER FUNCTIONS ====================

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
