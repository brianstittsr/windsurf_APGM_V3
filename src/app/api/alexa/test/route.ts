import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { intent } = await request.json();

    // Simulate Alexa test request
    const testRequest = {
      version: '1.0',
      session: {
        new: true,
        sessionId: 'test-session-id',
        application: {
          applicationId: 'test-app-id'
        }
      },
      request: {
        type: 'IntentRequest',
        requestId: 'test-request-id',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
        intent: {
          name: intent || 'TestIntent',
          confirmationStatus: 'NONE'
        }
      }
    };

    // Call the webhook endpoint
    const webhookUrl = `${request.url.replace('/test', '/webhook')}`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      testRequest,
      alexaResponse: data
    });
  } catch (error) {
    console.error('Alexa test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error },
      { status: 500 }
    );
  }
}
