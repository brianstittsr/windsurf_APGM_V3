/**
 * Google Lead Form Webhook Receiver
 * Receives real-time leads from Google Ads Lead Form Extensions
 * Integrates with GHL for instant contact creation and follow-up
 */

import { NextRequest, NextResponse } from 'next/server';

// Lazy load Firebase Admin to prevent Turbopack symlink errors on Windows
async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch (error) {
    console.warn('Firebase Admin not available:', error);
    return null;
  }
}

// ============================================================================
// Types
// ============================================================================

interface GoogleLeadFormData {
  lead_id: string;
  api_version: string;
  form_id: string;
  campaign_id: string;
  google_key: string;
  is_test: boolean;
  gcl_id?: string;
  adgroup_id?: string;
  creative_id?: string;
  user_column_data: Array<{
    column_id: string;
    string_value: string;
    column_name?: string;
  }>;
}

interface ParsedLead {
  leadId: string;
  formId: string;
  campaignId: string;
  isTest: boolean;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  postalCode?: string;
  customFields: Record<string, string>;
  receivedAt: string;
  source: string;
}

// ============================================================================
// POST - Receive Google Lead Form Webhook
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GoogleLeadFormData;

    // Validate webhook
    if (!body.lead_id || !body.user_column_data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Parse lead data
    const lead = parseLeadData(body);

    // Store lead in Firestore
    await storeLead(lead);

    // Send to GoHighLevel
    const ghlResult = await sendToGHL(lead);

    // Trigger instant response workflow
    await triggerInstantResponse(lead);

    // Log the lead
    console.log(`[Google Lead] Received lead: ${lead.leadId}`, {
      name: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      isTest: lead.isTest
    });

    return NextResponse.json({
      success: true,
      leadId: lead.leadId,
      ghlContactId: ghlResult?.contactId,
      message: 'Lead received and processed successfully'
    });
  } catch (error: any) {
    console.error('Google Lead Webhook error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process lead', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// Parse Lead Data
// ============================================================================

function parseLeadData(data: GoogleLeadFormData): ParsedLead {
  const fieldMap: Record<string, string> = {};
  
  // Map column IDs to values
  for (const field of data.user_column_data) {
    const key = field.column_name || field.column_id;
    fieldMap[key.toLowerCase()] = field.string_value;
  }

  // Extract standard fields
  const fullName = fieldMap['full_name'] || fieldMap['name'] || '';
  const nameParts = fullName.split(' ');
  const firstName = fieldMap['first_name'] || nameParts[0] || '';
  const lastName = fieldMap['last_name'] || nameParts.slice(1).join(' ') || '';

  return {
    leadId: data.lead_id,
    formId: data.form_id,
    campaignId: data.campaign_id,
    isTest: data.is_test,
    fullName: fullName || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email: fieldMap['email'] || fieldMap['user_email'] || '',
    phone: fieldMap['phone_number'] || fieldMap['phone'] || '',
    city: fieldMap['city'] || fieldMap['user_city'] || '',
    postalCode: fieldMap['postal_code'] || fieldMap['zip_code'] || '',
    customFields: fieldMap,
    receivedAt: new Date().toISOString(),
    source: 'google_lead_form'
  };
}

// ============================================================================
// Store Lead in Firestore
// ============================================================================

async function storeLead(lead: ParsedLead): Promise<void> {
  try {
    const db = await getFirebaseDb();
    if (!db) {
      console.warn('Firebase not initialized, skipping lead storage');
      return;
    }

    await db.collection('google-leads').doc(lead.leadId).set({
      ...lead,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error storing lead:', error);
    // Don't throw - we still want to process the lead
  }
}

// ============================================================================
// Send to GoHighLevel
// ============================================================================

async function sendToGHL(lead: ParsedLead): Promise<{ contactId: string } | null> {
  try {
    // Get GHL settings from Firestore
    let ghlSettings: any = null;
    const db = await getFirebaseDb();
    
    if (db) {
      const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get()
      if (settingsDoc.exists) {
        ghlSettings = settingsDoc.data();
      }
    }

    const apiKey = ghlSettings?.apiKey || process.env.GHL_API_KEY;
    const locationId = ghlSettings?.locationId || process.env.GHL_LOCATION_ID;

    if (!apiKey || !locationId) {
      console.warn('GHL not configured, skipping CRM sync');
      return null;
    }

    // Create contact in GHL
    const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        name: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        postalCode: lead.postalCode,
        source: 'Google Lead Form',
        tags: ['google-lead-form', 'high-intent', 'instant-response'],
        customFields: [
          { key: 'lead_source', value: 'Google Ads Lead Form' },
          { key: 'campaign_id', value: lead.campaignId },
          { key: 'form_id', value: lead.formId }
        ]
      })
    });

    const contactData = await contactResponse.json();
    const contactId = contactData.contact?.id;

    if (contactId) {
      // Create opportunity
      await fetch('https://services.leadconnectorhq.com/opportunities/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          locationId,
          contactId,
          name: `Google Lead - ${lead.fullName}`,
          status: 'open',
          source: 'Google Lead Form',
          monetaryValue: 500 // Default PMU service value
        })
      });

      // Update Firestore with GHL contact ID
      if (db) {
        await db.collection('google-leads').doc(lead.leadId).update({
          ghlContactId: contactId,
          ghlSyncedAt: new Date()
        });
      }

      return { contactId };
    }

    return null;
  } catch (error) {
    console.error('Error sending to GHL:', error);
    return null;
  }
}

// ============================================================================
// Trigger Instant Response (< 5 minutes)
// ============================================================================

async function triggerInstantResponse(lead: ParsedLead): Promise<void> {
  try {
    // Get GHL settings
    let ghlSettings: any = null;
    const db = await getFirebaseDb();
    
    if (db) {
      const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
      if (settingsDoc.exists) {
        ghlSettings = settingsDoc.data();
      }
    }

    const apiKey = ghlSettings?.apiKey || process.env.GHL_API_KEY;

    if (!apiKey || !lead.phone) {
      return;
    }

    // Get the GHL contact ID from Firestore
    let contactId: string | null = null;
    if (db) {
      const leadDoc = await db.collection('google-leads').doc(lead.leadId).get();
      if (leadDoc.exists) {
        contactId = leadDoc.data()?.ghlContactId;
      }
    }

    if (!contactId) {
      return;
    }

    // Send instant SMS
    const smsMessage = `Hi ${lead.firstName || 'there'}! 👋

Thank you for your interest in permanent makeup at Atlanta Glamour PMU!

I'm Sarah, and I'd love to help you achieve your dream look.

📞 Call me directly: (404) 555-1234
📅 Or book online: https://atlantaglamourpmu.com/book

What service are you interested in?
- Microblading
- Powder Brows
- Lip Blush
- Eyeliner

Reply to this message and I'll get back to you right away!`;

    await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        type: 'SMS',
        contactId,
        message: smsMessage
      })
    });

    // Send instant email
    if (lead.email) {
      await fetch('https://services.leadconnectorhq.com/conversations/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          type: 'Email',
          contactId,
          subject: `Welcome to Atlanta Glamour PMU, ${lead.firstName || 'Beautiful'}! ✨`,
          message: generateWelcomeEmail(lead)
        })
      });
    }

    // Update lead status
    if (db) {
      await db.collection('google-leads').doc(lead.leadId).update({
        status: 'contacted',
        contactedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error triggering instant response:', error);
  }
}

// ============================================================================
// Generate Welcome Email
// ============================================================================

function generateWelcomeEmail(lead: ParsedLead): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .services { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .service-item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Atlanta Glamour PMU! ✨</h1>
    </div>
    <div class="content">
      <p>Hi ${lead.firstName || 'Beautiful'},</p>
      
      <p>Thank you for your interest in permanent makeup! We're thrilled that you're considering us for your beauty journey.</p>
      
      <p>At Atlanta Glamour PMU, we specialize in creating natural, beautiful results that enhance your unique features.</p>
      
      <div class="services">
        <h3>Our Services:</h3>
        <div class="service-item">💫 <strong>Microblading</strong> - Natural hair-stroke brows</div>
        <div class="service-item">✨ <strong>Powder Brows</strong> - Soft, filled-in look</div>
        <div class="service-item">💋 <strong>Lip Blush</strong> - Natural lip color enhancement</div>
        <div class="service-item">👁️ <strong>Permanent Eyeliner</strong> - Wake up with perfect eyes</div>
      </div>
      
      <p style="text-align: center;">
        <a href="https://atlantaglamourpmu.com/book" class="cta-button">Book Your Free Consultation</a>
      </p>
      
      <p>Have questions? Simply reply to this email or call us at <strong>(404) 555-1234</strong>.</p>
      
      <p>We can't wait to help you look and feel your best!</p>
      
      <p>With love,<br>
      <strong>Sarah</strong><br>
      Atlanta Glamour PMU</p>
    </div>
    <div class="footer">
      <p>Atlanta Glamour PMU | 123 Beauty Lane, Atlanta, GA 30301</p>
      <p>© 2024 Atlanta Glamour PMU. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================================
// GET - Verify webhook endpoint
// ============================================================================

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    endpoint: 'Google Lead Form Webhook',
    message: 'Webhook is ready to receive leads',
    timestamp: new Date().toISOString()
  });
}
