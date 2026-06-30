/**
 * OpenPhone Service
 * Integration with OpenPhone API for shared business texting and calling
 * 
 * OpenPhone API Docs: https://www.openphone.com/docs/api
 * 
 * Use Cases:
 * - Shared phone number for Victoria + VA
 * - SMS from GHL workflows via OpenPhone
 * - Call logging and notes
 * - Internal team communication
 */

export interface OpenPhoneConfig {
  apiKey: string;
  phoneNumber?: string; // The shared APGM number
}

export interface SendMessageRequest {
  to: string;
  content: string;
  phoneNumberId?: string; // OpenPhone number ID to send from
  userId?: string; // Victoria or VA user ID
}

export interface MessageResponse {
  id: string;
  status: 'delivered' | 'failed' | 'pending';
  createdAt: string;
  error?: string;
}

export interface CallRequest {
  to: string;
  phoneNumberId?: string;
  userId?: string;
}

export interface ContactSyncRequest {
  externalId: string; // GHL Contact ID
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  notes?: string;
  tags?: string[];
}

export class OpenPhoneService {
  private apiKey: string;
  private baseUrl = 'https://api.openphone.com/v1';
  private defaultPhoneNumber?: string;

  constructor(config: OpenPhoneConfig) {
    this.apiKey = config.apiKey;
    this.defaultPhoneNumber = config.phoneNumber;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenPhone API Error: ${response.status} - ${errorText}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // ==================== PHONE NUMBERS ====================
  
  /**
   * Get all phone numbers in the OpenPhone account
   */
  async getPhoneNumbers() {
    return this.makeRequest('/phone-numbers');
  }

  /**
   * Get a specific phone number by ID
   */
  async getPhoneNumber(phoneNumberId: string) {
    return this.makeRequest(`/phone-numbers/${phoneNumberId}`);
  }

  // ==================== MESSAGES ====================

  /**
   * Send an SMS message
   * Used by GHL workflows to send texts via OpenPhone shared number
   */
  async sendMessage(request: SendMessageRequest): Promise<MessageResponse> {
    const body = {
      content: request.content,
      to: request.to,
      phoneNumberId: request.phoneNumberId || this.defaultPhoneNumber,
      userId: request.userId,
    };

    const result = await this.makeRequest('/messages', 'POST', body);
    
    return {
      id: result.data?.id || result.id,
      status: result.data?.status || 'delivered',
      createdAt: result.data?.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Get messages for a phone number
   */
  async getMessages(phoneNumberId?: string, limit: number = 50) {
    const params = new URLSearchParams();
    if (phoneNumberId) params.append('phoneNumberId', phoneNumberId);
    params.append('limit', limit.toString());
    
    return this.makeRequest(`/messages?${params.toString()}`);
  }

  /**
   * Get a specific message thread/conversation
   */
  async getMessageThread(contactPhone: string, phoneNumberId?: string) {
    const params = new URLSearchParams();
    params.append('participants', contactPhone);
    if (phoneNumberId) params.append('phoneNumberId', phoneNumberId);
    
    return this.makeRequest(`/messages?${params.toString()}`);
  }

  // ==================== CALLS ====================

  /**
   * Initiate a phone call
   */
  async makeCall(request: CallRequest) {
    const body = {
      to: request.to,
      phoneNumberId: request.phoneNumberId || this.defaultPhoneNumber,
      userId: request.userId,
    };

    return this.makeRequest('/calls', 'POST', body);
  }

  /**
   * Get call history
   */
  async getCalls(phoneNumberId?: string, limit: number = 50) {
    const params = new URLSearchParams();
    if (phoneNumberId) params.append('phoneNumberId', phoneNumberId);
    params.append('limit', limit.toString());
    
    return this.makeRequest(`/calls?${params.toString()}`);
  }

  // ==================== CONTACTS ====================

  /**
   * Create or update a contact in OpenPhone
   * Syncs GHL contacts to OpenPhone for shared visibility
   */
  async syncContact(request: ContactSyncRequest) {
    const body = {
      externalId: request.externalId,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      email: request.email,
      notes: request.notes,
      tags: request.tags,
    };

    return this.makeRequest('/contacts', 'POST', body);
  }

  /**
   * Get contacts from OpenPhone
   */
  async getContacts(limit: number = 50, search?: string) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    return this.makeRequest(`/contacts?${params.toString()}`);
  }

  /**
   * Update a contact
   */
  async updateContact(contactId: string, updates: Partial<ContactSyncRequest>) {
    return this.makeRequest(`/contacts/${contactId}`, 'PUT', updates);
  }

  /**
   * Add a note to a contact
   * Used by VA to leave notes for Victoria
   */
  async addContactNote(contactId: string, note: string, userId?: string) {
    const body = {
      content: note,
      userId: userId,
    };

    return this.makeRequest(`/contacts/${contactId}/notes`, 'POST', body);
  }

  // ==================== USERS ====================

  /**
   * Get OpenPhone users (Victoria, VA, etc.)
   */
  async getUsers() {
    return this.makeRequest('/users');
  }

  // ==================== WEBHOOKS ====================

  /**
   * Set up webhook for incoming messages/calls
   * This receives events FROM OpenPhone TO your server
   */
  async setupWebhook(url: string, events: string[] = ['message.received', 'call.completed']) {
    const body = {
      url,
      events,
    };

    return this.makeRequest('/webhooks', 'POST', body);
  }

  // ==================== GHL INTEGRATION HELPERS ====================

  /**
   * Format a phone number for SMS from GHL workflow
   * Replaces GHL's native SMS with OpenPhone shared number
   */
  async sendGHLWorkflowSMS(
    toPhone: string,
    message: string,
    ghlContactId: string,
    options?: {
      userId?: string; // Victoria or VA
      tags?: string[];
    }
  ): Promise<MessageResponse> {
    // First, ensure contact exists in OpenPhone
    try {
      await this.syncContact({
        externalId: ghlContactId,
        firstName: 'GHL', // Will be updated with actual data
        lastName: 'Contact',
        phone: toPhone,
        tags: ['ghl-sync', ...(options?.tags || [])],
      });
    } catch (error) {
      // Contact may already exist, continue
      console.log('[OpenPhone] Contact sync skipped or failed:', error);
    }

    // Send the message
    return this.sendMessage({
      to: toPhone,
      content: message,
      userId: options?.userId,
    });
  }

  /**
   * Log a call to GHL as a note
   * Called when webhook receives call.completed from OpenPhone
   */
  async logCallToGHL(
    callData: {
      from: string;
      to: string;
      duration: number;
      status: 'completed' | 'missed' | 'voicemail';
      recordingUrl?: string;
      notes?: string;
    },
    ghlContactId: string,
    ghlApiKey: string
  ) {
    const noteBody = `📞 Call ${callData.status}
Duration: ${Math.round(callData.duration / 60)}m ${callData.duration % 60}s
From: ${callData.from}
To: ${callData.to}
${callData.recordingUrl ? `Recording: ${callData.recordingUrl}` : ''}
${callData.notes ? `Notes: ${callData.notes}` : ''}`;

    // Create note in GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/${ghlContactId}/notes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          body: noteBody,
          userId: 'system',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to log call to GHL: ${response.status}`);
    }

    return response.json();
  }
}

// Singleton instance for server-side usage
let openPhoneServiceInstance: OpenPhoneService | null = null;

export function getOpenPhoneService(config?: OpenPhoneConfig): OpenPhoneService {
  if (!openPhoneServiceInstance && config) {
    openPhoneServiceInstance = new OpenPhoneService(config);
  }
  
  if (!openPhoneServiceInstance) {
    throw new Error('OpenPhoneService not initialized. Provide config first.');
  }
  
  return openPhoneServiceInstance;
}

export function initOpenPhoneService(config: OpenPhoneConfig): OpenPhoneService {
  openPhoneServiceInstance = new OpenPhoneService(config);
  return openPhoneServiceInstance;
}
