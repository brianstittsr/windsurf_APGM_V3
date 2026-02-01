/**
 * GoHighLevel BMAD Orchestrator Service
 * Manages all GHL API interactions with comprehensive scope support
 */

import { ApiConfigService } from '@/config/apiConfig';

export interface GHLConfig {
  apiKey: string;
  locationId?: string;
}

export class GHLOrchestrator {
  private apiKey: string;
  private locationId?: string;

  constructor(config: GHLConfig) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${ApiConfigService.getGhlBaseUrl()}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Version': ApiConfigService.getGhlApiVersion(),
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // ==================== BUSINESSES ====================
  async getBusinesses() {
    return this.makeRequest('/businesses');
  }

  // ==================== CALENDARS ====================
  async getCalendars() {
    return this.makeRequest('/calendars');
  }

  async getCalendar(calendarId: string) {
    return this.makeRequest(`/calendars/${calendarId}`);
  }

  async getCalendarAppointments(calendarId: string) {
    return this.makeRequest(`/calendars/${calendarId}/appointments`);
  }

  async createAppointment(calendarId: string, appointmentData: any) {
    return this.makeRequest(`/calendars/${calendarId}/appointments`, 'POST', appointmentData);
  }

  async updateAppointment(appointmentId: string, appointmentData: any) {
    return this.makeRequest(`/calendars/events/appointments/${appointmentId}`, 'PUT', appointmentData);
  }

  async getCalendarGroups() {
    return this.makeRequest('/calendars/groups');
  }

  async getCalendarResources() {
    return this.makeRequest('/calendars/resources');
  }

  async getCalendarEvents() {
    return this.makeRequest('/calendars/events');
  }

  async getAvailableSlots(calendarId: string, startDate: string, endDate: string) {
    const queryParams = new URLSearchParams({
      startDate,
      endDate
    });
    return this.makeRequest(`/calendars/${calendarId}/slots?${queryParams.toString()}`);
  }

  // ==================== CAMPAIGNS ====================
  async getCampaigns() {
    return this.makeRequest('/campaigns');
  }

  // ==================== CONTACTS ====================
  async getContacts(params?: { limit?: number; skip?: number; query?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.query) queryParams.append('query', params.query);
    
    return this.makeRequest(`/contacts/?${queryParams.toString()}`);
  }

  async getContact(contactId: string) {
    return this.makeRequest(`/contacts/${contactId}`);
  }

  async createContact(contactData: any) {
    return this.makeRequest('/contacts/', 'POST', contactData);
  }

  async updateContact(contactId: string, contactData: any) {
    return this.makeRequest(`/contacts/${contactId}`, 'PUT', contactData);
  }

  async deleteContact(contactId: string) {
    return this.makeRequest(`/contacts/${contactId}`, 'DELETE');
  }

  // ==================== CONVERSATIONS ====================
  async getConversations() {
    return this.makeRequest('/conversations');
  }

  async getConversation(conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`);
  }

  async sendMessage(conversationId: string, message: any) {
    return this.makeRequest(`/conversations/${conversationId}/messages`, 'POST', message);
  }

  // ==================== COURSES ====================
  async getCourses() {
    return this.makeRequest('/courses');
  }

  // ==================== FORMS ====================
  async getForms() {
    return this.makeRequest('/forms');
  }

  async getFormSubmissions(formId: string) {
    return this.makeRequest(`/forms/${formId}/submissions`);
  }

  // ==================== INVOICES ====================
  async getInvoices() {
    return this.makeRequest('/invoices');
  }

  async createInvoice(invoiceData: any) {
    return this.makeRequest('/invoices', 'POST', invoiceData);
  }

  async getInvoiceSchedules() {
    return this.makeRequest('/invoices/schedules');
  }

  async getInvoiceTemplates() {
    return this.makeRequest('/invoices/templates');
  }

  // ==================== LINKS ====================
  async getLinks() {
    return this.makeRequest('/links');
  }

  // ==================== LOCATIONS ====================
  async getLocations() {
    return this.makeRequest('/locations/');
  }

  async getLocation(locationId: string) {
    return this.makeRequest(`/locations/${locationId}`);
  }

  // ==================== OPPORTUNITIES (PIPELINES) ====================
  async getOpportunities() {
    return this.makeRequest('/opportunities');
  }

  async getOpportunity(opportunityId: string) {
    return this.makeRequest(`/opportunities/${opportunityId}`);
  }

  async createOpportunity(opportunityData: any) {
    return this.makeRequest('/opportunities', 'POST', opportunityData);
  }

  async updateOpportunity(opportunityId: string, opportunityData: any) {
    return this.makeRequest(`/opportunities/${opportunityId}`, 'PUT', opportunityData);
  }

  async getPipelines() {
    return this.makeRequest('/opportunities/pipelines');
  }

  // ==================== SURVEYS ====================
  async getSurveys() {
    return this.makeRequest('/surveys');
  }

  async getSurveySubmissions(surveyId: string) {
    return this.makeRequest(`/surveys/${surveyId}/submissions`);
  }

  // ==================== WORKFLOWS ====================
  async getWorkflows() {
    return this.makeRequest('/workflows');
  }

  async getWorkflow(workflowId: string) {
    return this.makeRequest(`/workflows/${workflowId}`);
  }

  // ==================== OAUTH ====================
  async getOAuthScopes() {
    return this.makeRequest('/oauth/scopes');
  }

  // ==================== SAAS ====================
  async getSaaSProducts() {
    return this.makeRequest('/saas/products');
  }

  // ==================== PAYMENTS ====================
  async getPaymentTransactions() {
    return this.makeRequest('/payments/transactions');
  }

  async createPaymentTransaction(transactionData: any) {
    return this.makeRequest('/payments/transactions', 'POST', transactionData);
  }

  async getPaymentIntegrations() {
    return this.makeRequest('/payments/integrations');
  }

  // ==================== CUSTOM FIELDS ====================
  async getCustomFields() {
    return this.makeRequest('/custom-fields');
  }

  async createCustomField(fieldData: any) {
    return this.makeRequest('/custom-fields', 'POST', fieldData);
  }

  async updateCustomField(fieldId: string, fieldData: any) {
    return this.makeRequest(`/custom-fields/${fieldId}`, 'PUT', fieldData);
  }

  // ==================== CUSTOM VALUES ====================
  async getCustomValues(contactId: string) {
    return this.makeRequest(`/contacts/${contactId}/custom-values`);
  }

  async updateCustomValues(contactId: string, values: any) {
    return this.makeRequest(`/contacts/${contactId}/custom-values`, 'PUT', values);
  }

  // ==================== TAGS ====================
  async getTags() {
    return this.makeRequest('/tags');
  }

  async createTag(tagData: any) {
    return this.makeRequest('/tags', 'POST', tagData);
  }

  async addTagToContact(contactId: string, tagId: string) {
    return this.makeRequest(`/contacts/${contactId}/tags/${tagId}`, 'POST');
  }

  async removeTagFromContact(contactId: string, tagId: string) {
    return this.makeRequest(`/contacts/${contactId}/tags/${tagId}`, 'DELETE');
  }

  // ==================== TASKS ====================
  async getTasks() {
    return this.makeRequest('/tasks');
  }

  async createTask(taskData: any) {
    return this.makeRequest('/tasks', 'POST', taskData);
  }

  async updateTask(taskId: string, taskData: any) {
    return this.makeRequest(`/tasks/${taskId}`, 'PUT', taskData);
  }

  async deleteTask(taskId: string) {
    return this.makeRequest(`/tasks/${taskId}`, 'DELETE');
  }

  // ==================== NOTES ====================
  async getNotes(contactId: string) {
    return this.makeRequest(`/contacts/${contactId}/notes`);
  }

  async createNote(contactId: string, noteData: any) {
    return this.makeRequest(`/contacts/${contactId}/notes`, 'POST', noteData);
  }

  async updateNote(noteId: string, noteData: any) {
    return this.makeRequest(`/notes/${noteId}`, 'PUT', noteData);
  }

  async deleteNote(noteId: string) {
    return this.makeRequest(`/notes/${noteId}`, 'DELETE');
  }

  // ==================== MEDIA ====================
  async uploadMedia(file: File, locationId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('locationId', locationId);
    
    const response = await fetch(`${ApiConfigService.getGhlBaseUrl()}/medias/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Version': ApiConfigService.getGhlApiVersion()
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getMediaFiles() {
    return this.makeRequest('/medias');
  }

  async deleteMedia(mediaId: string) {
    return this.makeRequest(`/medias/${mediaId}`, 'DELETE');
  }

  // ==================== USERS ====================
  async getUsers() {
    return this.makeRequest('/users');
  }

  async getUser(userId: string) {
    return this.makeRequest(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: any) {
    return this.makeRequest(`/users/${userId}`, 'PUT', userData);
  }

  // ==================== COMPANIES ====================
  async getCompanies() {
    return this.makeRequest('/companies');
  }

  async getCompany(companyId: string) {
    return this.makeRequest(`/companies/${companyId}`);
  }

  // ==================== SNAPSHOTS ====================
  async getSnapshots() {
    return this.makeRequest('/snapshots');
  }

  async deploySnapshot(snapshotId: string, locationId: string) {
    return this.makeRequest('/snapshots/deploy', 'POST', { snapshotId, locationId });
  }

  // ==================== TRIGGERS ====================
  async getTriggers() {
    return this.makeRequest('/triggers');
  }

  async createTrigger(triggerData: any) {
    return this.makeRequest('/triggers', 'POST', triggerData);
  }

  // ==================== LINKS (URL SHORTENER) ====================
  async createShortLink(linkData: any) {
    return this.makeRequest('/links', 'POST', linkData);
  }

  async getShortLinks() {
    return this.makeRequest('/links');
  }

  // ==================== SOCIAL MEDIA POSTING ====================
  async createSocialPost(postData: any) {
    return this.makeRequest('/social/posts', 'POST', postData);
  }

  async getSocialPosts() {
    return this.makeRequest('/social/posts');
  }

  async getSocialAccounts() {
    return this.makeRequest('/social/accounts');
  }

  // ==================== BMAD ORCHESTRATOR METHODS ====================
  
  /**
   * Sync all contacts from GHL to local database
   */
  async syncContacts() {
    const contacts = await this.getContacts({ limit: 100 });
    return contacts;
  }

  /**
   * Sync all workflows from GHL
   */
  async syncWorkflows() {
    const workflows = await this.getWorkflows();
    return workflows;
  }

  /**
   * Create a new contact and add to workflow
   */
  async createContactAndAddToWorkflow(contactData: any, workflowId: string) {
    const contact = await this.createContact(contactData);
    // Add logic to add contact to workflow
    return contact;
  }

  /**
   * Get full customer journey (contacts, opportunities, appointments)
   */
  async getCustomerJourney(contactId: string) {
    const [contact, opportunities, conversations] = await Promise.all([
      this.getContact(contactId),
      this.getOpportunities(), // Filter by contactId in production
      this.getConversations()  // Filter by contactId in production
    ]);

    return {
      contact,
      opportunities,
      conversations
    };
  }

  /**
   * Orchestrate appointment booking workflow
   */
  async orchestrateAppointmentBooking(data: {
    contactData: any;
    calendarId: string;
    appointmentData: any;
    workflowId?: string;
  }) {
    // 1. Create or update contact
    const contact = await this.createContact(data.contactData);
    
    // 2. Create appointment
    const appointment = await this.createAppointment(data.calendarId, {
      ...data.appointmentData,
      contactId: contact.id
    });

    // 3. Trigger workflow if specified
    if (data.workflowId) {
      // Add contact to workflow
    }

    return {
      contact,
      appointment
    };
  }

  /**
   * Orchestrate invoice creation and send
   */
  async orchestrateInvoiceWorkflow(data: {
    contactId: string;
    invoiceData: any;
    sendEmail?: boolean;
  }) {
    const invoice = await this.createInvoice({
      ...data.invoiceData,
      contactId: data.contactId
    });

    if (data.sendEmail) {
      // Send invoice email via GHL
    }

    return invoice;
  }
}

export default GHLOrchestrator;
