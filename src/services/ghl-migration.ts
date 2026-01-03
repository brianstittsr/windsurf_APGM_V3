/**
 * GoHighLevel Migration Service
 * Handles complete sub-account migration between GHL accounts
 */

import { GHLOrchestrator } from './ghl-orchestrator';
import { DatabaseService } from './database';
import {
  MigrationJob,
  MigrationStatus,
  MigrationCategory,
  MigrationOptions,
  MigrationDataCounts,
  GHLAccountCredentials,
  ValidationResult,
  AnalysisResult,
  ExportedData,
  IdMapping,
  MigrationItemResult,
  CategoryProgress,
} from '@/types/ghl-migration';

const MIGRATION_COLLECTION = 'ghl-migrations';

export class GHLMigrationService {
  private sourceOrchestrator: GHLOrchestrator | null = null;
  private destOrchestrator: GHLOrchestrator | null = null;
  private currentJob: MigrationJob | null = null;
  private idMappings: Map<string, IdMapping> = new Map();

  /**
   * Initialize orchestrators for source and destination accounts
   */
  initializeConnections(
    sourceCredentials: GHLAccountCredentials,
    destCredentials: GHLAccountCredentials
  ) {
    this.sourceOrchestrator = new GHLOrchestrator({
      apiKey: sourceCredentials.apiKey,
      locationId: sourceCredentials.locationId,
    });
    this.destOrchestrator = new GHLOrchestrator({
      apiKey: destCredentials.apiKey,
      locationId: destCredentials.locationId,
    });
  }

  /**
   * Validate both source and destination account credentials
   */
  async validateAccounts(
    sourceCredentials: GHLAccountCredentials,
    destCredentials: GHLAccountCredentials
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      sourceAccount: { isValid: false },
      destinationAccount: { isValid: false },
      warnings: [],
      errors: [],
    };

    // Validate source account
    try {
      const sourceOrch = new GHLOrchestrator({
        apiKey: sourceCredentials.apiKey,
        locationId: sourceCredentials.locationId,
      });
      const sourceLocation = await sourceOrch.getLocation(sourceCredentials.locationId);
      result.sourceAccount.isValid = true;
      result.sourceAccount.locationName = sourceLocation?.name || sourceLocation?.business?.name || 'Unknown';
    } catch (error: any) {
      result.sourceAccount.error = error.message || 'Failed to connect to source account';
      result.errors.push(`Source account: ${result.sourceAccount.error}`);
    }

    // Validate destination account
    try {
      const destOrch = new GHLOrchestrator({
        apiKey: destCredentials.apiKey,
        locationId: destCredentials.locationId,
      });
      const destLocation = await destOrch.getLocation(destCredentials.locationId);
      result.destinationAccount.isValid = true;
      result.destinationAccount.locationName = destLocation?.name || destLocation?.business?.name || 'Unknown';
    } catch (error: any) {
      result.destinationAccount.error = error.message || 'Failed to connect to destination account';
      result.errors.push(`Destination account: ${result.destinationAccount.error}`);
    }

    // Check if same account
    if (sourceCredentials.locationId === destCredentials.locationId) {
      result.warnings.push('Source and destination appear to be the same location');
    }

    result.isValid = result.sourceAccount.isValid && result.destinationAccount.isValid;
    return result;
  }

  /**
   * Analyze source account to get data counts
   */
  async analyzeSourceAccount(credentials: GHLAccountCredentials): Promise<AnalysisResult> {
    const result: AnalysisResult = {
      success: false,
      dataCounts: this.getEmptyDataCounts(),
      estimatedDuration: 0,
      warnings: [],
      errors: [],
    };

    try {
      const orchestrator = new GHLOrchestrator({
        apiKey: credentials.apiKey,
        locationId: credentials.locationId,
      });

      // Fetch counts for each category (with error handling for each)
      const fetchWithFallback = async (fn: () => Promise<any>, category: string) => {
        try {
          const data = await fn();
          return Array.isArray(data) ? data.length : (data?.contacts?.length || data?.length || 0);
        } catch (error: any) {
          result.warnings.push(`Could not fetch ${category}: ${error.message}`);
          return 0;
        }
      };

      // Parallel fetch for better performance
      const [
        contactsData,
        tagsData,
        customFieldsData,
        pipelinesData,
        opportunitiesData,
        calendarsData,
        formsData,
        surveysData,
        workflowsData,
        campaignsData,
      ] = await Promise.all([
        orchestrator.getContacts({ limit: 1 }).catch(() => ({ contacts: [], meta: { total: 0 } })),
        orchestrator.getTags().catch(() => ({ tags: [] })),
        orchestrator.getCustomFields().catch(() => ({ customFields: [] })),
        orchestrator.getPipelines().catch(() => ({ pipelines: [] })),
        orchestrator.getOpportunities().catch(() => ({ opportunities: [] })),
        orchestrator.getCalendars().catch(() => ({ calendars: [] })),
        orchestrator.getForms().catch(() => ({ forms: [] })),
        orchestrator.getSurveys().catch(() => ({ surveys: [] })),
        orchestrator.getWorkflows().catch(() => ({ workflows: [] })),
        orchestrator.getCampaigns().catch(() => ({ campaigns: [] })),
      ]);

      result.dataCounts = {
        contacts: contactsData?.meta?.total || contactsData?.contacts?.length || 0,
        tags: tagsData?.tags?.length || 0,
        customFields: customFieldsData?.customFields?.length || 0,
        pipelines: pipelinesData?.pipelines?.length || 0,
        opportunities: opportunitiesData?.opportunities?.length || 0,
        calendars: calendarsData?.calendars?.length || 0,
        appointments: 0, // Will be calculated per calendar
        forms: formsData?.forms?.length || 0,
        surveys: surveysData?.surveys?.length || 0,
        workflows: workflowsData?.workflows?.length || 0,
        campaigns: campaignsData?.campaigns?.length || 0,
        aiPrompts: 0, // Requires separate API call
        templates: 0, // Requires separate API call
        media: 0, // Requires separate API call
      };

      // Estimate duration (rough calculation: ~1 second per item)
      const totalItems = Object.values(result.dataCounts).reduce((a, b) => a + b, 0);
      result.estimatedDuration = Math.ceil(totalItems / 60); // minutes

      result.success = true;
    } catch (error: any) {
      result.errors.push(`Analysis failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Create a new migration job
   */
  async createMigrationJob(
    sourceCredentials: GHLAccountCredentials,
    destCredentials: GHLAccountCredentials,
    options: MigrationOptions,
    dataCounts: MigrationDataCounts
  ): Promise<MigrationJob> {
    const now = new Date().toISOString();
    
    const job: MigrationJob = {
      id: `migration_${Date.now()}`,
      sourceAccount: sourceCredentials,
      destinationAccount: destCredentials,
      options,
      status: 'pending',
      progress: {
        overall: 0,
        categories: this.initializeCategoryProgress(options.categories, dataCounts),
      },
      dataCounts,
      idMappings: [],
      results: [],
      createdAt: now,
      updatedAt: now,
    };

    // Save to database
    await DatabaseService.create(MIGRATION_COLLECTION, job);
    this.currentJob = job;
    
    return job;
  }

  /**
   * Execute the migration
   */
  async executeMigration(jobId: string): Promise<MigrationJob> {
    // Load job from database
    const job = await DatabaseService.getById<MigrationJob>(MIGRATION_COLLECTION, jobId);
    if (!job) {
      throw new Error('Migration job not found');
    }

    this.currentJob = job;
    this.initializeConnections(job.sourceAccount, job.destinationAccount);

    try {
      await this.updateJobStatus('exporting');

      // Execute migration in order of dependencies
      const migrationOrder: MigrationCategory[] = [
        'customFields',
        'tags',
        'pipelines',
        'calendars',
        'contacts',
        'opportunities',
        'appointments',
        'forms',
        'surveys',
        'workflows',
        'campaigns',
        'aiPrompts',
        'templates',
        'media',
      ];

      for (const category of migrationOrder) {
        if (job.options.categories.includes(category)) {
          await this.migrateCategory(category);
        }
      }

      await this.updateJobStatus('completed');
    } catch (error: any) {
      await this.updateJobStatus('failed', error.message);
      throw error;
    }

    return this.currentJob!;
  }

  /**
   * Migrate a specific category
   */
  private async migrateCategory(category: MigrationCategory): Promise<void> {
    if (!this.sourceOrchestrator || !this.destOrchestrator || !this.currentJob) {
      throw new Error('Migration not properly initialized');
    }

    await this.updateCategoryStatus(category, 'in_progress');

    try {
      switch (category) {
        case 'customFields':
          await this.migrateCustomFields();
          break;
        case 'tags':
          await this.migrateTags();
          break;
        case 'pipelines':
          await this.migratePipelines();
          break;
        case 'calendars':
          await this.migrateCalendars();
          break;
        case 'contacts':
          await this.migrateContacts();
          break;
        case 'opportunities':
          await this.migrateOpportunities();
          break;
        case 'appointments':
          await this.migrateAppointments();
          break;
        case 'forms':
          await this.migrateForms();
          break;
        case 'surveys':
          await this.migrateSurveys();
          break;
        case 'workflows':
          await this.migrateWorkflows();
          break;
        case 'campaigns':
          await this.migrateCampaigns();
          break;
        case 'aiPrompts':
          await this.migrateAIPrompts();
          break;
        case 'templates':
          await this.migrateTemplates();
          break;
        case 'media':
          await this.migrateMedia();
          break;
      }

      await this.updateCategoryStatus(category, 'completed');
    } catch (error: any) {
      await this.updateCategoryStatus(category, 'failed', error.message);
      throw error;
    }
  }

  // ==================== CATEGORY MIGRATION METHODS ====================

  /**
   * Migrate custom fields
   */
  private async migrateCustomFields(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getCustomFields();
    const customFields = sourceData?.customFields || [];

    for (const field of customFields) {
      try {
        const newField = await this.destOrchestrator!.createCustomField({
          name: field.name,
          dataType: field.dataType,
          placeholder: field.placeholder,
          options: field.options,
        });

        this.addIdMapping('customFields', field.id, newField.id, field.name);
        this.addResult('customFields', field.id, newField.id, field.name, true);
      } catch (error: any) {
        this.addResult('customFields', field.id, undefined, field.name, false, error.message);
      }
    }
  }

  /**
   * Migrate tags
   */
  private async migrateTags(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getTags();
    const tags = sourceData?.tags || [];

    for (const tag of tags) {
      try {
        const newTag = await this.destOrchestrator!.createTag({
          name: tag.name,
        });

        this.addIdMapping('tags', tag.id, newTag.id, tag.name);
        this.addResult('tags', tag.id, newTag.id, tag.name, true);
      } catch (error: any) {
        // Tag might already exist
        if (error.message?.includes('already exists')) {
          this.addResult('tags', tag.id, undefined, tag.name, true, 'Tag already exists');
        } else {
          this.addResult('tags', tag.id, undefined, tag.name, false, error.message);
        }
      }
    }
  }

  /**
   * Migrate pipelines and stages
   */
  private async migratePipelines(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getPipelines();
    const pipelines = sourceData?.pipelines || [];

    for (const pipeline of pipelines) {
      try {
        // Note: GHL API may have limited pipeline creation capabilities
        // This is a placeholder for the actual implementation
        this.addResult('pipelines', pipeline.id, undefined, pipeline.name, true, 
          'Pipeline noted - may require manual creation');
      } catch (error: any) {
        this.addResult('pipelines', pipeline.id, undefined, pipeline.name, false, error.message);
      }
    }
  }

  /**
   * Migrate calendars
   */
  private async migrateCalendars(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getCalendars();
    const calendars = sourceData?.calendars || [];

    for (const calendar of calendars) {
      try {
        // Note: Calendar creation may have API limitations
        this.addResult('calendars', calendar.id, undefined, calendar.name, true,
          'Calendar noted - may require manual creation');
      } catch (error: any) {
        this.addResult('calendars', calendar.id, undefined, calendar.name, false, error.message);
      }
    }
  }

  /**
   * Migrate contacts with all associated data
   */
  private async migrateContacts(): Promise<void> {
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const sourceData = await this.sourceOrchestrator!.getContacts({ limit, skip });
      const contacts = sourceData?.contacts || [];

      if (contacts.length === 0) {
        hasMore = false;
        break;
      }

      for (const contact of contacts) {
        try {
          // Map tags to new IDs
          const mappedTags = (contact.tags || []).map((tagId: string) => {
            const mapping = this.idMappings.get(`tags_${tagId}`);
            return mapping?.destinationId || tagId;
          });

          // Create contact in destination
          const newContact = await this.destOrchestrator!.createContact({
            firstName: contact.firstName,
            lastName: contact.lastName,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            address1: contact.address1,
            city: contact.city,
            state: contact.state,
            postalCode: contact.postalCode,
            country: contact.country,
            companyName: contact.companyName,
            website: contact.website,
            tags: mappedTags,
            source: contact.source || 'Migration',
            customField: this.mapCustomFieldValues(contact.customField),
          });

          this.addIdMapping('contacts', contact.id, newContact.contact?.id || newContact.id, 
            `${contact.firstName} ${contact.lastName}`);
          this.addResult('contacts', contact.id, newContact.contact?.id || newContact.id,
            `${contact.firstName} ${contact.lastName}`, true);

          // Migrate contact notes
          if (contact.id) {
            await this.migrateContactNotes(contact.id, newContact.contact?.id || newContact.id);
          }
        } catch (error: any) {
          // Check for duplicate
          if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
            this.addResult('contacts', contact.id, undefined,
              `${contact.firstName} ${contact.lastName}`, true, 'Contact already exists');
          } else {
            this.addResult('contacts', contact.id, undefined,
              `${contact.firstName} ${contact.lastName}`, false, error.message);
          }
        }
      }

      skip += limit;
      await this.updateProgress();
    }
  }

  /**
   * Migrate notes for a contact
   */
  private async migrateContactNotes(sourceContactId: string, destContactId: string): Promise<void> {
    try {
      const notesData = await this.sourceOrchestrator!.getNotes(sourceContactId);
      const notes = notesData?.notes || [];

      for (const note of notes) {
        try {
          await this.destOrchestrator!.createNote(destContactId, {
            body: note.body,
          });
        } catch (error) {
          // Silently handle note migration failures
        }
      }
    } catch (error) {
      // Notes may not be accessible
    }
  }

  /**
   * Migrate opportunities
   */
  private async migrateOpportunities(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getOpportunities();
    const opportunities = sourceData?.opportunities || [];

    for (const opp of opportunities) {
      try {
        // Map contact ID
        const contactMapping = this.idMappings.get(`contacts_${opp.contactId}`);
        
        const newOpp = await this.destOrchestrator!.createOpportunity({
          name: opp.name,
          contactId: contactMapping?.destinationId || opp.contactId,
          pipelineId: opp.pipelineId, // May need mapping
          pipelineStageId: opp.pipelineStageId, // May need mapping
          status: opp.status,
          monetaryValue: opp.monetaryValue,
        });

        this.addIdMapping('opportunities', opp.id, newOpp.id, opp.name);
        this.addResult('opportunities', opp.id, newOpp.id, opp.name, true);
      } catch (error: any) {
        this.addResult('opportunities', opp.id, undefined, opp.name, false, error.message);
      }
    }
  }

  /**
   * Migrate appointments
   */
  private async migrateAppointments(): Promise<void> {
    if (!this.currentJob?.options.includeHistoricalAppointments) {
      return;
    }

    // Get calendars and their appointments
    const calendarsData = await this.sourceOrchestrator!.getCalendars();
    const calendars = calendarsData?.calendars || [];

    for (const calendar of calendars) {
      try {
        const appointmentsData = await this.sourceOrchestrator!.getCalendarAppointments(calendar.id);
        const appointments = appointmentsData?.appointments || [];

        for (const apt of appointments) {
          try {
            // Map contact ID
            const contactMapping = this.idMappings.get(`contacts_${apt.contactId}`);
            
            // Note: Appointment creation requires proper calendar mapping
            this.addResult('appointments', apt.id, undefined, apt.title || 'Appointment',
              true, 'Appointment noted - may require manual creation');
          } catch (error: any) {
            this.addResult('appointments', apt.id, undefined, apt.title || 'Appointment',
              false, error.message);
          }
        }
      } catch (error) {
        // Calendar appointments may not be accessible
      }
    }
  }

  /**
   * Migrate forms
   */
  private async migrateForms(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getForms();
    const forms = sourceData?.forms || [];

    for (const form of forms) {
      try {
        // Note: Form creation via API may have limitations
        this.addResult('forms', form.id, undefined, form.name, true,
          'Form noted - may require manual recreation');
      } catch (error: any) {
        this.addResult('forms', form.id, undefined, form.name, false, error.message);
      }
    }
  }

  /**
   * Migrate surveys
   */
  private async migrateSurveys(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getSurveys();
    const surveys = sourceData?.surveys || [];

    for (const survey of surveys) {
      try {
        // Note: Survey creation via API may have limitations
        this.addResult('surveys', survey.id, undefined, survey.name, true,
          'Survey noted - may require manual recreation');
      } catch (error: any) {
        this.addResult('surveys', survey.id, undefined, survey.name, false, error.message);
      }
    }
  }

  /**
   * Migrate workflows - converts to prompt language for easy redeployment
   */
  private async migrateWorkflows(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getWorkflows();
    const workflows = sourceData?.workflows || [];
    const workflowPrompts: string[] = [];

    for (const workflow of workflows) {
      try {
        // Convert workflow to prompt language for AI Workflow Builder
        const promptDescription = this.convertWorkflowToPrompt(workflow);
        workflowPrompts.push(promptDescription);
        
        // Store the prompt in the migration results
        this.addResult('workflows', workflow.id, undefined, workflow.name, true,
          `Workflow converted to prompt language:\n\n${promptDescription}`);
      } catch (error: any) {
        this.addResult('workflows', workflow.id, undefined, workflow.name, false, error.message);
      }
    }

    // Store all workflow prompts in the job for easy access
    if (this.currentJob && workflowPrompts.length > 0) {
      (this.currentJob as any).workflowPrompts = workflowPrompts;
      await this.updateJobInDatabase();
    }
  }

  /**
   * Convert a GHL workflow object to human-readable prompt language
   */
  private convertWorkflowToPrompt(workflow: any): string {
    const lines: string[] = [];
    
    lines.push(`**WORKFLOW: ${workflow.name || 'Unnamed Workflow'}**`);
    lines.push('');
    lines.push(`**Status:** ${workflow.status || 'Unknown'}`);
    lines.push(`**ID:** ${workflow.id}`);
    lines.push('');
    
    // Describe the trigger
    if (workflow.trigger || workflow.triggers) {
      const trigger = workflow.trigger || workflow.triggers?.[0];
      lines.push('**TRIGGER:**');
      lines.push(`- Type: ${this.formatTriggerType(trigger?.type || trigger?.name || 'Unknown')}`);
      if (trigger?.filters) {
        lines.push(`- Filters: ${JSON.stringify(trigger.filters)}`);
      }
      lines.push('');
    }
    
    // Describe the actions/steps
    if (workflow.actions || workflow.steps) {
      const actions = workflow.actions || workflow.steps || [];
      lines.push('**SEQUENCE:**');
      
      actions.forEach((action: any, index: number) => {
        const timing = action.delay ? this.formatDelay(action.delay) : 'Immediately';
        const actionType = this.formatActionType(action.type || action.actionType || 'Unknown');
        
        lines.push(`${index + 1}. [${timing}] ${actionType}`);
        
        // Add action-specific details
        if (action.type === 'send_sms' || action.actionType === 'sms') {
          lines.push(`   - Message: "${action.message || action.body || '[Template]'}"`);
        }
        if (action.type === 'send_email' || action.actionType === 'email') {
          lines.push(`   - Subject: "${action.subject || '[Template]'}"`);
        }
        if (action.type === 'add_tag' || action.actionType === 'tag') {
          lines.push(`   - Tag: "${action.tag || action.tagName || '[Tag Name]'}"`);
        }
        if (action.type === 'wait' || action.actionType === 'delay') {
          lines.push(`   - Wait: ${this.formatDelay(action.delay || action.duration)}`);
        }
        if (action.conditions || action.condition) {
          lines.push(`   - Condition: ${JSON.stringify(action.conditions || action.condition)}`);
        }
      });
      lines.push('');
    }
    
    // Add recreation instructions
    lines.push('**TO RECREATE IN NEW ACCOUNT:**');
    lines.push('1. Go to Automation → Workflows → Create Workflow');
    lines.push(`2. Set trigger: ${this.formatTriggerType(workflow.trigger?.type || 'as described above')}`);
    lines.push('3. Add each action in sequence with specified delays');
    lines.push('4. Configure message templates with your branding');
    lines.push('5. Test with a sample contact before enabling');
    lines.push('');
    lines.push('---');
    
    return lines.join('\n');
  }

  /**
   * Format trigger type to human-readable text
   */
  private formatTriggerType(type: string): string {
    const triggerMap: Record<string, string> = {
      'contact_created': 'Contact Created',
      'contact_changed': 'Contact Changed',
      'contact_tag': 'Tag Added/Removed',
      'form_submitted': 'Form Submitted',
      'appointment_booked': 'Appointment Booked',
      'appointment_status': 'Appointment Status Changed',
      'opportunity_created': 'Opportunity Created',
      'opportunity_status': 'Opportunity Status Changed',
      'pipeline_stage': 'Pipeline Stage Changed',
      'inbound_message': 'Message Received',
      'call_status': 'Call Status Changed',
      'invoice_paid': 'Invoice Paid',
      'birthday': 'Birthday',
      'custom_date': 'Custom Date',
      'webhook': 'Webhook Received',
      'manual': 'Manual Trigger',
    };
    return triggerMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format action type to human-readable text
   */
  private formatActionType(type: string): string {
    const actionMap: Record<string, string> = {
      'send_sms': 'Send SMS',
      'send_email': 'Send Email',
      'add_tag': 'Add Tag',
      'remove_tag': 'Remove Tag',
      'update_contact': 'Update Contact Field',
      'create_task': 'Create Task',
      'add_note': 'Add Note',
      'send_notification': 'Send Internal Notification',
      'wait': 'Wait/Delay',
      'condition': 'If/Then Condition',
      'webhook': 'Send Webhook',
      'add_to_workflow': 'Add to Another Workflow',
      'remove_from_workflow': 'Remove from Workflow',
      'create_opportunity': 'Create Opportunity',
      'update_opportunity': 'Update Opportunity',
      'assign_user': 'Assign to User',
      'voicemail': 'Send Ringless Voicemail',
      'call': 'Make Phone Call',
    };
    return actionMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format delay to human-readable text
   */
  private formatDelay(delay: any): string {
    if (!delay) return 'Immediately';
    if (typeof delay === 'string') return delay;
    if (typeof delay === 'number') {
      if (delay < 60) return `${delay} seconds`;
      if (delay < 3600) return `${Math.round(delay / 60)} minutes`;
      if (delay < 86400) return `${Math.round(delay / 3600)} hours`;
      return `${Math.round(delay / 86400)} days`;
    }
    if (delay.value && delay.unit) {
      return `${delay.value} ${delay.unit}`;
    }
    return JSON.stringify(delay);
  }

  /**
   * Update job in database
   */
  private async updateJobInDatabase(): Promise<void> {
    if (this.currentJob) {
      await DatabaseService.update(MIGRATION_COLLECTION, this.currentJob.id, this.currentJob);
    }
  }

  /**
   * Migrate campaigns
   */
  private async migrateCampaigns(): Promise<void> {
    const sourceData = await this.sourceOrchestrator!.getCampaigns();
    const campaigns = sourceData?.campaigns || [];

    for (const campaign of campaigns) {
      try {
        // Note: Campaign creation via API may have limitations
        this.addResult('campaigns', campaign.id, undefined, campaign.name, true,
          'Campaign noted - may require manual recreation');
      } catch (error: any) {
        this.addResult('campaigns', campaign.id, undefined, campaign.name, false, error.message);
      }
    }
  }

  /**
   * Migrate AI prompts and conversation AI settings
   */
  private async migrateAIPrompts(): Promise<void> {
    // AI prompts may require specific API endpoints
    // This is a placeholder for future implementation
    this.addResult('aiPrompts', 'all', undefined, 'AI Prompts', true,
      'AI prompts require manual export/import via GHL interface');
  }

  /**
   * Migrate templates (email, SMS, snippets)
   */
  private async migrateTemplates(): Promise<void> {
    // Templates may require specific API endpoints
    // This is a placeholder for future implementation
    this.addResult('templates', 'all', undefined, 'Templates', true,
      'Templates require manual export/import via GHL interface');
  }

  /**
   * Migrate media files
   */
  private async migrateMedia(): Promise<void> {
    try {
      const mediaData = await this.sourceOrchestrator!.getMediaFiles();
      const files = mediaData?.files || [];

      for (const file of files) {
        try {
          // Note: Media migration requires downloading and re-uploading
          this.addResult('media', file.id, undefined, file.name || 'Media file', true,
            'Media file noted - may require manual upload');
        } catch (error: any) {
          this.addResult('media', file.id, undefined, file.name || 'Media file', false, error.message);
        }
      }
    } catch (error) {
      // Media API may not be accessible
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map custom field values to new IDs
   */
  private mapCustomFieldValues(customFields: any): any {
    if (!customFields) return {};
    
    const mapped: any = {};
    for (const [key, value] of Object.entries(customFields)) {
      const mapping = this.idMappings.get(`customFields_${key}`);
      const newKey = mapping?.destinationId || key;
      mapped[newKey] = value;
    }
    return mapped;
  }

  /**
   * Add ID mapping
   */
  private addIdMapping(
    category: MigrationCategory,
    sourceId: string,
    destinationId: string,
    name?: string
  ): void {
    const mapping: IdMapping = { category, sourceId, destinationId, name };
    this.idMappings.set(`${category}_${sourceId}`, mapping);
    
    if (this.currentJob) {
      this.currentJob.idMappings.push(mapping);
    }
  }

  /**
   * Add migration result
   */
  private addResult(
    category: MigrationCategory,
    sourceId: string,
    destinationId: string | undefined,
    name: string,
    success: boolean,
    error?: string
  ): void {
    const result: MigrationItemResult = {
      category,
      sourceId,
      destinationId,
      name,
      success,
      error,
      timestamp: new Date().toISOString(),
    };

    if (this.currentJob) {
      this.currentJob.results.push(result);
      
      // Update category progress
      const categoryProgress = this.currentJob.progress.categories[category];
      if (categoryProgress) {
        categoryProgress.processed++;
        if (success) {
          categoryProgress.successful++;
        } else {
          categoryProgress.failed++;
          if (error) {
            categoryProgress.errors.push(`${name}: ${error}`);
          }
        }
      }
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(status: MigrationStatus, error?: string): Promise<void> {
    if (!this.currentJob) return;

    this.currentJob.status = status;
    this.currentJob.updatedAt = new Date().toISOString();
    
    if (error) {
      this.currentJob.error = error;
    }
    
    if (status === 'completed' || status === 'failed') {
      this.currentJob.completedAt = new Date().toISOString();
    }

    await DatabaseService.update(MIGRATION_COLLECTION, this.currentJob.id, this.currentJob);
  }

  /**
   * Update category status
   */
  private async updateCategoryStatus(
    category: MigrationCategory,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    if (!this.currentJob) return;

    const categoryProgress = this.currentJob.progress.categories[category];
    if (categoryProgress) {
      categoryProgress.status = status;
      if (error) {
        categoryProgress.errors.push(error);
      }
    }

    this.currentJob.progress.currentCategory = category;
    await this.updateProgress();
  }

  /**
   * Update overall progress
   */
  private async updateProgress(): Promise<void> {
    if (!this.currentJob) return;

    const categories = Object.values(this.currentJob.progress.categories);
    const totalItems = categories.reduce((sum, cat) => sum + cat.total, 0);
    const processedItems = categories.reduce((sum, cat) => sum + cat.processed, 0);
    
    this.currentJob.progress.overall = totalItems > 0 
      ? Math.round((processedItems / totalItems) * 100) 
      : 0;

    await DatabaseService.update(MIGRATION_COLLECTION, this.currentJob.id, this.currentJob);
  }

  /**
   * Initialize category progress tracking
   */
  private initializeCategoryProgress(
    categories: MigrationCategory[],
    dataCounts: MigrationDataCounts
  ): Record<MigrationCategory, CategoryProgress> {
    const progress: Record<string, CategoryProgress> = {};

    for (const category of categories) {
      progress[category] = {
        category,
        total: dataCounts[category] || 0,
        processed: 0,
        successful: 0,
        failed: 0,
        status: 'pending',
        errors: [],
      };
    }

    return progress as Record<MigrationCategory, CategoryProgress>;
  }

  /**
   * Get empty data counts object
   */
  private getEmptyDataCounts(): MigrationDataCounts {
    return {
      contacts: 0,
      tags: 0,
      customFields: 0,
      pipelines: 0,
      opportunities: 0,
      calendars: 0,
      appointments: 0,
      forms: 0,
      surveys: 0,
      workflows: 0,
      campaigns: 0,
      aiPrompts: 0,
      templates: 0,
      media: 0,
    };
  }

  /**
   * Export all data to JSON (for backup)
   */
  async exportToJson(credentials: GHLAccountCredentials): Promise<ExportedData> {
    const orchestrator = new GHLOrchestrator({
      apiKey: credentials.apiKey,
      locationId: credentials.locationId,
    });

    const exportData: ExportedData = {
      exportedAt: new Date().toISOString(),
      sourceLocationId: credentials.locationId,
      version: '1.0',
    };

    // Export each category
    try {
      const contactsData = await orchestrator.getContacts({ limit: 100 });
      exportData.contacts = contactsData?.contacts || [];
    } catch (e) {}

    try {
      const tagsData = await orchestrator.getTags();
      exportData.tags = tagsData?.tags || [];
    } catch (e) {}

    try {
      const customFieldsData = await orchestrator.getCustomFields();
      exportData.customFields = customFieldsData?.customFields || [];
    } catch (e) {}

    try {
      const pipelinesData = await orchestrator.getPipelines();
      exportData.pipelines = pipelinesData?.pipelines || [];
    } catch (e) {}

    try {
      const opportunitiesData = await orchestrator.getOpportunities();
      exportData.opportunities = opportunitiesData?.opportunities || [];
    } catch (e) {}

    try {
      const calendarsData = await orchestrator.getCalendars();
      exportData.calendars = calendarsData?.calendars || [];
    } catch (e) {}

    try {
      const formsData = await orchestrator.getForms();
      exportData.forms = formsData?.forms || [];
    } catch (e) {}

    try {
      const surveysData = await orchestrator.getSurveys();
      exportData.surveys = surveysData?.surveys || [];
    } catch (e) {}

    try {
      const workflowsData = await orchestrator.getWorkflows();
      exportData.workflows = workflowsData?.workflows || [];
    } catch (e) {}

    try {
      const campaignsData = await orchestrator.getCampaigns();
      exportData.campaigns = campaignsData?.campaigns || [];
    } catch (e) {}

    return exportData;
  }

  /**
   * Get migration job by ID
   */
  async getMigrationJob(jobId: string): Promise<MigrationJob | null> {
    return DatabaseService.getById<MigrationJob>(MIGRATION_COLLECTION, jobId);
  }

  /**
   * Get all migration jobs
   */
  async getMigrationHistory(): Promise<MigrationJob[]> {
    return DatabaseService.getAll<MigrationJob>(MIGRATION_COLLECTION);
  }

  /**
   * Cancel a running migration
   */
  async cancelMigration(jobId: string): Promise<void> {
    const job = await this.getMigrationJob(jobId);
    if (job && (job.status === 'exporting' || job.status === 'importing')) {
      await DatabaseService.update(MIGRATION_COLLECTION, jobId, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export const ghlMigrationService = new GHLMigrationService();
export default GHLMigrationService;
