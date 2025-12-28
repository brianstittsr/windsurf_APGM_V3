/**
 * WhatsApp Webhook Handler
 * Receives incoming messages and status updates from WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createWhatsAppService,
  WhatsAppBusinessService,
  WebhookPayload,
  WhatsAppMessage
} from '@/services/whatsapp-business';

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
// POST - Receive webhook events
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as WebhookPayload;

    // Verify it's a WhatsApp webhook
    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' });
    }

    let service: WhatsAppBusinessService | null = null;
    try {
      service = createWhatsAppService();
    } catch (error) {
      console.warn('WhatsApp service not configured, storing webhook data only');
    }

    // Parse the webhook payload
    const { messages, statuses, contacts } = service 
      ? service.parseWebhookPayload(payload)
      : parseWebhookPayloadFallback(payload);

    // Process incoming messages
    for (const message of messages) {
      await handleIncomingMessage(message, contacts, service);
    }

    // Process status updates
    for (const status of statuses) {
      await handleStatusUpdate(status);
    }

    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'error', message: error.message });
  }
}

// ============================================================================
// GET - Webhook verification
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe') {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'pmu_whatsapp_verify';
    
    if (token === verifyToken) {
      console.log('WhatsApp webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }
    
    console.error('WhatsApp webhook verification failed - token mismatch');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

// ============================================================================
// Message Handler
// ============================================================================

async function handleIncomingMessage(
  message: WhatsAppMessage,
  contacts: Array<{ name: string; waId: string }>,
  service: WhatsAppBusinessService | null
) {
  const contact = contacts.find(c => c.waId === message.from);
  const senderName = contact?.name || 'Unknown';
  const senderPhone = message.from;

  console.log(`[WhatsApp] Message from ${senderName} (${senderPhone}):`, message);

  // Store message in Firestore
  const db = await getFirebaseDb();
  if (db) {
    try {
      await db.collection('whatsapp-messages').add({
        messageId: message.id,
        from: senderPhone,
        senderName,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        type: message.type,
        content: getMessageContent(message),
        processed: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error storing WhatsApp message:', error);
    }
  }

  // Handle different message types
  switch (message.type) {
    case 'text':
      await handleTextMessage(message, senderName, senderPhone, service);
      break;
    
    case 'button':
    case 'interactive':
      await handleInteractiveResponse(message, senderName, senderPhone, service);
      break;
    
    default:
      console.log(`Unhandled message type: ${message.type}`);
  }
}

// ============================================================================
// Text Message Handler
// ============================================================================

async function handleTextMessage(
  message: WhatsAppMessage,
  senderName: string,
  senderPhone: string,
  service: WhatsAppBusinessService | null
) {
  const text = message.text?.body?.toLowerCase() || '';

  // Auto-response keywords
  const responses: Record<string, string> = {
    'book': "Great! I'd love to help you book an appointment! 📅\n\nPlease visit our booking page:\nhttps://atlantaglamourpmu.com/book\n\nOr reply with:\n• MICROBLADING\n• POWDER BROWS\n• LIP BLUSH\n• EYELINER\n\nto learn more about each service!",
    
    'price': "Here are our service prices:\n\n✨ Microblading: $500\n✨ Powder Brows: $500\n✨ Lip Blush: $550\n✨ Permanent Eyeliner: $400\n\n🎁 Use code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule your appointment!",
    
    'pricing': "Here are our service prices:\n\n✨ Microblading: $500\n✨ Powder Brows: $500\n✨ Lip Blush: $550\n✨ Permanent Eyeliner: $400\n\n🎁 Use code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule your appointment!",
    
    'microblading': "✨ MICROBLADING ✨\n\nNatural hair-stroke brows that look like real hair!\n\n• Duration: 2-3 hours\n• Healing: 4-6 weeks\n• Lasts: 1-2 years\n• Price: $500 (includes touch-up)\n\n🎁 Use code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule!",
    
    'powder': "✨ POWDER BROWS ✨\n\nSoft, filled-in look like makeup!\n\n• Duration: 2-3 hours\n• Healing: 4-6 weeks\n• Lasts: 2-3 years\n• Price: $500 (includes touch-up)\n\n🎁 Use code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule!",
    
    'lip': "💋 LIP BLUSH 💋\n\nNatural lip color enhancement!\n\n• Duration: 2-3 hours\n• Healing: 4-6 weeks\n• Lasts: 2-3 years\n• Price: $550 (includes touch-up)\n\n🎁 Use code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule!",
    
    'eyeliner': "👁️ PERMANENT EYELINER 👁️\n\nWake up with perfect eyes!\n\n• Duration: 1-2 hours\n• Healing: 2-4 weeks\n• Lasts: 2-5 years\n• Price: $400 (includes touch-up)\n\n🎁 Use code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule!",
    
    'hours': "🕐 Our Hours:\n\nMonday - Friday: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed\n\n📍 Atlanta Glamour PMU\n123 Beauty Lane\nAtlanta, GA 30301\n\nReply BOOK to schedule!",
    
    'location': "📍 Find Us At:\n\nAtlanta Glamour PMU\n123 Beauty Lane\nAtlanta, GA 30301\n\nGoogle Maps: https://maps.google.com/?q=Atlanta+Glamour+PMU\n\nReply BOOK to schedule your visit!",
    
    'help': "Hi there! 👋 Here's how I can help:\n\n• Reply BOOK to schedule\n• Reply PRICE for pricing\n• Reply MICROBLADING for info\n• Reply POWDER for powder brows\n• Reply LIP for lip blush\n• Reply EYELINER for eyeliner\n• Reply HOURS for our schedule\n• Reply LOCATION for directions\n\nOr just ask me anything!"
  };

  // Check for keyword matches
  let responseText: string | null = null;
  
  for (const [keyword, response] of Object.entries(responses)) {
    if (text.includes(keyword)) {
      responseText = response;
      break;
    }
  }

  // Default response if no keyword matched
  if (!responseText && text.length > 0) {
    responseText = `Hi ${senderName}! 👋\n\nThank you for reaching out to Atlanta Glamour PMU!\n\nI'll have someone get back to you shortly. In the meantime:\n\n• Reply BOOK to schedule\n• Reply PRICE for pricing\n• Reply HELP for more options\n\nOr visit: atlantaglamourpmu.com`;
  }

  // Send response if service is available
  if (responseText && service) {
    try {
      await service.sendTextMessage(senderPhone, responseText);
      console.log(`[WhatsApp] Sent auto-response to ${senderPhone}`);
    } catch (error) {
      console.error('Error sending auto-response:', error);
    }
  }

  // Create/update contact in GHL
  await syncToGHL(senderName, senderPhone, text);
}

// ============================================================================
// Interactive Response Handler
// ============================================================================

async function handleInteractiveResponse(
  message: WhatsAppMessage,
  senderName: string,
  senderPhone: string,
  service: WhatsAppBusinessService | null
) {
  let buttonId: string | undefined;
  let buttonTitle: string | undefined;

  if (message.button) {
    buttonId = message.button.payload;
    buttonTitle = message.button.text;
  } else if (message.interactive) {
    if (message.interactive.button_reply) {
      buttonId = message.interactive.button_reply.id;
      buttonTitle = message.interactive.button_reply.title;
    } else if (message.interactive.list_reply) {
      buttonId = message.interactive.list_reply.id;
      buttonTitle = message.interactive.list_reply.title;
    }
  }

  console.log(`[WhatsApp] Button response from ${senderName}: ${buttonTitle} (${buttonId})`);

  // Handle specific button responses
  const buttonResponses: Record<string, string> = {
    'confirm': "✅ Great! Your appointment is confirmed!\n\nWe'll see you soon! If you need to make any changes, just reply to this message.\n\n💕 Atlanta Glamour PMU",
    
    'reschedule': "No problem! Let's find a better time for you.\n\nPlease visit our booking page to select a new date:\nhttps://atlantaglamourpmu.com/book\n\nOr call us at (404) 555-1234",
    
    'book_consultation': "Perfect! Let's get you scheduled for a free consultation! 📅\n\nVisit: https://atlantaglamourpmu.com/book\n\nOr call us at (404) 555-1234 to speak with someone directly!",
    
    'view_services': "Here are our services:\n\n✨ Microblading - $500\n✨ Powder Brows - $500\n💋 Lip Blush - $550\n👁️ Permanent Eyeliner - $400\n\nAll services include a free touch-up!\n\n🎁 Use code GRANOPEN250 for $250 off!",
    
    'pricing_info': "💰 Our Pricing:\n\n✨ Microblading: $500\n✨ Powder Brows: $500\n💋 Lip Blush: $550\n👁️ Permanent Eyeliner: $400\n\n🎁 New Client Special:\nUse code GRANOPEN250 for $250 off!\n\nReply BOOK to schedule!",
    
    'call_me': "📞 We'll call you shortly!\n\nIf you don't hear from us within 30 minutes during business hours, please call:\n(404) 555-1234\n\nOur hours:\nMon-Fri: 9 AM - 6 PM\nSat: 10 AM - 4 PM",
    
    'learn_more': "I'd be happy to tell you more! What would you like to know about?\n\n• MICROBLADING\n• POWDER BROWS\n• LIP BLUSH\n• EYELINER\n\nJust reply with the service name!"
  };

  const responseText = buttonId ? buttonResponses[buttonId.toLowerCase()] : null;

  if (responseText && service) {
    try {
      await service.sendTextMessage(senderPhone, responseText);
    } catch (error) {
      console.error('Error sending button response:', error);
    }
  }
}

// ============================================================================
// Status Update Handler
// ============================================================================

async function handleStatusUpdate(status: { id: string; status: string; recipientId: string }) {
  console.log(`[WhatsApp] Message ${status.id} to ${status.recipientId}: ${status.status}`);

  // Update message status in Firestore
  const db = await getFirebaseDb();
  if (db) {
    try {
      const messagesRef = db.collection('whatsapp-messages');
      const snapshot = await messagesRef.where('messageId', '==', status.id).limit(1).get();
      
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          deliveryStatus: status.status,
          statusUpdatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }
}

// ============================================================================
// GHL Sync
// ============================================================================

async function syncToGHL(name: string, phone: string, message: string) {
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
    const locationId = ghlSettings?.locationId || process.env.GHL_LOCATION_ID;

    if (!apiKey || !locationId) {
      return;
    }

    // Search for existing contact
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search?locationId=${locationId}&query=${phone}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    const searchData = await searchResponse.json();
    const existingContact = searchData.contacts?.[0];

    if (existingContact) {
      // Add note to existing contact
      await fetch(`https://services.leadconnectorhq.com/contacts/${existingContact.id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          body: `WhatsApp message: ${message}`
        })
      });
    } else {
      // Create new contact
      const nameParts = name.split(' ');
      await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          locationId,
          firstName: nameParts[0] || name,
          lastName: nameParts.slice(1).join(' ') || '',
          phone,
          source: 'WhatsApp',
          tags: ['whatsapp-lead']
        })
      });
    }
  } catch (error) {
    console.error('Error syncing to GHL:', error);
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getMessageContent(message: WhatsAppMessage): string {
  switch (message.type) {
    case 'text':
      return message.text?.body || '';
    case 'button':
      return message.button?.text || '';
    case 'interactive':
      return message.interactive?.button_reply?.title || 
             message.interactive?.list_reply?.title || '';
    default:
      return `[${message.type}]`;
  }
}

function parseWebhookPayloadFallback(payload: WebhookPayload) {
  const messages: WhatsAppMessage[] = [];
  const statuses: Array<{ id: string; status: string; recipientId: string }> = [];
  const contacts: Array<{ name: string; waId: string }> = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.value.messages) {
        messages.push(...change.value.messages);
      }
      if (change.value.statuses) {
        statuses.push(...change.value.statuses.map(s => ({
          id: s.id,
          status: s.status,
          recipientId: s.recipient_id
        })));
      }
      if (change.value.contacts) {
        contacts.push(...change.value.contacts.map(c => ({
          name: c.profile.name,
          waId: c.wa_id
        })));
      }
    }
  }

  return { messages, statuses, contacts };
}
