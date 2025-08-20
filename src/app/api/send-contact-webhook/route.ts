import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== Contact Form Webhook API ===');
  
  try {
    const { name, email, phone, service, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Use Webhook.site or similar service to reliably deliver emails
    const webhookUrl = 'https://webhook.site/your-unique-id'; // Replace with actual webhook
    
    const emailData = {
      timestamp: new Date().toISOString(),
      type: 'contact_form_submission',
      data: {
        name,
        email,
        phone,
        service,
        message,
        source: 'aprettygirlmatter.com'
      }
    };

    // Send to webhook service
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`);
    }

    // Also send via Zapier webhook for email automation
    const zapierWebhook = process.env.ZAPIER_WEBHOOK_URL;
    if (zapierWebhook) {
      await fetch(zapierWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          service,
          message,
          timestamp: new Date().toISOString()
        })
      });
    }

    console.log('Contact form processed via webhook successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been received! We will respond within 24 hours.'
    });

  } catch (error) {
    console.error('Webhook contact form error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process your message. Please try again or call (919) 441-0932.',
      details: (error as Error).message
    }, { status: 500 });
  }
}
