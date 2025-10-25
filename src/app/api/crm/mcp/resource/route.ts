import { NextRequest, NextResponse } from 'next/server';
import { GHLOrchestrator } from '@/services/ghl-orchestrator';
import { DatabaseService } from '@/services/database';

/**
 * Load MCP Resource from GoHighLevel
 * Maps MCP resource URIs to GHL API calls
 */
export async function POST(request: NextRequest) {
  try {
    const { uri } = await request.json();

    if (!uri) {
      return NextResponse.json(
        { error: 'Resource URI is required' },
        { status: 400 }
      );
    }

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

    let resourceData;
    let resourceType;

    // Map MCP resource URIs to GHL API calls
    switch (uri) {
      case 'ghl://contacts':
        resourceData = await orchestrator.getContacts({ limit: 100 });
        resourceType = 'contacts';
        break;

      case 'ghl://locations':
        resourceData = await orchestrator.getLocations();
        resourceType = 'locations';
        break;

      case 'ghl://workflows':
        resourceData = await orchestrator.getWorkflows();
        resourceType = 'workflows';
        break;

      case 'ghl://calendars':
        resourceData = await orchestrator.getCalendars();
        resourceType = 'calendars';
        break;

      case 'ghl://opportunities':
        resourceData = await orchestrator.getOpportunities();
        resourceType = 'opportunities';
        break;

      case 'ghl://forms':
        resourceData = await orchestrator.getForms();
        resourceType = 'forms';
        break;

      case 'ghl://surveys':
        resourceData = await orchestrator.getSurveys();
        resourceType = 'surveys';
        break;

      case 'ghl://campaigns':
        resourceData = await orchestrator.getCampaigns();
        resourceType = 'campaigns';
        break;

      case 'ghl://tags':
        resourceData = await orchestrator.getTags();
        resourceType = 'tags';
        break;

      case 'ghl://users':
        resourceData = await orchestrator.getUsers();
        resourceType = 'users';
        break;

      case 'ghl://companies':
        resourceData = await orchestrator.getCompanies();
        resourceType = 'companies';
        break;

      default:
        return NextResponse.json(
          { error: `Unknown resource URI: ${uri}` },
          { status: 404 }
        );
    }

    return NextResponse.json({
      success: true,
      uri,
      resourceType,
      data: resourceData,
      metadata: {
        timestamp: new Date().toISOString(),
        count: Array.isArray(resourceData) ? resourceData.length : 1
      }
    });

  } catch (error) {
    console.error('Error loading MCP resource:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load resource',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
