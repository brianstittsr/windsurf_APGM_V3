/**
 * WhatsApp Business API Service
 * Integrates with Meta's WhatsApp Business Platform for messaging
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken?: string;
}

export interface MessageTemplate {
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface SendMessageParams {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: MessageComponentParam[];
}

export interface MessageComponentParam {
  type: 'header' | 'body' | 'button';
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    text?: string;
    currency?: { fallback_value: string; code: string; amount_1000: number };
    date_time?: { fallback_value: string };
    image?: { link: string };
    document?: { link: string; filename: string };
    video?: { link: string };
  }>;
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts' | 'interactive' | 'button';
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  button?: { text: string; payload: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
          errors?: Array<{ code: number; title: string; message: string }>;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface ConversationStats {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  responseRate: number;
}

// ============================================================================
// PMU-Specific Templates
// ============================================================================

export const PMU_TEMPLATES = {
  // Appointment Confirmation
  appointment_confirmation: {
    name: 'pmu_appointment_confirmation',
    language: 'en',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '✨ Appointment Confirmed!'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nYour {{2}} appointment is confirmed!\n\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Location: Atlanta Glamour PMU\n\nPlease arrive 10 minutes early.\n\nQuestions? Reply to this message!'
      },
      {
        type: 'FOOTER' as const,
        text: 'Atlanta Glamour PMU'
      },
      {
        type: 'BUTTONS' as const,
        buttons: [
          { type: 'QUICK_REPLY' as const, text: 'Confirm' },
          { type: 'QUICK_REPLY' as const, text: 'Reschedule' }
        ]
      }
    ]
  },

  // 24-Hour Reminder
  appointment_reminder: {
    name: 'pmu_appointment_reminder',
    language: 'en',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '⏰ Appointment Tomorrow!'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nThis is a friendly reminder about your {{2}} appointment tomorrow!\n\n📅 {{3}} at {{4}}\n\n📋 Pre-Care Reminders:\n• No alcohol 24 hours before\n• No blood thinners\n• Get a good night\'s sleep\n\nSee you soon! 💕'
      },
      {
        type: 'FOOTER' as const,
        text: 'Atlanta Glamour PMU'
      }
    ]
  },

  // Booking Confirmation with Deposit
  booking_deposit: {
    name: 'pmu_booking_deposit',
    language: 'en',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '🎉 Booking Received!'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nThank you for booking {{2}}!\n\n💰 Deposit Required: $50\n📅 Appointment: {{3}} at {{4}}\n\nYour spot is reserved for 24 hours. Complete your deposit to confirm!\n\n🎁 Use code GRANOPEN250 for $250 off!'
      },
      {
        type: 'BUTTONS' as const,
        buttons: [
          { type: 'URL' as const, text: 'Pay Deposit', url: 'https://atlantaglamourpmu.com/deposit' }
        ]
      }
    ]
  },

  // Post-Procedure Care
  aftercare_instructions: {
    name: 'pmu_aftercare',
    language: 'en',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '💝 Aftercare Instructions'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nThank you for your {{2}} session today!\n\n📋 Aftercare Tips:\n• Keep area dry for 10 days\n• Apply healing balm 2-3x daily\n• No makeup on treated area\n• Avoid sun exposure\n• No swimming or saunas\n\nHealing takes 4-6 weeks. Questions? Message us anytime!'
      },
      {
        type: 'FOOTER' as const,
        text: 'Atlanta Glamour PMU'
      }
    ]
  },

  // Touch-Up Reminder (6-8 weeks)
  touchup_reminder: {
    name: 'pmu_touchup_reminder',
    language: 'en',
    category: 'MARKETING' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '✨ Time for Your Touch-Up!'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nIt\'s been {{2}} weeks since your {{3}} procedure!\n\nYour touch-up appointment is included in your service. Book now to perfect your results!\n\n🎁 Refer a friend and get $50 off your next service!'
      },
      {
        type: 'BUTTONS' as const,
        buttons: [
          { type: 'URL' as const, text: 'Book Touch-Up', url: 'https://atlantaglamourpmu.com/book' },
          { type: 'QUICK_REPLY' as const, text: 'Call Me' }
        ]
      }
    ]
  },

  // Review Request
  review_request: {
    name: 'pmu_review_request',
    language: 'en',
    category: 'MARKETING' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '⭐ How Did We Do?'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nWe hope you\'re loving your new {{2}}! 💕\n\nYour feedback means the world to us. Would you mind leaving a quick review?\n\n🎁 As a thank you, get 10% off your next service!'
      },
      {
        type: 'BUTTONS' as const,
        buttons: [
          { type: 'URL' as const, text: 'Leave Review', url: 'https://g.page/r/atlantaglamourpmu/review' }
        ]
      }
    ]
  },

  // Promotional Offer
  promotional_offer: {
    name: 'pmu_promo',
    language: 'en',
    category: 'MARKETING' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'IMAGE' as const
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\n🎉 Special Offer Just For You!\n\n{{2}}\n\n⏰ Valid until: {{3}}\n\nDon\'t miss out on this exclusive deal!'
      },
      {
        type: 'BUTTONS' as const,
        buttons: [
          { type: 'URL' as const, text: 'Book Now', url: 'https://atlantaglamourpmu.com/book' },
          { type: 'QUICK_REPLY' as const, text: 'Learn More' }
        ]
      }
    ]
  },

  // Welcome Message (for new contacts)
  welcome_message: {
    name: 'pmu_welcome',
    language: 'en',
    category: 'MARKETING' as const,
    components: [
      {
        type: 'HEADER' as const,
        format: 'TEXT' as const,
        text: '👋 Welcome to Atlanta Glamour PMU!'
      },
      {
        type: 'BODY' as const,
        text: 'Hi {{1}},\n\nThank you for connecting with us!\n\nWe specialize in:\n✨ Microblading\n✨ Powder Brows\n✨ Lip Blush\n✨ Permanent Eyeliner\n\n🎁 New Client Special: Use code GRANOPEN250 for $250 off!\n\nHow can we help you today?'
      },
      {
        type: 'BUTTONS' as const,
        buttons: [
          { type: 'QUICK_REPLY' as const, text: 'Book Consultation' },
          { type: 'QUICK_REPLY' as const, text: 'View Services' },
          { type: 'QUICK_REPLY' as const, text: 'Pricing Info' }
        ]
      }
    ]
  }
};

// ============================================================================
// WhatsApp Business Service
// ============================================================================

export class WhatsAppBusinessService {
  private client: AxiosInstance;
  private phoneNumberId: string;
  private businessAccountId: string;

  constructor(config: WhatsAppConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;

    this.client = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // --------------------------------------------------------------------------
  // Send Messages
  // --------------------------------------------------------------------------

  async sendTemplateMessage(params: SendMessageParams): Promise<{ messageId: string; success: boolean }> {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(params.to),
        type: 'template',
        template: {
          name: params.templateName,
          language: { code: params.languageCode || 'en' },
          components: params.components || []
        }
      });

      return {
        messageId: response.data.messages[0].id,
        success: true
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendTextMessage(to: string, text: string): Promise<{ messageId: string; success: boolean }> {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: { body: text }
      });

      return {
        messageId: response.data.messages[0].id,
        success: true
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendInteractiveMessage(
    to: string,
    body: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<{ messageId: string; success: boolean }> {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: body },
          action: {
            buttons: buttons.map(btn => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title }
            }))
          }
        }
      });

      return {
        messageId: response.data.messages[0].id,
        success: true
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // PMU-Specific Message Helpers
  // --------------------------------------------------------------------------

  async sendAppointmentConfirmation(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_appointment_confirmation',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: serviceName },
            { type: 'text', text: date },
            { type: 'text', text: time }
          ]
        }
      ]
    });
  }

  async sendAppointmentReminder(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_appointment_reminder',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: serviceName },
            { type: 'text', text: date },
            { type: 'text', text: time }
          ]
        }
      ]
    });
  }

  async sendBookingDeposit(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_booking_deposit',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: serviceName },
            { type: 'text', text: date },
            { type: 'text', text: time }
          ]
        }
      ]
    });
  }

  async sendAftercareInstructions(
    to: string,
    clientName: string,
    serviceName: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_aftercare',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: serviceName }
          ]
        }
      ]
    });
  }

  async sendTouchUpReminder(
    to: string,
    clientName: string,
    weeksSince: string,
    serviceName: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_touchup_reminder',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: weeksSince },
            { type: 'text', text: serviceName }
          ]
        }
      ]
    });
  }

  async sendReviewRequest(
    to: string,
    clientName: string,
    serviceName: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_review_request',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: serviceName }
          ]
        }
      ]
    });
  }

  async sendWelcomeMessage(
    to: string,
    clientName: string
  ): Promise<{ messageId: string; success: boolean }> {
    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_welcome',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName }
          ]
        }
      ]
    });
  }

  async sendPromotionalOffer(
    to: string,
    clientName: string,
    offerText: string,
    validUntil: string,
    imageUrl?: string
  ): Promise<{ messageId: string; success: boolean }> {
    const components: MessageComponentParam[] = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: clientName },
          { type: 'text', text: offerText },
          { type: 'text', text: validUntil }
        ]
      }
    ];

    if (imageUrl) {
      components.unshift({
        type: 'header',
        parameters: [{ type: 'image', image: { link: imageUrl } }]
      });
    }

    return this.sendTemplateMessage({
      to,
      templateName: 'pmu_promo',
      components
    });
  }

  // --------------------------------------------------------------------------
  // Template Management
  // --------------------------------------------------------------------------

  async getTemplates(): Promise<MessageTemplate[]> {
    try {
      const response = await this.client.get(`/${this.businessAccountId}/message_templates`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      throw error;
    }
  }

  async createTemplate(template: MessageTemplate): Promise<{ id: string; status: string }> {
    try {
      const response = await this.client.post(`/${this.businessAccountId}/message_templates`, template);
      return {
        id: response.data.id,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Error creating template:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteTemplate(templateName: string): Promise<boolean> {
    try {
      await this.client.delete(`/${this.businessAccountId}/message_templates`, {
        params: { name: templateName }
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting template:', error.response?.data || error.message);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Media
  // --------------------------------------------------------------------------

  async uploadMedia(file: ArrayBuffer, mimeType: string, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file], { type: mimeType }), filename);
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', mimeType);

      const response = await this.client.post(`/${this.phoneNumberId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.id;
    } catch (error: any) {
      console.error('Error uploading media:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await this.client.get(`/${mediaId}`);
      return response.data.url;
    } catch (error: any) {
      console.error('Error getting media URL:', error.response?.data || error.message);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Business Profile
  // --------------------------------------------------------------------------

  async getBusinessProfile(): Promise<any> {
    try {
      const response = await this.client.get(`/${this.phoneNumberId}/whatsapp_business_profile`, {
        params: { fields: 'about,address,description,email,profile_picture_url,websites,vertical' }
      });
      return response.data.data[0];
    } catch (error: any) {
      console.error('Error getting business profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateBusinessProfile(profile: {
    about?: string;
    address?: string;
    description?: string;
    email?: string;
    websites?: string[];
    vertical?: string;
  }): Promise<boolean> {
    try {
      await this.client.post(`/${this.phoneNumberId}/whatsapp_business_profile`, {
        messaging_product: 'whatsapp',
        ...profile
      });
      return true;
    } catch (error: any) {
      console.error('Error updating business profile:', error.response?.data || error.message);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Webhook Verification
  // --------------------------------------------------------------------------

  verifyWebhook(mode: string, token: string, challenge: string, verifyToken: string): string | null {
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Parse Webhook
  // --------------------------------------------------------------------------

  parseWebhookPayload(payload: WebhookPayload): {
    messages: WhatsAppMessage[];
    statuses: Array<{ id: string; status: string; recipientId: string }>;
    contacts: Array<{ name: string; waId: string }>;
  } {
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

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming US)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return cleaned;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createWhatsAppService(): WhatsAppBusinessService {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !phoneNumberId || !businessAccountId) {
    throw new Error('WhatsApp Business API credentials not configured. Set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_BUSINESS_ACCOUNT_ID environment variables.');
  }

  return new WhatsAppBusinessService({
    accessToken,
    phoneNumberId,
    businessAccountId
  });
}
