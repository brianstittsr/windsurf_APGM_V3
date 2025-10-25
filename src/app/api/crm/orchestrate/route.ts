import { NextRequest, NextResponse } from 'next/server';
import { GHLOrchestrator } from '@/services/ghl-orchestrator';
import { DatabaseService } from '@/services/database';

/**
 * BMAD Orchestrator API Endpoint
 * Handles complex GHL workflows and automation
 */
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    // Get API key from database
    const settingsList = await DatabaseService.getAll('crmSettings');
    const settings = settingsList.length > 0 ? settingsList[0] : null;
    
    if (!settings || !(settings as any).apiKey) {
      return NextResponse.json(
        { error: 'GHL API key not configured' },
        { status: 400 }
      );
    }

    const orchestrator = new GHLOrchestrator({
      apiKey: (settings as any).apiKey,
      locationId: (settings as any).locationId
    });

    let result;

    switch (action) {
      case 'sync-contacts':
        result = await orchestrator.syncContacts();
        break;

      case 'sync-workflows':
        result = await orchestrator.syncWorkflows();
        break;

      case 'create-contact':
        result = await orchestrator.createContact(data);
        break;

      case 'book-appointment':
        result = await orchestrator.orchestrateAppointmentBooking(data);
        break;

      case 'create-invoice':
        result = await orchestrator.orchestrateInvoiceWorkflow(data);
        break;

      case 'get-customer-journey':
        result = await orchestrator.getCustomerJourney(data.contactId);
        break;

      case 'get-locations':
        result = await orchestrator.getLocations();
        break;

      case 'get-calendars':
        result = await orchestrator.getCalendars();
        break;

      case 'get-workflows':
        result = await orchestrator.getWorkflows();
        break;

      case 'get-opportunities':
        result = await orchestrator.getOpportunities();
        break;

      case 'get-forms':
        result = await orchestrator.getForms();
        break;

      case 'get-surveys':
        result = await orchestrator.getSurveys();
        break;

      case 'get-tags':
        result = await orchestrator.getTags();
        break;

      case 'create-tag':
        result = await orchestrator.createTag(data);
        break;

      case 'add-tag-to-contact':
        result = await orchestrator.addTagToContact(data.contactId, data.tagId);
        break;

      case 'get-tasks':
        result = await orchestrator.getTasks();
        break;

      case 'create-task':
        result = await orchestrator.createTask(data);
        break;

      case 'update-task':
        result = await orchestrator.updateTask(data.taskId, data.taskData);
        break;

      case 'get-notes':
        result = await orchestrator.getNotes(data.contactId);
        break;

      case 'create-note':
        result = await orchestrator.createNote(data.contactId, data.noteData);
        break;

      case 'get-custom-fields':
        result = await orchestrator.getCustomFields();
        break;

      case 'create-custom-field':
        result = await orchestrator.createCustomField(data);
        break;

      case 'get-payment-transactions':
        result = await orchestrator.getPaymentTransactions();
        break;

      case 'create-payment':
        result = await orchestrator.createPaymentTransaction(data);
        break;

      case 'get-users':
        result = await orchestrator.getUsers();
        break;

      case 'get-companies':
        result = await orchestrator.getCompanies();
        break;

      case 'get-triggers':
        result = await orchestrator.getTriggers();
        break;

      case 'create-trigger':
        result = await orchestrator.createTrigger(data);
        break;

      case 'create-short-link':
        result = await orchestrator.createShortLink(data);
        break;

      case 'get-social-posts':
        result = await orchestrator.getSocialPosts();
        break;

      case 'create-social-post':
        result = await orchestrator.createSocialPost(data);
        break;

      case 'get-media':
        result = await orchestrator.getMediaFiles();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data: result
    });

  } catch (error) {
    console.error('Orchestrator error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
