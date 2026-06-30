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
 * Privyr Integration Settings API
 * 
 * GET  - Retrieve current Privyr settings and recent sync logs
 * POST - Save/update Privyr webhook URL
 * 
 * The webhook URL is obtained from Privyr:
 * Account → Integrations → Incoming Webhook
 * Format: https://www.privyr.com/api/v1/incoming-leads/{string_1}/{string_2}
 */

export async function GET() {
  try {
    const settingsDoc = await db.collection('integrationSettings').doc('privyr').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    // Get recent sync logs
    const logsSnapshot = await db
      .collection('ghl-privyr-sync-logs')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const logs = logsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        contactId: data.contactId,
        contactName: data.privyrPayload?.name || 'Unknown',
        success: data.success,
        error: data.error || null,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      };
    });

    // Get conversation logs count
    const conversationCount = await db.collection('ghl-conversation-logs').count().get();

    return NextResponse.json({
      configured: !!settings?.webhookUrl,
      webhookUrl: settings?.webhookUrl || null,
      lastUpdated: settings?.updatedAt || null,
      stats: {
        totalConversationsLogged: conversationCount.data().count,
        recentSyncs: logs.length,
        successfulSyncs: logs.filter(l => l.success).length,
        failedSyncs: logs.filter(l => !l.success).length,
      },
      recentLogs: logs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, testMode = false } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!webhookUrl.startsWith('https://www.privyr.com/api/v1/incoming-leads/')) {
      return NextResponse.json(
        { error: 'Invalid Privyr webhook URL format. Expected: https://www.privyr.com/api/v1/incoming-leads/...' },
        { status: 400 }
      );
    }

    // If test mode, validate the URL by sending a test ping
    if (testMode) {
      const testResult = await testPrivyrWebhook(webhookUrl);
      if (!testResult.success) {
        return NextResponse.json({
          error: `Test failed: ${testResult.error}`,
          testFailed: true,
        }, { status: 400 });
      }
    }

    // Save to Firestore
    await db.collection('integrationSettings').doc('privyr').set({
      webhookUrl,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('[privyr-settings] Saved webhook URL');

    return NextResponse.json({
      success: true,
      message: testMode 
        ? 'Privyr webhook URL saved and tested successfully'
        : 'Privyr webhook URL saved successfully',
      configured: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[privyr-settings] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function testPrivyrWebhook(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const testPayload = {
      name: 'Test Lead from APGM',
      email: 'test@example.com',
      phone: '+1234567890',
      source: 'GHL Integration Test',
      notes: 'This is a test message to verify the Privyr webhook connection.',
      custom_fields: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
