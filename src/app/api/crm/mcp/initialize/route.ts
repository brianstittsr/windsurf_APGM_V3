import { NextRequest, NextResponse } from 'next/server';

/**
 * Initialize MCP Server connection to GoHighLevel
 * Based on: https://github.com/mastanley13/GoHighLevel-MCP
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }

    // Define available MCP resources for GoHighLevel
    const resources = [
      {
        uri: 'ghl://contacts',
        name: 'Contacts',
        description: 'All contacts in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://locations',
        name: 'Locations',
        description: 'All locations in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://workflows',
        name: 'Workflows',
        description: 'All workflows in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://calendars',
        name: 'Calendars',
        description: 'All calendars in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://opportunities',
        name: 'Opportunities',
        description: 'All opportunities/pipelines in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://forms',
        name: 'Forms',
        description: 'All forms in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://surveys',
        name: 'Surveys',
        description: 'All surveys in GoHighLevel',
        mimeType: 'application/json'
      },
      {
        uri: 'ghl://campaigns',
        name: 'Campaigns',
        description: 'All campaigns in GoHighLevel',
        mimeType: 'application/json'
      }
    ];

    // Define available MCP tools for GoHighLevel operations
    const tools = [
      {
        name: 'create_contact',
        description: 'Create a new contact in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' },
            locationId: { type: 'string', description: 'Location ID' }
          },
          required: ['email', 'locationId']
        }
      },
      {
        name: 'update_contact',
        description: 'Update an existing contact in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' }
          },
          required: ['contactId']
        }
      },
      {
        name: 'create_appointment',
        description: 'Create a new appointment in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            contactId: { type: 'string', description: 'Contact ID' },
            startTime: { type: 'string', description: 'Start time (ISO 8601)' },
            endTime: { type: 'string', description: 'End time (ISO 8601)' },
            title: { type: 'string', description: 'Appointment title' }
          },
          required: ['calendarId', 'contactId', 'startTime', 'endTime']
        }
      },
      {
        name: 'send_message',
        description: 'Send a message to a contact via GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            message: { type: 'string', description: 'Message content' },
            type: { type: 'string', enum: ['SMS', 'Email'], description: 'Message type' }
          },
          required: ['contactId', 'message', 'type']
        }
      },
      {
        name: 'add_tag',
        description: 'Add a tag to a contact in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            tagId: { type: 'string', description: 'Tag ID' }
          },
          required: ['contactId', 'tagId']
        }
      },
      {
        name: 'create_task',
        description: 'Create a new task in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            dueDate: { type: 'string', description: 'Due date (ISO 8601)' }
          },
          required: ['contactId', 'title']
        }
      },
      {
        name: 'create_opportunity',
        description: 'Create a new opportunity in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            pipelineId: { type: 'string', description: 'Pipeline ID' },
            stageId: { type: 'string', description: 'Stage ID' },
            name: { type: 'string', description: 'Opportunity name' },
            monetaryValue: { type: 'number', description: 'Monetary value' }
          },
          required: ['contactId', 'pipelineId', 'stageId', 'name']
        }
      }
    ];

    return NextResponse.json({
      success: true,
      resources,
      tools,
      serverInfo: {
        name: 'GoHighLevel MCP Server',
        version: '1.0.0',
        protocol: 'mcp',
        capabilities: {
          resources: true,
          tools: true,
          prompts: false
        }
      }
    });

  } catch (error) {
    console.error('Error initializing MCP server:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize MCP server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
