import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { OpenPhoneService, SendMessageRequest } from '@/services/openphoneService';

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
 * OpenPhone Integration API
 * 
 * POST /api/integrations/openphone
 * - Send SMS: { action: 'sendMessage', to, content, userId? }
 * - Sync Contact: { action: 'syncContact', ghlContactId, ... }
 * - Save Settings: { action: 'saveSettings', apiKey, phoneNumber }
 * 
 * GET /api/integrations/openphone
 * - Get settings, messages, and call logs
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const settings = await getOpenPhoneSettings();
    
    if (!settings.apiKey && action !== 'saveSettings') {
      return NextResponse.json(
        { error: 'OpenPhone not configured. Please set API key first.' },
        { status: 400 }
      );
    }

    const openphone = new OpenPhoneService({
      apiKey: settings.apiKey,
      phoneNumber: settings.phoneNumber,
    });

    switch (action) {
      case 'sendMessage': {
        const { to, content, userId, ghlContactId } = body;
        
        if (!to || !content) {
          return NextResponse.json(
            { error: 'Missing required fields: to, content' },
            { status: 400 }
          );
        }

        const result = await openphone.sendGHLWorkflowSMS(
          to,
          content,
          ghlContactId || `manual-${Date.now()}`,
          { userId }
        );

        // Log the message
        await logMessage({
          to,
          content,
          userId,
          ghlContactId,
          messageId: result.id,
          status: result.status,
        });

        return NextResponse.json({
          success: true,
          messageId: result.id,
          status: result.status,
        });
      }

      case 'syncContact': {
        const { ghlContactId, firstName, lastName, phone, email, notes, tags } = body;
        
        if (!ghlContactId || !phone) {
          return NextResponse.json(
            { error: 'Missing required fields: ghlContactId, phone' },
            { status: 400 }
          );
        }

        const result = await openphone.syncContact({
          externalId: ghlContactId,
          firstName: firstName || 'Unknown',
          lastName,
          phone,
          email,
          notes,
          tags: [...(tags || []), 'ghl-sync'],
        });

        return NextResponse.json({
          success: true,
          contactId: result.data?.id || result.id,
        });
      }

      case 'saveSettings': {
        const { apiKey, phoneNumber, testFirst = false } = body;

        if (!apiKey) {
          return NextResponse.json(
            { error: 'API Key is required' },
            { status: 400 }
          );
        }

        // Test the API key if requested
        if (testFirst) {
          try {
            const testService = new OpenPhoneService({ apiKey });
            await testService.getPhoneNumbers();
          } catch (error) {
            return NextResponse.json(
              { error: 'Invalid API Key. Please check your OpenPhone API credentials.' },
              { status: 400 }
            );
          }
        }

        // Save settings
        await db.collection('integrationSettings').doc('openphone').set({
          apiKey,
          phoneNumber: phoneNumber || null,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return NextResponse.json({
          success: true,
          message: testFirst 
            ? 'Settings saved and API key validated'
            : 'Settings saved successfully',
        });
      }

      case 'addNote': {
        const { contactId, note, userId } = body;
        
        if (!contactId || !note) {
          return NextResponse.json(
            { error: 'Missing required fields: contactId, note' },
            { status: 400 }
          );
        }

        const result = await openphone.addContactNote(contactId, note, userId);
        
        return NextResponse.json({
          success: true,
          noteId: result.data?.id,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[openphone-api] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'overview';

    const settings = await getOpenPhoneSettings();

    if (!settings.apiKey) {
      return NextResponse.json({
        configured: false,
        message: 'OpenPhone not configured',
      });
    }

    const openphone = new OpenPhoneService({
      apiKey: settings.apiKey,
      phoneNumber: settings.phoneNumber,
    });

    switch (type) {
      case 'overview': {
        // Get basic stats
        const [phoneNumbers, recentLogs] = await Promise.all([
          openphone.getPhoneNumbers().catch(() => ({ data: [] })),
          db.collection('openphone-message-logs')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get(),
        ]);

        return NextResponse.json({
          configured: true,
          phoneNumbers: phoneNumbers.data || [],
          defaultPhoneNumber: settings.phoneNumber,
          recentMessages: recentLogs.docs.map(d => ({
            id: d.id,
            ...d.data(),
          })),
        });
      }

      case 'messages': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const messages = await openphone.getMessages(settings.phoneNumber, limit);
        
        return NextResponse.json({
          messages: messages.data || [],
        });
      }

      case 'calls': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const calls = await openphone.getCalls(settings.phoneNumber, limit);
        
        return NextResponse.json({
          calls: calls.data || [],
        });
      }

      case 'contacts': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || undefined;
        const contacts = await openphone.getContacts(limit, search);
        
        return NextResponse.json({
          contacts: contacts.data || [],
        });
      }

      case 'users': {
        const users = await openphone.getUsers();
        return NextResponse.json({ users: users.data || [] });
      }

      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[openphone-api] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==================== HELPER FUNCTIONS ====================

async function getOpenPhoneSettings(): Promise<{ apiKey: string; phoneNumber?: string }> {
  try {
    const doc = await db.collection('integrationSettings').doc('openphone').get();
    if (doc.exists) {
      const data = doc.data();
      return {
        apiKey: data?.apiKey || '',
        phoneNumber: data?.phoneNumber || undefined,
      };
    }
  } catch (error) {
    console.error('[openphone-settings] Error fetching settings:', error);
  }
  
  return {
    apiKey: process.env.OPENPHONE_API_KEY || '',
    phoneNumber: process.env.OPENPHONE_PHONE_NUMBER || undefined,
  };
}

async function logMessage(data: {
  to: string;
  content: string;
  userId?: string;
  ghlContactId?: string;
  messageId: string;
  status: string;
}) {
  try {
    await db.collection('openphone-message-logs').add({
      ...data,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('[openphone-log] Failed to log message:', error);
  }
}
