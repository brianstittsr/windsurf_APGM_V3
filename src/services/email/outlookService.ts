/**
 * Outlook Service for Email Management
 * Handles Microsoft OAuth integration and Outlook API interactions
 */

import { ApiConfigService } from '@/config/apiConfig';

export interface OutlookConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
}

export interface OutlookMessage {
  id: string;
  conversationId: string;
  subject: string;
  from: OutlookRecipient;
  to: OutlookRecipient[];
  cc?: OutlookRecipient[];
  bcc?: OutlookRecipient[];
  receivedDateTime: string;
  sentDateTime?: string;
  body: {
    contentType: 'HTML' | 'Text';
    content: string;
  };
  bodyPreview?: string;
  importance: 'low' | 'normal' | 'high';
  isRead: boolean;
  isDraft: boolean;
  isSent: boolean;
  hasAttachments: boolean;
  attachments?: OutlookAttachment[];
  categories?: string[];
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential';
}

export interface OutlookRecipient {
  emailAddress: {
    address: string;
    name?: string;
  };
}

export interface OutlookAttachment {
  id: string;
  messageId: string;
  name: string;
  contentType: string;
  size: number;
  isInline: boolean;
  content?: string;
}

export interface OutlookFolder {
  id: string;
  displayName: string;
  parentFolderId?: string;
  childFolderCount: number;
  unreadItemCount: number;
  totalItemCount: number;
}

export interface OutlookConversation {
  id: string;
  topic: string;
  lastDeliveredTime: string;
  lastDeliveryTimeOrRenewalTime: string;
  isLocked: boolean;
  messages: OutlookMessage[];
}

export class OutlookService {
  private config: OutlookConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: OutlookConfig) {
    this.config = config;
  }

  /**
   * Initialize Microsoft OAuth flow
   */
  async initializeOAuth(): Promise<string> {
    const tenantId = this.config.tenantId || 'common';
    const scopes = [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.ReadBasic',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Contacts.ReadWrite'
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
      response_mode: 'query',
      state: 'outlook_auth_state'
    });

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const tenantId = this.config.tenantId || 'common';
      
      const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      };
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const tenantId = this.config.tenantId || 'common';
      
      const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

      return tokenData.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Make authenticated request to Microsoft Graph API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    // Check if token is expired and refresh if needed
    if (this.tokenExpiry && this.tokenExpiry <= new Date()) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
        return this.makeRequest(endpoint, options);
      }
      throw new Error(`Microsoft Graph API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{
    id: string;
    displayName: string;
    mail: string;
    userPrincipalName: string;
    mailboxes?: string[];
  }> {
    return this.makeRequest('/me');
  }

  /**
   * Get user's mail folders
   */
  async getMailFolders(): Promise<OutlookFolder[]> {
    const response = await this.makeRequest('/me/mailFolders');
    return response.value || [];
  }

  /**
   * Get messages from a folder
   */
  async getMessages(options: {
    folderId?: string;
    maxResults?: number;
    skip?: number;
    select?: string[];
    filter?: string;
    orderby?: string;
  } = {}): Promise<{
    value: OutlookMessage[];
    '@odata.nextLink'?: string;
  }> {
    const params = new URLSearchParams();
    
    if (options.maxResults) params.append('$top', options.maxResults.toString());
    if (options.skip) params.append('$skip', options.skip.toString());
    if (options.select) params.append('$select', options.select.join(','));
    if (options.filter) params.append('$filter', options.filter);
    if (options.orderby) params.append('$orderby', options.orderby);

    const folderPath = options.folderId ? `/mailFolders/${options.folderId}` : '';
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await this.makeRequest(`/me/messages${folderPath}${queryString}`);
    
    return {
      value: response.value?.map(this.mapOutlookMessage) || [],
      '@odata.nextLink': response['@odata.nextLink'],
    };
  }

  /**
   * Get specific message
   */
  async getMessage(messageId: string, options: {
    select?: string[];
    expand?: string[];
  } = {}): Promise<OutlookMessage> {
    const params = new URLSearchParams();
    
    if (options.select) params.append('$select', options.select.join(','));
    if (options.expand) params.append('$expand', options.expand.join(','));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await this.makeRequest(`/me/messages/${messageId}${queryString}`);
    
    return this.mapOutlookMessage(response);
  }

  /**
   * Send email message
   */
  async sendMessage(messageData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: 'HTML' | 'Text';
    importance?: 'low' | 'normal' | 'high';
    categories?: string[];
    attachments?: Array<{
      name: string;
      contentType: string;
      content: string;
    }>;
  }): Promise<{ id: string; conversationId: string }> {
    const message = {
      message: {
        subject: messageData.subject,
        body: {
          contentType: messageData.bodyType || 'HTML',
          content: messageData.body,
        },
        toRecipients: messageData.to.map(email => ({
          emailAddress: { address: email }
        })),
        ...(messageData.cc && {
          ccRecipients: messageData.cc.map(email => ({
            emailAddress: { address: email }
          }))
        }),
        ...(messageData.bcc && {
          bccRecipients: messageData.bcc.map(email => ({
            emailAddress: { address: email }
          }))
        }),
        ...(messageData.importance && { importance: messageData.importance }),
        ...(messageData.categories && { categories: messageData.categories }),
      },
      saveToSentItems: true,
    };

    const response = await this.makeRequest('/me/sendMail', {
      method: 'POST',
      body: JSON.stringify(message),
    });

    return {
      id: response.id || '',
      conversationId: response.conversationId || '',
    };
  }

  /**
   * Create draft message
   */
  async createDraft(messageData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: 'HTML' | 'Text';
    importance?: 'low' | 'normal' | 'high';
    categories?: string[];
  }): Promise<OutlookMessage> {
    const message = {
      message: {
        subject: messageData.subject,
        body: {
          contentType: messageData.bodyType || 'HTML',
          content: messageData.body,
        },
        toRecipients: messageData.to.map(email => ({
          emailAddress: { address: email }
        })),
        ...(messageData.cc && {
          ccRecipients: messageData.cc.map(email => ({
            emailAddress: { address: email }
          }))
        }),
        ...(messageData.bcc && {
          bccRecipients: messageData.bcc.map(email => ({
            emailAddress: { address: email }
          }))
        }),
        ...(messageData.importance && { importance: messageData.importance }),
        ...(messageData.categories && { categories: messageData.categories }),
      },
    };

    const response = await this.makeRequest('/me/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });

    return this.mapOutlookMessage(response);
  }

  /**
   * Update message
   */
  async updateMessage(messageId: string, updates: {
    subject?: string;
    body?: string;
    bodyType?: 'HTML' | 'Text';
    importance?: 'low' | 'normal' | 'high';
    categories?: string[];
    isRead?: boolean;
  }): Promise<OutlookMessage> {
    const updateData: any = {};
    
    if (updates.subject) updateData.subject = updates.subject;
    if (updates.body) {
      updateData.body = {
        contentType: updates.bodyType || 'HTML',
        content: updates.body,
      };
    }
    if (updates.importance) updateData.importance = updates.importance;
    if (updates.categories) updateData.categories = updates.categories;
    if (updates.isRead !== undefined) updateData.isRead = updates.isRead;

    const response = await this.makeRequest(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    return this.mapOutlookMessage(response);
  }

  /**
   * Mark message as read/unread
   */
  async markMessageAsRead(messageId: string, isRead: boolean): Promise<void> {
    await this.updateMessage(messageId, { isRead });
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.makeRequest(`/me/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get message attachments
   */
  async getMessageAttachments(messageId: string): Promise<OutlookAttachment[]> {
    const response = await this.makeRequest(`/me/messages/${messageId}/attachments`);
    return response.value?.map(this.mapOutlookAttachment) || [];
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, options: {
    folderId?: string;
    maxResults?: number;
    skip?: number;
  } = {}): Promise<{
    value: OutlookMessage[];
  }> {
    const params = new URLSearchParams({
      '$search': `"${query}"`,
    });
    
    if (options.maxResults) params.append('$top', options.maxResults.toString());
    if (options.skip) params.append('$skip', options.skip.toString());

    const folderPath = options.folderId ? `/mailFolders/${options.folderId}` : '';
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await this.makeRequest(`/me/messages${folderPath}${queryString}`);
    
    return {
      value: response.value?.map(this.mapOutlookMessage) || [],
    };
  }

  /**
   * Get conversations
   */
  async getConversations(options: {
    folderId?: string;
    maxResults?: number;
    skip?: number;
  } = {}): Promise<{
    value: OutlookConversation[];
  }> {
    const params = new URLSearchParams();
    
    if (options.maxResults) params.append('$top', options.maxResults.toString());
    if (options.skip) params.append('$skip', options.skip.toString());

    const folderPath = options.folderId ? `/mailFolders/${options.folderId}` : '';
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await this.makeRequest(`/me/conversations${folderPath}${queryString}`);
    
    return {
      value: response.value?.map(this.mapOutlookConversation) || [],
    };
  }

  /**
   * Get Outlook statistics
   */
  async getStatistics(): Promise<{
    totalMessages: number;
    unreadMessages: number;
    sentMessages: number;
    draftMessages: number;
    folderCounts: Record<string, number>;
  }> {
    const folders = await this.getMailFolders();
    
    return {
      totalMessages: 0, // Would need to calculate
      unreadMessages: 0, // Would need to calculate
      sentMessages: 0, // Would need to calculate
      draftMessages: 0, // Would need to calculate
      folderCounts: folders.reduce((acc, folder) => {
        acc[folder.displayName] = folder.totalItemCount;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Map Outlook API message to OutlookMessage interface
   */
  private mapOutlookMessage(outlookMessage: any): OutlookMessage {
    return {
      id: outlookMessage.id,
      conversationId: outlookMessage.conversationId,
      subject: outlookMessage.subject,
      from: outlookMessage.from,
      to: outlookMessage.toRecipients || [],
      cc: outlookMessage.ccRecipients,
      bcc: outlookMessage.bccRecipients,
      receivedDateTime: outlookMessage.receivedDateTime,
      sentDateTime: outlookMessage.sentDateTime,
      body: outlookMessage.body,
      bodyPreview: outlookMessage.bodyPreview,
      importance: outlookMessage.importance || 'normal',
      isRead: outlookMessage.isRead,
      isDraft: outlookMessage.isDraft,
      isSent: outlookMessage.isSent,
      hasAttachments: outlookMessage.hasAttachments,
      attachments: outlookMessage.attachments?.map(this.mapOutlookAttachment),
      categories: outlookMessage.categories,
      sensitivity: outlookMessage.sensitivity,
    };
  }

  /**
   * Map Outlook API attachment to OutlookAttachment interface
   */
  private mapOutlookAttachment(outlookAttachment: any): OutlookAttachment {
    return {
      id: outlookAttachment.id,
      messageId: outlookAttachment.messageId,
      name: outlookAttachment.name,
      contentType: outlookAttachment.contentType,
      size: outlookAttachment.size,
      isInline: outlookAttachment.isInline,
      content: outlookAttachment.content,
    };
  }

  /**
   * Map Outlook API conversation to OutlookConversation interface
   */
  private mapOutlookConversation(outlookConversation: any): OutlookConversation {
    return {
      id: outlookConversation.id,
      topic: outlookConversation.topic,
      lastDeliveredTime: outlookConversation.lastDeliveredTime,
      lastDeliveryTimeOrRenewalTime: outlookConversation.lastDeliveryTimeOrRenewalTime,
      isLocked: outlookConversation.isLocked,
      messages: [], // Would need to fetch separately
    };
  }

  /**
   * Check if service is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && (!this.tokenExpiry || this.tokenExpiry > new Date());
  }

  /**
   * Get authentication status
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    email?: string;
    tokenExpiry?: Date;
  } {
    return {
      isAuthenticated: this.isAuthenticated(),
      tokenExpiry: this.tokenExpiry || undefined,
    };
  }
}

/**
 * Factory function to create Outlook service
 */
export function createOutlookService(config: OutlookConfig): OutlookService {
  return new OutlookService(config);
}
