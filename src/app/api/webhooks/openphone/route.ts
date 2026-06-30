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
 * OpenPhone Webhook Handler
 * 
 * Receives real-time events from OpenPhone:
 * - message.received (incoming SMS)
 * - message.delivered (delivery confirmation)
 * - call.completed (finished calls)
 * - call.missed (missed calls)
 * - call.voicemail (voicemail left)
 * 
 * Setup in OpenPhone:
 * 1. Go to OpenPhone Dashboard → Settings → Integrations → Webhooks
 * 2. Add webhook URL: https://www.aprettygirlmatter.com/api/webhooks/openphone
 * 3. Select events: message.received, call.completed, call.missed
 * 4. Save
 * 
 * What this does:
 * - Logs all events to Firestore
 * - Syncs incoming messages to GHL contact notes
 * - Logs calls to GHL contact history
 * - Forwards to Privyr if configured
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    console.log('[openphone-webhook] Received event:', {
      type: payload.type || payload.event,
      timestamp: new Date().toISOString(),
    });

    const eventType = payload.type || payload.event || 'unknown';
    
    // Log all events to Firestore
    await logOpenPhoneEvent(eventType, payload);

    // Handle different event types
    switch (eventType) {
      case 'message.received':
      case 'message.inbound':
        await handleIncomingMessage(payload);
        break;
        
      case 'message.delivered':
      case 'message.sent':
        await handleMessageDelivered(payload);
        break;
        
      case 'call.completed':
        await handleCallCompleted(payload);
        break;
        
      case 'call.missed':
        await handleCallMissed(payload);
        break;
        
      case 'call.voicemail':
        await handleVoicemail(payload);
        break;
        
      default:
        console.log('[openphone-webhook] Unhandled event type:', eventType);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[openphone-webhook] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * GET /api/webhooks/openphone
 * Returns recent webhook events for debugging
 */
export async function GET() {
  try {
    const logs = await db
      .collection('openphone-events')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    return NextResponse.json({
      events: logs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==================== EVENT HANDLERS ====================

async function handleIncomingMessage(payload: any) {
  try {
    const message = payload.data || payload;
    const from = message.from || message.contact?.phoneNumber;
    const content = message.content || message.body;
    const to = message.to || message.phoneNumber;
    
    console.log('[openphone-webhook] Incoming message from:', from);

    // 1. Find associated GHL contact by phone number
    const ghlContact = await findGHLContactByPhone(from);
    
    // 2. Log to GHL as a note if contact found
    if (ghlContact) {
      await logMessageToGHL(ghlContact.id, {
        direction: 'inbound',
        content,
        from,
        to,
        timestamp: message.createdAt || new Date().toISOString(),
        channel: 'sms',
      });
    }

    // 3. Forward to Privyr if configured
    const privyrUrl = await getPrivyrWebhookUrl();
    if (privyrUrl) {
      await forwardToPrivyr(privyrUrl, {
        name: ghlContact?.name || 'Unknown',
        email: ghlContact?.email,
        phone: from,
        source: 'OpenPhone SMS',
        notes: `[INBOUND SMS] ${content}`,
        custom_fields: {
          ghl_contact_id: ghlContact?.id || '',
          message_channel: 'sms',
          openphone_number: to,
        },
      });
    }

    // 4. Trigger GHL workflow if configured
    await triggerGHLWorkflow('sms_received', {
      contactId: ghlContact?.id,
      phone: from,
      message: content,
    });

  } catch (error) {
    console.error('[openphone-webhook] Error handling incoming message:', error);
  }
}

async function handleMessageDelivered(payload: any) {
  try {
    const message = payload.data || payload;
    
    // Update the message log with delivery status
    const logs = await db
      .collection('openphone-message-logs')
      .where('messageId', '==', message.id)
      .limit(1)
      .get();

    if (!logs.empty) {
      await logs.docs[0].ref.update({
        deliveryStatus: message.status || 'delivered',
        deliveredAt: FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[openphone-webhook] Error updating delivery status:', error);
  }
}

async function handleCallCompleted(payload: any) {
  try {
    const call = payload.data || payload;
    const from = call.from || call.contact?.phoneNumber;
    const duration = call.duration || 0;
    const status = call.status || 'completed';
    const recordingUrl = call.recordingUrl;
    
    console.log('[openphone-webhook] Call completed from:', from, 'Duration:', duration);

    // Find GHL contact
    const ghlContact = await findGHLContactByPhone(from);
    
    if (ghlContact) {
      // Log call to GHL
      const noteBody = `📞 Call Completed
Duration: ${Math.floor(duration / 60)}m ${duration % 60}s
Direction: ${call.direction || 'unknown'}
Status: ${status}
${recordingUrl ? `Recording: ${recordingUrl}` : 'No recording'}`;

      await logMessageToGHL(ghlContact.id, {
        direction: call.direction || 'inbound',
        content: noteBody,
        from,
        to: call.to,
        timestamp: call.endedAt || new Date().toISOString(),
        channel: 'call',
      });

      // Update opportunity in GHL if exists
      await updateGHLOpportunityFromCall(ghlContact.id, {
        duration,
        status,
        recordingUrl,
      });
    }

    // Forward to Privyr as a lead activity
    const privyrUrl = await getPrivyrWebhookUrl();
    if (privyrUrl && ghlContact) {
      await forwardToPrivyr(privyrUrl, {
        name: ghlContact.name,
        email: ghlContact.email,
        phone: from,
        source: 'OpenPhone Call',
        notes: `[CALL ${status.toUpperCase()}] Duration: ${Math.floor(duration / 60)}m`,
        custom_fields: {
          ghl_contact_id: ghlContact.id,
          call_duration: duration,
          call_status: status,
        },
      });
    }

  } catch (error) {
    console.error('[openphone-webhook] Error handling call completed:', error);
  }
}

async function handleCallMissed(payload: any) {
  try {
    const call = payload.data || payload;
    const from = call.from || call.contact?.phoneNumber;
    
    console.log('[openphone-webhook] Missed call from:', from);

    const ghlContact = await findGHLContactByPhone(from);
    
    if (ghlContact) {
      // Log missed call to GHL
      await logMessageToGHL(ghlContact.id, {
        direction: 'inbound',
        content: '📞 Missed Call - No voicemail left',
        from,
        to: call.to,
        timestamp: call.createdAt || new Date().toISOString(),
        channel: 'call',
      });

      // Tag in GHL for follow-up
      await addGHLTag(ghlContact.id, 'missed-call-follow-up');
    }

    // Trigger missed call workflow in GHL
    await triggerGHLWorkflow('call_missed', {
      contactId: ghlContact?.id,
      phone: from,
    });

  } catch (error) {
    console.error('[openphone-webhook] Error handling missed call:', error);
  }
}

async function handleVoicemail(payload: any) {
  try {
    const call = payload.data || payload;
    const from = call.from || call.contact?.phoneNumber;
    const recordingUrl = call.voicemailUrl || call.recordingUrl;
    
    console.log('[openphone-webhook] Voicemail from:', from);

    const ghlContact = await findGHLContactByPhone(from);
    
    if (ghlContact) {
      await logMessageToGHL(ghlContact.id, {
        direction: 'inbound',
        content: `🎙️ New Voicemail\nRecording: ${recordingUrl}`,
        from,
        to: call.to,
        timestamp: call.createdAt || new Date().toISOString(),
        channel: 'voicemail',
      });

      // Tag for urgent follow-up
      await addGHLTag(ghlContact.id, 'voicemail-follow-up');
    }

    // Forward to Privyr with high priority
    const privyrUrl = await getPrivyrWebhookUrl();
    if (privyrUrl && ghlContact) {
      await forwardToPrivyr(privyrUrl, {
        name: ghlContact.name,
        email: ghlContact.email,
        phone: from,
        source: 'OpenPhone Voicemail',
        notes: `🎙️ NEW VOICEMAIL - URGENT FOLLOW-UP NEEDED\nRecording: ${recordingUrl}`,
        custom_fields: {
          ghl_contact_id: ghlContact.id,
          voicemail_url: recordingUrl,
          priority: 'high',
        },
      });
    }

  } catch (error) {
    console.error('[openphone-webhook] Error handling voicemail:', error);
  }
}

// ==================== HELPER FUNCTIONS ====================

async function logOpenPhoneEvent(eventType: string, payload: any) {
  try {
    await db.collection('openphone-events').add({
      eventType,
      payload,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('[openphone-webhook] Failed to log event:', error);
  }
}

async function findGHLContactByPhone(phone: string): Promise<{ id: string; name: string; email?: string } | null> {
  try {
    // Clean the phone number for search
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Try Firestore cache first
    const cached = await db
      .collection('ghl-contacts-cache')
      .where('phone', '==', cleanPhone)
      .limit(1)
      .get();

    if (!cached.empty) {
      const data = cached.docs[0].data();
      return {
        id: data.ghlContactId,
        name: data.name,
        email: data.email,
      };
    }

    // If not in cache, we can't query GHL directly from webhook
    // (no GHL API key context here - would need to be added)
    return null;
  } catch (error) {
    console.error('[openphone-webhook] Error finding GHL contact:', error);
    return null;
  }
}

async function logMessageToGHL(
  contactId: string,
  message: {
    direction: string;
    content: string;
    from: string;
    to: string;
    timestamp: string;
    channel: string;
  }
) {
  try {
    // Get GHL API key
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    const apiKey = settingsDoc.data()?.apiKey || process.env.GHL_API_KEY;

    if (!apiKey) {
      console.warn('[openphone-webhook] No GHL API key available');
      return;
    }

    // Create note in GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          body: `[${message.channel.toUpperCase()} ${message.direction.toUpperCase()}]\n${message.content}\n\nFrom: ${message.from}\nTo: ${message.to}\nTime: ${message.timestamp}`,
          userId: 'openphone-integration',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }

    console.log('[openphone-webhook] Message logged to GHL for contact:', contactId);
  } catch (error) {
    console.error('[openphone-webhook] Error logging to GHL:', error);
  }
}

async function addGHLTag(contactId: string, tag: string) {
  try {
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    const apiKey = settingsDoc.data()?.apiKey || process.env.GHL_API_KEY;

    if (!apiKey) return;

    await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}/tags`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({ tags: [tag] }),
      }
    );
  } catch (error) {
    console.error('[openphone-webhook] Error adding tag:', error);
  }
}

async function updateGHLOpportunityFromCall(
  contactId: string,
  callData: { duration: number; status: string; recordingUrl?: string }
) {
  try {
    // This would update a custom field on the opportunity
    // Implementation depends on your pipeline structure
    console.log('[openphone-webhook] Would update opportunity for contact:', contactId, callData);
  } catch (error) {
    console.error('[openphone-webhook] Error updating opportunity:', error);
  }
}

async function triggerGHLWorkflow(eventType: string, data: any) {
  try {
    // Log for potential webhook triggering
    await db.collection('ghl-workflow-triggers').add({
      eventType,
      data,
      timestamp: FieldValue.serverTimestamp(),
      processed: false,
    });
  } catch (error) {
    console.error('[openphone-webhook] Error triggering workflow:', error);
  }
}

async function getPrivyrWebhookUrl(): Promise<string | null> {
  try {
    const doc = await db.collection('integrationSettings').doc('privyr').get();
    return doc.data()?.webhookUrl || null;
  } catch {
    return null;
  }
}

async function forwardToPrivyr(webhookUrl: string, payload: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('[openphone-webhook] Forwarded to Privyr');
  } catch (error) {
    console.error('[openphone-webhook] Error forwarding to Privyr:', error);
  }
}
