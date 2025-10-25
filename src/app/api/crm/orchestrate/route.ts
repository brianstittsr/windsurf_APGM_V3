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
