import { NextRequest, NextResponse } from 'next/server';
import { GHLOrchestrator } from '@/services/ghl-orchestrator';
import { DatabaseService } from '@/services/database';

/**
 * Execute MCP Tool on GoHighLevel
 * Maps MCP tool calls to GHL API operations
 */
export async function POST(request: NextRequest) {
  try {
    const { toolName, args } = await request.json();

    if (!toolName) {
      return NextResponse.json(
        { error: 'Tool name is required' },
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

    let result;

    // Map MCP tool calls to GHL API operations
    switch (toolName) {
      case 'create_contact':
        result = await orchestrator.createContact({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone,
          locationId: args.locationId
        });
        break;

      case 'update_contact':
        result = await orchestrator.updateContact(args.contactId, {
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone
        });
        break;

      case 'create_appointment':
        result = await orchestrator.createAppointment(args.calendarId, {
          contactId: args.contactId,
          startTime: args.startTime,
          endTime: args.endTime,
          title: args.title
        });
        break;

      case 'send_message':
        result = await orchestrator.sendMessage(args.contactId, {
          message: args.message,
          type: args.type
        });
        break;

      case 'add_tag':
        result = await orchestrator.addTagToContact(args.contactId, args.tagId);
        break;

      case 'create_task':
        result = await orchestrator.createTask({
          contactId: args.contactId,
          title: args.title,
          description: args.description,
          dueDate: args.dueDate
        });
        break;

      case 'create_opportunity':
        result = await orchestrator.createOpportunity({
          contactId: args.contactId,
          pipelineId: args.pipelineId,
          stageId: args.stageId,
          name: args.name,
          monetaryValue: args.monetaryValue
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${toolName}` },
          { status: 404 }
        );
    }

    return NextResponse.json({
      success: true,
      toolName,
      result,
      metadata: {
        timestamp: new Date().toISOString(),
        executionTime: 'N/A'
      }
    });

  } catch (error) {
    console.error('Error executing MCP tool:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute tool',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
