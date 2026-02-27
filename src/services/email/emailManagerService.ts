/**
 * Email Manager Service
 * Central service for managing email operations across Gmail and Outlook
 */

import { createGmailService, GmailMessage, GmailService } from './gmailService';
import { createOutlookService, OutlookMessage, OutlookService } from './outlookService';
import { ApiConfigService } from '@/config/apiConfig';

export interface EmailAccount {
  id: string;
  provider: 'google' | 'microsoft';
  email: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  connected: boolean;
  lastSync?: Date;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
}

export interface UnifiedEmailMessage {
  id: string;
  provider: 'google' | 'microsoft';
  accountId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: string;
  body: string;
  bodyPlain?: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  importance?: 'low' | 'normal' | 'high';
  labels?: string[];
  categories?: string[];
  conversationId?: string;
  threadId?: string;
}

export interface EmailFilter {
  id: string;
  name: string;
  conditions: Array<{
    field: 'from' | 'to' | 'subject' | 'body' | 'importance' | 'hasAttachments';
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex';
    value: string;
  }>;
  actions: Array<{
    type: 'markRead' | 'markUnread' | 'addLabel' | 'addCategory' | 'forward' | 'autoResponse';
    value?: string;
  }>;
  enabled: boolean;
}

export interface AutoResponse {
  id: string;
  name: string;
  trigger: {
    type: 'keyword' | 'sender' | 'subject' | 'all';
    value: string;
  };
  response: {
    subject: string;
    body: string;
  };
  enabled: boolean;
}

export class EmailManagerService {
  private gmailService: GmailService | null = null;
  private outlookService: OutlookService | null = null;
  private accounts: Map<string, EmailAccount> = new Map();
  private filters: EmailFilter[] = [];
  private autoResponses: AutoResponse[] = [];

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize Gmail service with configuration
    const gmailConfig = {
      clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_GMAIL_REDIRECT_URI || '',
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    };

    // Initialize Outlook service with configuration
    const outlookConfig = {
      clientId: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID || '',
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_OUTLOOK_REDIRECT_URI || '',
      tenantId: process.env.NEXT_PUBLIC_OUTLOOK_TENANT_ID || 'common'
    };

    try {
      this.gmailService = createGmailService(gmailConfig);
      this.outlookService = createOutlookService(outlookConfig);
    } catch (error) {
      console.error('Failed to initialize email services:', error);
    }
  }

  /**
   * Connect Gmail account
   */
  async connectGmailAccount(authCode: string): Promise<EmailAccount> {
    if (!this.gmailService) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const tokenData = await this.gmailService.exchangeCodeForToken(authCode);
      const profile = await this.gmailService.getUserProfile();

      const account: EmailAccount = {
        id: `gmail-${Date.now()}`,
        provider: 'google',
        email: profile.emailAddress,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: new Date(Date.now() + tokenData.expiresIn * 1000),
        connected: true,
        status: 'connected',
        lastSync: new Date()
      };

      this.accounts.set(account.id, account);
      return account;
    } catch (error) {
      console.error('Failed to connect Gmail account:', error);
      throw new Error('Failed to connect Gmail account');
    }
  }

  /**
   * Connect Outlook account
   */
  async connectOutlookAccount(authCode: string): Promise<EmailAccount> {
    if (!this.outlookService) {
      throw new Error('Outlook service not initialized');
    }

    try {
      const tokenData = await this.outlookService.exchangeCodeForToken(authCode);
      const profile = await this.outlookService.getUserProfile();

      const account: EmailAccount = {
        id: `outlook-${Date.now()}`,
        provider: 'microsoft',
        email: profile.mail,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: new Date(Date.now() + tokenData.expiresIn * 1000),
        connected: true,
        status: 'connected',
        lastSync: new Date()
      };

      this.accounts.set(account.id, account);
      return account;
    } catch (error) {
      console.error('Failed to connect Outlook account:', error);
      throw new Error('Failed to connect Outlook account');
    }
  }

  /**
   * Get unified email messages from all connected accounts
   */
  async getUnifiedMessages(options: {
    accountIds?: string[];
    maxResults?: number;
    folder?: string;
    isRead?: boolean;
    searchQuery?: string;
  } = {}): Promise<UnifiedEmailMessage[]> {
    const messages: UnifiedEmailMessage[] = [];
    const accountsToSync = options.accountIds 
      ? this.accounts.filter(acc => options.accountIds!.includes(acc.id))
      : Array.from(this.accounts.values()).filter(acc => acc.connected);

    for (const account of accountsToSync) {
      try {
        if (account.provider === 'google' && this.gmailService) {
          const gmailMessages = await this.getGmailMessages(account, options);
          messages.push(...gmailMessages);
        } else if (account.provider === 'microsoft' && this.outlookService) {
          const outlookMessages = await this.getOutlookMessages(account, options);
          messages.push(...outlookMessages);
        }
      } catch (error) {
        console.error(`Failed to sync messages for account ${account.id}:`, error);
      }
    }

    return this.applyFilters(messages, options);
  }

  /**
   * Send email message
   */
  async sendEmail(messageData: {
    accountId: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: 'HTML' | 'Text';
    importance?: 'low' | 'normal' | 'high';
  }): Promise<{ id: string; provider: string }> {
    const account = this.accounts.get(messageData.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      if (account.provider === 'google' && this.gmailService) {
        const result = await this.gmailService.sendMessage({
          to: messageData.to,
          cc: messageData.cc,
          bcc: messageData.bcc,
          subject: messageData.subject,
          body: messageData.body
        });
        return { id: result.id, provider: 'google' };
      } else if (account.provider === 'microsoft' && this.outlookService) {
        const result = await this.outlookService.sendMessage({
          to: messageData.to,
          cc: messageData.cc,
          bcc: messageData.bcc,
          subject: messageData.subject,
          body: messageData.body,
          bodyType: messageData.bodyType || 'HTML',
          importance: messageData.importance || 'normal'
        });
        return { id: result.id, provider: 'microsoft' };
      } else {
        throw new Error('Unsupported email provider');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Mark message as read/unread
   */
  async markMessageAsRead(messageId: string, provider: 'google' | 'microsoft', isRead: boolean): Promise<void> {
    try {
      if (provider === 'google' && this.gmailService) {
        await this.gmailService.markMessageAsRead(messageId, isRead);
      } else if (provider === 'microsoft' && this.outlookService) {
        await this.outlookService.markMessageAsRead(messageId, isRead);
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  /**
   * Star/unstar message
   */
  async starMessage(messageId: string, provider: 'google' | 'microsoft', isStarred: boolean): Promise<void> {
    try {
      if (provider === 'google' && this.gmailService) {
        await this.gmailService.starMessage(messageId, isStarred);
      } else if (provider === 'microsoft' && this.outlookService) {
        // Outlook doesn't have star functionality, could implement with categories
        console.log('Star functionality not available for Outlook');
      }
    } catch (error) {
      console.error('Failed to star message:', error);
      throw new Error('Failed to star message');
    }
  }

  /**
   * Search emails across all connected accounts
   */
  async searchEmails(query: string, options: {
    accountIds?: string[];
    maxResults?: number;
    folder?: string;
  } = {}): Promise<UnifiedEmailMessage[]> {
    const messages: UnifiedEmailMessage[] = [];
    const accountsToSearch = options.accountIds 
      ? this.accounts.filter(acc => options.accountIds!.includes(acc.id))
      : Array.from(this.accounts.values()).filter(acc => acc.connected);

    for (const account of accountsToSearch) {
      try {
        if (account.provider === 'google' && this.gmailService) {
          const searchResults = await this.gmailService.searchMessages(query, {
            maxResults: options.maxResults
          });
          
          // Fetch full message details for search results
          for (const result of searchResults.messages) {
            const fullMessage = await this.gmailService.getMessage(result.id);
            messages.push(this.mapGmailToUnified(fullMessage, account.id));
          }
        } else if (account.provider === 'microsoft' && this.outlookService) {
          const searchResults = await this.outlookService.searchMessages(query, {
            maxResults: options.maxResults
          });
          
          for (const result of searchResults.value) {
            messages.push(this.mapOutlookToUnified(result, account.id));
          }
        }
      } catch (error) {
        console.error(`Failed to search emails for account ${account.id}:`, error);
      }
    }

    return messages;
  }

  /**
   * Apply filters to messages
   */
  private applyFilters(messages: UnifiedEmailMessage[], options: any): UnifiedEmailMessage[] {
    let filteredMessages = messages;

    // Apply search query filter
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredMessages = filteredMessages.filter(msg => 
        msg.subject.toLowerCase().includes(query) ||
        msg.from.toLowerCase().includes(query) ||
        msg.body.toLowerCase().includes(query)
      );
    }

    // Apply read status filter
    if (options.isRead !== undefined) {
      filteredMessages = filteredMessages.filter(msg => msg.isRead === options.isRead);
    }

    // Apply enabled filters
    const enabledFilters = this.filters.filter(filter => filter.enabled);
    
    for (const filter of enabledFilters) {
      filteredMessages = filteredMessages.filter(message => {
        return filter.conditions.every(condition => {
          const fieldValue = this.getMessageFieldValue(message, condition.field);
          return this.evaluateCondition(fieldValue, condition.operator, condition.value);
        });
      });

      // Apply filter actions
      for (const message of filteredMessages) {
        for (const action of filter.actions) {
          this.applyFilterAction(message, action);
        }
      }
    }

    return filteredMessages;
  }

  /**
   * Get Gmail messages and convert to unified format
   */
  private async getGmailMessages(account: EmailAccount, options: any): Promise<UnifiedEmailMessage[]> {
    if (!this.gmailService) return [];

    try {
      const threads = await this.gmailService.getThreads({
        maxResults: options.maxResults || 50
      });

      const messages: UnifiedEmailMessage[] = [];
      
      for (const thread of threads.threads) {
        const fullThread = await this.gmailService.getThread(thread.id);
        
        for (const message of fullThread.messages) {
          messages.push(this.mapGmailToUnified(message, account.id));
        }
      }

      return messages;
    } catch (error) {
      console.error('Failed to get Gmail messages:', error);
      return [];
    }
  }

  /**
   * Get Outlook messages and convert to unified format
   */
  private async getOutlookMessages(account: EmailAccount, options: any): Promise<UnifiedEmailMessage[]> {
    if (!this.outlookService) return [];

    try {
      const messages = await this.outlookService.getMessages({
        maxResults: options.maxResults || 50
      });

      return messages.value.map(msg => this.mapOutlookToUnified(msg, account.id));
    } catch (error) {
      console.error('Failed to get Outlook messages:', error);
      return [];
    }
  }

  /**
   * Map Gmail message to unified format
   */
  private mapGmailToUnified(gmailMessage: GmailMessage, accountId: string): UnifiedEmailMessage {
    return {
      id: gmailMessage.id,
      provider: 'google',
      accountId,
      subject: gmailMessage.subject,
      from: gmailMessage.from,
      to: gmailMessage.to,
      cc: gmailMessage.cc,
      bcc: gmailMessage.bcc,
      date: gmailMessage.date,
      body: gmailMessage.body,
      bodyPlain: gmailMessage.bodyPlain,
      isRead: gmailMessage.isRead,
      isStarred: gmailMessage.isStarred,
      hasAttachments: gmailMessage.attachments?.length > 0 || false,
      labels: gmailMessage.labels,
      threadId: gmailMessage.threadId
    };
  }

  /**
   * Map Outlook message to unified format
   */
  private mapOutlookToUnified(outlookMessage: OutlookMessage, accountId: string): UnifiedEmailMessage {
    return {
      id: outlookMessage.id,
      provider: 'microsoft',
      accountId,
      subject: outlookMessage.subject,
      from: outlookMessage.from.emailAddress.address,
      to: outlookMessage.to.map(recipient => recipient.emailAddress.address),
      cc: outlookMessage.cc?.map(recipient => recipient.emailAddress.address),
      bcc: outlookMessage.bcc?.map(recipient => recipient.emailAddress.address),
      date: outlookMessage.receivedDateTime,
      body: outlookMessage.body.content,
      bodyPlain: outlookMessage.bodyPreview,
      isRead: outlookMessage.isRead,
      isStarred: false, // Outlook doesn't have star functionality
      hasAttachments: outlookMessage.hasAttachments,
      importance: outlookMessage.importance,
      categories: outlookMessage.categories,
      conversationId: outlookMessage.conversationId
    };
  }

  /**
   * Get message field value for filtering
   */
  private getMessageFieldValue(message: UnifiedEmailMessage, field: string): string {
    switch (field) {
      case 'from': return message.from;
      case 'to': return message.to.join(', ');
      case 'subject': return message.subject;
      case 'body': return message.body;
      case 'importance': return message.importance || '';
      case 'hasAttachments': return message.hasAttachments ? 'true' : 'false';
      default: return '';
    }
  }

  /**
   * Evaluate filter condition
   */
  private evaluateCondition(fieldValue: string, operator: string, conditionValue: string): boolean {
    const value = fieldValue.toLowerCase();
    const condition = conditionValue.toLowerCase();

    switch (operator) {
      case 'contains': return value.includes(condition);
      case 'equals': return value === condition;
      case 'startsWith': return value.startsWith(condition);
      case 'endsWith': return value.endsWith(condition);
      case 'regex': 
        try {
          const regex = new RegExp(condition);
          return regex.test(value);
        } catch {
          return false;
        }
      default: return false;
    }
  }

  /**
   * Apply filter action to message
   */
  private applyFilterAction(message: UnifiedEmailMessage, action: any): void {
    switch (action.type) {
      case 'markRead':
        message.isRead = true;
        break;
      case 'markUnread':
        message.isRead = false;
        break;
      case 'addLabel':
        message.labels = message.labels || [];
        message.labels.push(action.value);
        break;
      case 'addCategory':
        message.categories = message.categories || [];
        message.categories.push(action.value);
        break;
      case 'autoResponse':
        // Trigger auto response logic
        this.triggerAutoResponse(message, action.value);
        break;
    }
  }

  /**
   * Trigger auto response
   */
  private triggerAutoResponse(message: UnifiedEmailMessage, responseId: string): void {
    const autoResponse = this.autoResponses.find(ar => ar.id === responseId && ar.enabled);
    if (!autoResponse) return;

    // Check if trigger conditions are met
    const triggerValue = autoResponse.trigger.value.toLowerCase();
    const messageText = `${message.subject} ${message.body}`.toLowerCase();

    let shouldTrigger = false;
    switch (autoResponse.trigger.type) {
      case 'keyword':
        shouldTrigger = messageText.includes(triggerValue);
        break;
      case 'sender':
        shouldTrigger = message.from.toLowerCase().includes(triggerValue);
        break;
      case 'subject':
        shouldTrigger = message.subject.toLowerCase().includes(triggerValue);
        break;
      case 'all':
        shouldTrigger = true;
        break;
    }

    if (shouldTrigger) {
      console.log(`Auto response triggered for message ${message.id}:`, autoResponse.response);
      // Here you would send the auto response
    }
  }

  /**
   * Get connected accounts
   */
  getConnectedAccounts(): EmailAccount[] {
    return Array.from(this.accounts.values()).filter(acc => acc.connected);
  }

  /**
   * Disconnect email account
   */
  disconnectAccount(accountId: string): void {
    this.accounts.delete(accountId);
  }

  /**
   * Add email filter
   */
  addFilter(filter: EmailFilter): void {
    this.filters.push(filter);
  }

  /**
   * Remove email filter
   */
  removeFilter(filterId: string): void {
    this.filters = this.filters.filter(filter => filter.id !== filterId);
  }

  /**
   * Add auto response
   */
  addAutoResponse(autoResponse: AutoResponse): void {
    this.autoResponses.push(autoResponse);
  }

  /**
   * Remove auto response
   */
  removeAutoResponse(responseId: string): void {
    this.autoResponses = this.autoResponses.filter(ar => ar.id !== responseId);
  }

  /**
   * Sync all connected accounts
   */
  async syncAllAccounts(): Promise<void> {
    const accounts = this.getConnectedAccounts();
    
    for (const account of accounts) {
      try {
        account.status = 'syncing';
        // Perform sync operations
        account.lastSync = new Date();
        account.status = 'connected';
      } catch (error) {
        console.error(`Failed to sync account ${account.id}:`, error);
        account.status = 'error';
      }
    }
  }
}

/**
 * Factory function to create email manager service
 */
export function createEmailManagerService(): EmailManagerService {
  return new EmailManagerService();
}
