/**
 * Gmail Service for Email Management
 * Handles Google OAuth integration and Gmail API interactions
 */

import { ApiConfigService } from '@/config/apiConfig';

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiKey?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: string;
  body: string;
  bodyPlain?: string;
  attachments?: GmailAttachment[];
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
}

export interface GmailAttachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: string;
  size: number;
  data?: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility?: 'show' | 'hide';
  labelListVisibility?: 'labelShow' | 'labelShowIfUnread' | 'labelHide';
  type?: 'system' | 'user';
}

export interface GmailThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  unreadMessageCount: number;
  lastMessageDate: string;
  messages: GmailMessage[];
}

export class GmailService {
  private config: GmailConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: GmailConfig) {
    this.config = config;
  }

  /**
   * Initialize Gmail OAuth flow
   */
  async initializeOAuth(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels'
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
      const response = await fetch('https://oauth2.googleapis.com/token', {
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
      const response = await fetch('https://oauth2.googleapis.com/token', {
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
   * Make authenticated request to Gmail API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    // Check if token is expired and refresh if needed
    if (this.tokenExpiry && this.tokenExpiry <= new Date()) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${endpoint}`, {
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
      throw new Error(`Gmail API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{
    emailAddress: string;
    name: string;
    signature?: string;
    threadsTotal: number;
    messagesTotal: number;
    historyId?: string;
  }> {
    return this.makeRequest('/profile');
  }

  /**
   * Get list of Gmail labels
   */
  async getLabels(): Promise<GmailLabel[]> {
    const response = await this.makeRequest('/labels');
    return response.labels || [];
  }

  /**
   * Create a new Gmail label
   */
  async createLabel(name: string, messageListVisibility?: 'show' | 'hide', labelListVisibility?: 'labelShow' | 'labelShowIfUnread' | 'labelHide'): Promise<GmailLabel> {
    const labelData = {
      name,
      messageListVisibility,
      labelListVisibility,
    };

    const response = await this.makeRequest('/labels', {
      method: 'POST',
      body: JSON.stringify(labelData),
    });

    return response;
  }

  /**
   * Get list of Gmail threads
   */
  async getThreads(options: {
    maxResults?: number;
    pageToken?: string;
    query?: string;
    includeSpamTrash?: boolean;
    labelIds?: string[];
  } = {}): Promise<{
    threads: GmailThread[];
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    const params = new URLSearchParams();
    
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.query) params.append('q', options.query);
    if (options.includeSpamTrash) params.append('includeSpamTrash', 'true');
    if (options.labelIds) params.append('labelIds', options.labelIds.join(','));

    const response = await this.makeRequest(`/threads?${params.toString()}`);
    
    return {
      threads: response.threads || [],
      nextPageToken: response.nextPageToken,
      resultSizeEstimate: response.resultSizeEstimate,
    };
  }

  /**
   * Get specific Gmail thread
   */
  async getThread(threadId: string, options: {
    format?: 'full' | 'metadata' | 'minimal';
    metadataHeaders?: string[];
    includeSpamTrash?: boolean;
  } = {}): Promise<GmailThread> {
    const params = new URLSearchParams();
    
    if (options.format) params.append('format', options.format);
    if (options.metadataHeaders) params.append('metadataHeaders', options.metadataHeaders.join(','));
    if (options.includeSpamTrash) params.append('includeSpamTrash', 'true');

    const response = await this.makeRequest(`/threads/${threadId}?${params.toString()}`);
    
    return {
      id: response.id,
      subject: response.messages[0]?.subject || '',
      participants: this.extractParticipants(response.messages[0]),
      messageCount: response.messages?.length || 0,
      unreadMessageCount: 0, // Would need to calculate
      lastMessageDate: response.messages[0]?.internalDate || '',
      messages: response.messages?.map(this.mapGmailMessage) || [],
    };
  }

  /**
   * Get specific Gmail message
   */
  async getMessage(messageId: string, options: {
    format?: 'full' | 'metadata' | 'minimal' | 'raw';
    metadataHeaders?: string[];
  } = {}): Promise<GmailMessage> {
    const params = new URLSearchParams();
    
    if (options.format) params.append('format', options.format);
    if (options.metadataHeaders) params.append('metadataHeaders', options.metadataHeaders.join(','));

    const response = await this.makeRequest(`/messages/${messageId}?${params.toString()}`);
    
    return this.mapGmailMessage(response);
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
    bodyPlain?: string;
    attachments?: Array<{
      filename: string;
      mimeType: string;
      data: string;
    }>;
  }): Promise<{ id: string; threadId: string; labelIds: string[] }> {
    // Create RFC 2822 compliant email message
    const emailLines = [
      `To: ${messageData.to.join(', ')}`,
      ...(messageData.cc ? [`Cc: ${messageData.cc.join(', ')}`] : []),
      ...(messageData.bcc ? [`Bcc: ${messageData.bcc.join(', ')}`] : []),
      `Subject: ${messageData.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      messageData.body,
    ];

    const emailContent = emailLines.join('\r\n');
    const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await this.makeRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    return {
      id: response.id,
      threadId: response.threadId,
      labelIds: response.labelIds || [],
    };
  }

  /**
   * Mark message as read/unread
   */
  async markMessageAsRead(messageId: string, isRead: boolean): Promise<void> {
    const labelIds = isRead ? ['UNREAD'] : [];
    
    await this.makeRequest(`/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        removeLabelIds: labelIds,
      }),
    });
  }

  /**
   * Star/unstar message
   */
  async starMessage(messageId: string, isStarred: boolean): Promise<void> {
    const labelIds = isStarred ? ['STARRED'] : [];
    
    await this.makeRequest(`/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: labelIds,
      }),
    });
  }

  /**
   * Add labels to message
   */
  async addLabelsToMessage(messageId: string, labelIds: string[]): Promise<void> {
    await this.makeRequest(`/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: labelIds,
      }),
    });
  }

  /**
   * Remove labels from message
   */
  async removeLabelsFromMessage(messageId: string, labelIds: string[]): Promise<void> {
    await this.makeRequest(`/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        removeLabelIds: labelIds,
      }),
    });
  }

  /**
   * Search Gmail messages
   */
  async searchMessages(query: string, options: {
    maxResults?: number;
    pageToken?: string;
    includeSpamTrash?: boolean;
    labelIds?: string[];
  } = {}): Promise<{
    messages: GmailMessage[];
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    const params = new URLSearchParams({
      q: query,
    });
    
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.includeSpamTrash) params.append('includeSpamTrash', 'true');
    if (options.labelIds) params.append('labelIds', options.labelIds.join(','));

    const response = await this.makeRequest(`/messages?${params.toString()}`);
    
    return {
      messages: response.messages?.map(msg => ({ id: msg.id })) || [],
      nextPageToken: response.nextPageToken,
      resultSizeEstimate: response.resultSizeEstimate,
    };
  }

  /**
   * Get Gmail statistics
   */
  async getStatistics(): Promise<{
    totalMessages: number;
    unreadMessages: number;
    sentMessages: number;
    draftMessages: number;
    spamMessages: number;
    trashMessages: number;
  }> {
    const profile = await this.getUserProfile();
    
    return {
      totalMessages: profile.messagesTotal,
      unreadMessages: 0, // Would need to calculate
      sentMessages: 0, // Would need to calculate
      draftMessages: 0, // Would need to calculate
      spamMessages: 0, // Would need to calculate
      trashMessages: 0, // Would need to calculate
    };
  }

  /**
   * Map Gmail API message to GmailMessage interface
   */
  private mapGmailMessage(gmailMessage: any): GmailMessage {
    const headers = gmailMessage.payload?.headers || [];
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    return {
      id: gmailMessage.id,
      threadId: gmailMessage.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To').split(', ').filter(Boolean),
      cc: getHeader('Cc') ? getHeader('Cc').split(', ').filter(Boolean) : undefined,
      bcc: getHeader('Bcc') ? getHeader('Bcc').split(', ').filter(Boolean) : undefined,
      date: getHeader('Date'),
      body: this.extractBody(gmailMessage.payload),
      bodyPlain: this.extractPlainBody(gmailMessage.payload),
      attachments: this.extractAttachments(gmailMessage.payload),
      labels: gmailMessage.labelIds || [],
      isRead: !gmailMessage.labelIds?.includes('UNREAD'),
      isStarred: gmailMessage.labelIds?.includes('STARRED') || false,
    };
  }

  /**
   * Extract body content from Gmail message
   */
  private extractBody(payload: any): string {
    if (payload.body?.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return '';
  }

  /**
   * Extract plain text body from Gmail message
   */
  private extractPlainBody(payload: any): string {
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return '';
  }

  /**
   * Extract attachments from Gmail message
   */
  private extractAttachments(payload: any): GmailAttachment[] {
    const attachments: GmailAttachment[] = [];
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.filename && part.body?.data) {
          attachments.push({
            id: part.body.attachmentId,
            messageId: payload.messageId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            data: part.body.data,
          });
        }
      }
    }
    
    return attachments;
  }

  /**
   * Extract participants from Gmail message
   */
  private extractParticipants(message: any): string[] {
    const headers = message.payload?.headers || [];
    const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
    const toHeader = headers.find((h: any) => h.name.toLowerCase() === 'to');
    
    const participants = [];
    if (fromHeader?.value) participants.push(fromHeader.value);
    if (toHeader?.value) participants.push(...toHeader.value.split(', '));
    
    return participants;
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
 * Factory function to create Gmail service
 */
export function createGmailService(config: GmailConfig): GmailService {
  return new GmailService(config);
}
