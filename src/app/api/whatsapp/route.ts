/**
 * WhatsApp Business API Endpoint
 * Handles sending messages and webhook verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createWhatsAppService,
  WhatsAppBusinessService,
  PMU_TEMPLATES 
} from '@/services/whatsapp-business';

// Initialize service lazily
let whatsappService: WhatsAppBusinessService | null = null;

function getService(): WhatsAppBusinessService {
  if (!whatsappService) {
    whatsappService = createWhatsAppService();
  }
  return whatsappService;
}

// ============================================================================
// POST - Send messages and manage templates
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const service = getService();

    switch (action) {
      // Send template message
      case 'send_template': {
        const { to, templateName, languageCode, components } = body;
        if (!to || !templateName) {
          return NextResponse.json(
            { error: 'Phone number (to) and templateName are required' },
            { status: 400 }
          );
        }
        const result = await service.sendTemplateMessage({
          to,
          templateName,
          languageCode,
          components
        });
        return NextResponse.json({ success: true, ...result });
      }

      // Send text message (within 24-hour window)
      case 'send_text': {
        const { to, text } = body;
        if (!to || !text) {
          return NextResponse.json(
            { error: 'Phone number (to) and text are required' },
            { status: 400 }
          );
        }
        const result = await service.sendTextMessage(to, text);
        return NextResponse.json({ success: true, ...result });
      }

      // Send interactive message with buttons
      case 'send_interactive': {
        const { to, text, buttons } = body;
        if (!to || !text || !buttons) {
          return NextResponse.json(
            { error: 'Phone number (to), text, and buttons are required' },
            { status: 400 }
          );
        }
        const result = await service.sendInteractiveMessage(to, text, buttons);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Appointment confirmation
      case 'appointment_confirmation': {
        const { to, clientName, serviceName, date, time } = body;
        if (!to || !clientName || !serviceName || !date || !time) {
          return NextResponse.json(
            { error: 'to, clientName, serviceName, date, and time are required' },
            { status: 400 }
          );
        }
        const result = await service.sendAppointmentConfirmation(to, clientName, serviceName, date, time);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Appointment reminder
      case 'appointment_reminder': {
        const { to, clientName, serviceName, date, time } = body;
        if (!to || !clientName || !serviceName || !date || !time) {
          return NextResponse.json(
            { error: 'to, clientName, serviceName, date, and time are required' },
            { status: 400 }
          );
        }
        const result = await service.sendAppointmentReminder(to, clientName, serviceName, date, time);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Booking deposit request
      case 'booking_deposit': {
        const { to, clientName, serviceName, date, time } = body;
        if (!to || !clientName || !serviceName || !date || !time) {
          return NextResponse.json(
            { error: 'to, clientName, serviceName, date, and time are required' },
            { status: 400 }
          );
        }
        const result = await service.sendBookingDeposit(to, clientName, serviceName, date, time);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Aftercare instructions
      case 'aftercare': {
        const { to, clientName, serviceName } = body;
        if (!to || !clientName || !serviceName) {
          return NextResponse.json(
            { error: 'to, clientName, and serviceName are required' },
            { status: 400 }
          );
        }
        const result = await service.sendAftercareInstructions(to, clientName, serviceName);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Touch-up reminder
      case 'touchup_reminder': {
        const { to, clientName, weeksSince, serviceName } = body;
        if (!to || !clientName || !weeksSince || !serviceName) {
          return NextResponse.json(
            { error: 'to, clientName, weeksSince, and serviceName are required' },
            { status: 400 }
          );
        }
        const result = await service.sendTouchUpReminder(to, clientName, weeksSince, serviceName);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Review request
      case 'review_request': {
        const { to, clientName, serviceName } = body;
        if (!to || !clientName || !serviceName) {
          return NextResponse.json(
            { error: 'to, clientName, and serviceName are required' },
            { status: 400 }
          );
        }
        const result = await service.sendReviewRequest(to, clientName, serviceName);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Welcome message
      case 'welcome': {
        const { to, clientName } = body;
        if (!to || !clientName) {
          return NextResponse.json(
            { error: 'to and clientName are required' },
            { status: 400 }
          );
        }
        const result = await service.sendWelcomeMessage(to, clientName);
        return NextResponse.json({ success: true, ...result });
      }

      // PMU-specific: Promotional offer
      case 'promo': {
        const { to, clientName, offerText, validUntil, imageUrl } = body;
        if (!to || !clientName || !offerText || !validUntil) {
          return NextResponse.json(
            { error: 'to, clientName, offerText, and validUntil are required' },
            { status: 400 }
          );
        }
        const result = await service.sendPromotionalOffer(to, clientName, offerText, validUntil, imageUrl);
        return NextResponse.json({ success: true, ...result });
      }

      // Get all templates
      case 'get_templates': {
        const templates = await service.getTemplates();
        return NextResponse.json({ success: true, templates });
      }

      // Get PMU template definitions
      case 'get_pmu_templates': {
        return NextResponse.json({ 
          success: true, 
          templates: PMU_TEMPLATES 
        });
      }

      // Create template
      case 'create_template': {
        const { template } = body;
        if (!template) {
          return NextResponse.json(
            { error: 'Template definition is required' },
            { status: 400 }
          );
        }
        const result = await service.createTemplate(template);
        return NextResponse.json({ success: true, ...result });
      }

      // Delete template
      case 'delete_template': {
        const { templateName } = body;
        if (!templateName) {
          return NextResponse.json(
            { error: 'Template name is required' },
            { status: 400 }
          );
        }
        await service.deleteTemplate(templateName);
        return NextResponse.json({ success: true, message: 'Template deleted' });
      }

      // Get business profile
      case 'get_profile': {
        const profile = await service.getBusinessProfile();
        return NextResponse.json({ success: true, profile });
      }

      // Update business profile
      case 'update_profile': {
        const { profile } = body;
        if (!profile) {
          return NextResponse.json(
            { error: 'Profile data is required' },
            { status: 400 }
          );
        }
        await service.updateBusinessProfile(profile);
        return NextResponse.json({ success: true, message: 'Profile updated' });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'send_template',
              'send_text',
              'send_interactive',
              'appointment_confirmation',
              'appointment_reminder',
              'booking_deposit',
              'aftercare',
              'touchup_reminder',
              'review_request',
              'welcome',
              'promo',
              'get_templates',
              'get_pmu_templates',
              'create_template',
              'delete_template',
              'get_profile',
              'update_profile'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('WhatsApp API error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'WhatsApp Business API not configured',
          message: 'Please set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_BUSINESS_ACCOUNT_ID environment variables'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
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

  // Webhook verification
  if (mode && token && challenge) {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'pmu_whatsapp_verify';
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WhatsApp webhook verified');
      return new NextResponse(challenge, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }

  // Return API status
  return NextResponse.json({
    status: 'active',
    endpoint: 'WhatsApp Business API',
    message: 'Ready to send messages',
    timestamp: new Date().toISOString()
  });
}
