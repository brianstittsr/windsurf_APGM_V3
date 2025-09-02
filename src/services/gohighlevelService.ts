'use client';

interface GoHighLevelConfig {
  apiKey: string;
  locationId: string;
  baseUrl: string;
}

interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags?: string[];
  customFields?: Record<string, any>;
  source?: string;
  dateAdded?: string;
}

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  triggerType: string;
  steps: WorkflowStep[];
  stats: {
    enrolled: number;
    completed: number;
    active: number;
  };
}

interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'delay' | 'condition' | 'tag' | 'task';
  name: string;
  settings: Record<string, any>;
}

interface Lead {
  id: string;
  contactId: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  value?: number;
  dateCreated: string;
  lastActivity?: string;
  assignedTo?: string;
  notes?: string[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string;
  name: string;
  position: number;
  leads: Lead[];
}

export class GoHighLevelService {
  private config: GoHighLevelConfig;

  constructor(config: GoHighLevelConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`GoHighLevel API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GoHighLevel API Request Failed:', error);
      throw error;
    }
  }

  // Contact Management
  async createContact(contact: Contact): Promise<Contact> {
    const response = await this.makeRequest(`/contacts/`, {
      method: 'POST',
      body: JSON.stringify({
        ...contact,
        locationId: this.config.locationId,
      }),
    });
    return response.contact;
  }

  async getContacts(params?: {
    limit?: number;
    offset?: number;
    query?: string;
    tags?: string[];
  }): Promise<{ contacts: Contact[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.query) searchParams.append('query', params.query);
    if (params?.tags) params.tags.forEach(tag => searchParams.append('tags', tag));

    const response = await this.makeRequest(`/contacts/?${searchParams.toString()}`);
    return {
      contacts: response.contacts || [],
      total: response.total || 0,
    };
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
    const response = await this.makeRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.contact;
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.makeRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Workflow Management
  async getWorkflows(): Promise<Workflow[]> {
    const response = await this.makeRequest(`/workflows/`);
    return response.workflows || [];
  }

  async getWorkflow(workflowId: string): Promise<Workflow> {
    const response = await this.makeRequest(`/workflows/${workflowId}`);
    return response.workflow;
  }

  async enrollContactInWorkflow(contactId: string, workflowId: string): Promise<void> {
    await this.makeRequest(`/workflows/${workflowId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        contactId,
      }),
    });
  }

  async removeContactFromWorkflow(contactId: string, workflowId: string): Promise<void> {
    await this.makeRequest(`/workflows/${workflowId}/unsubscribe`, {
      method: 'POST',
      body: JSON.stringify({
        contactId,
      }),
    });
  }

  // Lead Management
  async createLead(lead: Omit<Lead, 'id' | 'dateCreated'>): Promise<Lead> {
    const response = await this.makeRequest(`/opportunities/`, {
      method: 'POST',
      body: JSON.stringify({
        ...lead,
        locationId: this.config.locationId,
      }),
    });
    return response.opportunity;
  }

  async getLeads(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    pipelineId?: string;
  }): Promise<{ leads: Lead[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.pipelineId) searchParams.append('pipelineId', params.pipelineId);

    const response = await this.makeRequest(`/opportunities/?${searchParams.toString()}`);
    return {
      leads: response.opportunities || [],
      total: response.total || 0,
    };
  }

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    const response = await this.makeRequest(`/opportunities/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.opportunity;
  }

  // Pipeline Management
  async getPipelines(): Promise<Pipeline[]> {
    const response = await this.makeRequest(`/pipelines/`);
    return response.pipelines || [];
  }

  async getPipeline(pipelineId: string): Promise<Pipeline> {
    const response = await this.makeRequest(`/pipelines/${pipelineId}`);
    return response.pipeline;
  }

  // Reporting and Analytics
  async getLeadReports(params: {
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    leadsBySource: Record<string, number>;
    leadsByStatus: Record<string, number>;
    timeline: Array<{
      date: string;
      leads: number;
      conversions: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append('startDate', params.startDate);
    searchParams.append('endDate', params.endDate);
    if (params.groupBy) searchParams.append('groupBy', params.groupBy);

    const response = await this.makeRequest(`/reporting/leads?${searchParams.toString()}`);
    return response;
  }

  async getWorkflowReports(workflowId: string): Promise<{
    totalEnrolled: number;
    completed: number;
    active: number;
    dropped: number;
    completionRate: number;
    averageCompletionTime: number;
    stepPerformance: Array<{
      stepId: string;
      stepName: string;
      completed: number;
      dropped: number;
    }>;
  }> {
    const response = await this.makeRequest(`/workflows/${workflowId}/reports`);
    return response;
  }

  // Tag Management
  async addTagsToContact(contactId: string, tags: string[]): Promise<void> {
    await this.makeRequest(`/contacts/${contactId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  async removeTagsFromContact(contactId: string, tags: string[]): Promise<void> {
    await this.makeRequest(`/contacts/${contactId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tags }),
    });
  }

  async getTags(): Promise<string[]> {
    const response = await this.makeRequest(`/tags/`);
    return response.tags || [];
  }

  // Custom Field Management
  async getCustomFields(): Promise<Array<{
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
    options?: string[];
  }>> {
    const response = await this.makeRequest(`/custom-fields/`);
    return response.customFields || [];
  }

  // Integration Helpers
  async syncContactFromBooking(bookingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    serviceType: string;
    appointmentDate: string;
    source?: string;
  }): Promise<Contact> {
    const contact = await this.createContact({
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      email: bookingData.email,
      phone: bookingData.phone,
      tags: ['website-booking', bookingData.serviceType],
      customFields: {
        'appointment_date': bookingData.appointmentDate,
        'service_type': bookingData.serviceType,
      },
      source: bookingData.source || 'website',
    });

    // Create lead opportunity
    await this.createLead({
      contactId: contact.id!,
      source: 'website',
      status: 'new',
      value: 600, // Default service value
      assignedTo: 'auto',
    });

    return contact;
  }

  async triggerWorkflowForNewClient(contactId: string): Promise<void> {
    // Get all workflows and find the new client workflow
    const workflows = await this.getWorkflows();
    const newClientWorkflow = workflows.find(w => 
      w.name.toLowerCase().includes('new client') || 
      w.triggerType === 'new_contact'
    );

    if (newClientWorkflow) {
      await this.enrollContactInWorkflow(contactId, newClientWorkflow.id);
    }
  }
}

// Environment configuration helper
export function createGoHighLevelService(): GoHighLevelService | null {
  const apiKey = process.env.NEXT_PUBLIC_GOHIGHLEVEL_API_KEY;
  const locationId = process.env.NEXT_PUBLIC_GOHIGHLEVEL_LOCATION_ID;
  const baseUrl = process.env.NEXT_PUBLIC_GOHIGHLEVEL_BASE_URL || 'https://services.leadconnectorhq.com';

  if (!apiKey || !locationId) {
    console.warn('GoHighLevel API credentials not configured');
    return null;
  }

  return new GoHighLevelService({
    apiKey,
    locationId,
    baseUrl,
  });
}
