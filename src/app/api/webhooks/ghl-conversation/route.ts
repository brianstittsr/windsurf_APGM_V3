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
 * GHL Conversation Webhook Handler
 * 
 * Receives real-time conversation events from GHL (SMS, Email, FB Messenger, etc.)
 * and forwards them to Privyr for lead management.
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 
 * Since GHL doesn't have a native "Conversation" webhook, you must use
 * GHL Workflow Builder to trigger this endpoint:
 * 
 * 1. In GHL: Go to Automation → Workflows
 * 2. Create a new Workflow: "Conversation Sync to Privyr"
 * 3. Add TRIGGER: "Customer Replied" (catches all inbound messages)
 *    - OR use specific triggers: "SMS Received", "Email Received", "FB Message"
 * 4. Add ACTION: "Webhook"
 *    - URL: https://www.aprettygirlmatter.com/api/webhooks/ghl-conversation
 *    - Method: POST
 *    - Headers: Content-Type: application/json
 *    - Body (Custom): {
 *        "eventType": "message.inbound",
 *        "contactId": "{{contact.id}}",
 *        "contactEmail": "{{contact.email}}",
 *        "contactPhone": "{{contact.phone}}",
 *        "contactName": "{{contact.name}}",
 *        "messageBody": "{{message.body}}",
 *        "messageChannel": "{{message.channel}}",
 *        "messageDirection": "inbound",
 *        "timestamp": "{{timestamp}}",
 *        "conversationId": "{{conversation.id}}"
 *      }
 * 5. Save and Publish the workflow
 * 
 * PRIVYR SETUP:
 * =============
 * 1. In Privyr app: Account → Integrations → Incoming Webhook
 * 2. Copy your Webhook URL (looks like: https://www.privyr.com/api/v1/incoming-leads/XXXX/YYYY)
 * 3. Store it in this codebase via Admin Dashboard → GoHighLevel → Privyr Integration
 * 
 * Alternative: Set PRIVYR_WEBHOOK_URL env variable
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    console.log('[ghl-conversation] Received webhook:', {
      eventType: payload.eventType,
      contactId: payload.contactId,
      channel: payload.messageChannel,
      direction: payload.messageDirection,
    });

    // Validate required fields
    if (!payload.contactId) {
      return NextResponse.json(
        { error: 'Missing contactId' },
        { status: 400 }
      );
    }

    // Log the conversation event to Firestore for auditing
    await logConversationEvent(payload);

    // Check if we have Privyr webhook URL configured
    const privyrWebhookUrl = await getPrivyrWebhookUrl();
    
    if (!privyrWebhookUrl) {
      console.log('[ghl-conversation] No Privyr webhook URL configured - storing locally only');
      return NextResponse.json({
        success: true,
        message: 'Conversation logged locally (Privyr not configured)',
        logged: true,
      });
    }

    // Transform and forward to Privyr
    const privyrPayload = transformToPrivyrFormat(payload);
    const privyrResponse = await forwardToPrivyr(privyrWebhookUrl, privyrPayload);

    // Log the sync result
    await logPrivyrSync(payload.contactId, privyrPayload, privyrResponse);

    return NextResponse.json({
      success: privyrResponse.success,
      message: privyrResponse.success 
        ? 'Conversation forwarded to Privyr successfully'
        : `Privyr forward failed: ${privyrResponse.error}`,
      privyrSynced: privyrResponse.success,
      logged: true,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ghl-conversation] Error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/ghl-conversation
 * Returns recent conversation logs and sync status
 */
export async function GET() {
  try {
    const logs = await db
      .collection('ghl-conversation-logs')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const conversations = logs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const privyrUrl = await getPrivyrWebhookUrl();

    return NextResponse.json({
      configured: !!privyrUrl,
      privyrUrl: privyrUrl ? maskUrl(privyrUrl) : null,
      recentConversations: conversations,
      totalLogged: conversations.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==================== HELPER FUNCTIONS ====================

async function logConversationEvent(payload: any) {
  try {
    const logEntry = {
      contactId: payload.contactId,
      contactName: payload.contactName || 'Unknown',
      contactEmail: payload.contactEmail || null,
      contactPhone: payload.contactPhone || null,
      messageBody: payload.messageBody || '',
      messageChannel: payload.messageChannel || 'unknown',
      messageDirection: payload.messageDirection || 'unknown',
      conversationId: payload.conversationId || null,
      timestamp: FieldValue.serverTimestamp(),
      rawPayload: payload,
    };

    // Store in Firestore
    await db.collection('ghl-conversation-logs').add(logEntry);
    
    console.log('[ghl-conversation] Logged to Firestore for contact:', payload.contactId);
  } catch (error) {
    console.error('[ghl-conversation] Failed to log to Firestore:', error);
  }
}

function transformToPrivyrFormat(ghlPayload: any) {
  /**
   * Privyr Incoming Webhook Format:
   * - name: string (required)
   * - email: string (optional)
   * - phone: string (optional)
   * - source: string (optional) - lead source identifier
   * - notes: string (optional) - additional info
   * - custom_fields: object (optional) - any custom field values
   */
  
  const contactName = ghlPayload.contactName || 'Unknown';
  const messagePreview = (ghlPayload.messageBody || '').substring(0, 200);
  const channel = ghlPayload.messageChannel || 'message';
  const direction = ghlPayload.messageDirection || 'inbound';
  
  return {
    name: contactName,
    email: ghlPayload.contactEmail || undefined,
    phone: ghlPayload.contactPhone || undefined,
    source: `GHL ${channel}`,
    notes: `[${direction.toUpperCase()} ${channel}] ${messagePreview}${messagePreview.length >= 200 ? '...' : ''}`,
    custom_fields: {
      ghl_contact_id: ghlPayload.contactId,
      ghl_conversation_id: ghlPayload.conversationId || '',
      message_channel: channel,
      message_direction: direction,
      last_message_at: ghlPayload.timestamp || new Date().toISOString(),
      full_message: ghlPayload.messageBody || '',
    },
  };
}

async function forwardToPrivyr(
  webhookUrl: string,
  payload: any
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    console.log('[ghl-conversation] Forwarding to Privyr:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ghl-conversation] Privyr error:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json().catch(() => null);
    console.log('[ghl-conversation] Privyr success:', responseData);
    
    return {
      success: true,
      response: responseData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ghl-conversation] Privyr forward failed:', error);
    return {
      success: false,
      error: message,
    };
  }
}

async function logPrivyrSync(
  contactId: string,
  payload: any,
  result: { success: boolean; error?: string; response?: any }
) {
  try {
    await db.collection('ghl-privyr-sync-logs').add({
      contactId,
      privyrPayload: payload,
      success: result.success,
      error: result.error || null,
      privyrResponse: result.response || null,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('[ghl-conversation] Failed to log Privyr sync:', error);
  }
}

async function getPrivyrWebhookUrl(): Promise<string | null> {
  try {
    // Try Firestore settings first
    const settingsDoc = await db.collection('integrationSettings').doc('privyr').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      if (data?.webhookUrl) return data.webhookUrl;
    }

    // Fallback to environment variable
    return process.env.PRIVYR_WEBHOOK_URL || null;
  } catch (error) {
    console.error('[ghl-conversation] Error fetching Privyr settings:', error);
    return process.env.PRIVYR_WEBHOOK_URL || null;
  }
}

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/');
    // Mask the last two path segments (auth tokens)
    if (pathParts.length >= 3) {
      pathParts[pathParts.length - 1] = '****';
      pathParts[pathParts.length - 2] = '****';
    }
    return `${parsed.origin}${pathParts.join('/')}`;
  } catch {
    return 'https://****.com/api/****/****';
  }
}
