import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';
import { GHLOrchestrator } from '@/services/ghl-orchestrator';

/**
 * BMAD Orchestrator API
 * Intelligent assistant that understands natural language and executes tasks
 */

interface OrchestratorRequest {
  message: string;
  conversationHistory: any[];
  context: any;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, context }: OrchestratorRequest = await request.json();

    console.log('🤖 BMAD Orchestrator received:', message);

    // Parse intent from message
    const intent = await parseIntent(message);
    console.log('🎯 Detected intent:', intent);

    // Check if we need more information
    const missingInfo = checkMissingInformation(intent);
    
    if (missingInfo.length > 0) {
      return NextResponse.json({
        response: `I need a bit more information to help you:\n\n${missingInfo.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
        needsInput: true,
        followUpQuestions: missingInfo,
        actionExecuted: false
      });
    }

    // Execute the action
    const result = await executeAction(intent);

    return NextResponse.json({
      response: result.response,
      action: intent.action,
      result: result.data,
      actionExecuted: result.success,
      actionSummary: result.summary,
      followUpQuestions: result.suggestions || []
    });

  } catch (error) {
    console.error('❌ Orchestrator error:', error);
    return NextResponse.json(
      {
        response: 'I encountered an error processing your request. Could you rephrase that?',
        error: error instanceof Error ? error.message : 'Unknown error',
        actionExecuted: false
      },
      { status: 500 }
    );
  }
}

async function parseIntent(message: string) {
  const lowerMessage = message.toLowerCase();

  // Service management
  if (lowerMessage.includes('service') || lowerMessage.includes('pricing')) {
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('new')) {
      return {
        action: 'create_service',
        entity: 'service',
        operation: 'create',
        data: extractServiceData(message)
      };
    }
    if (lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('view')) {
      return {
        action: 'list_services',
        entity: 'service',
        operation: 'list'
      };
    }
    if (lowerMessage.includes('update') || lowerMessage.includes('change') || lowerMessage.includes('modify')) {
      return {
        action: 'update_service',
        entity: 'service',
        operation: 'update',
        data: extractServiceData(message)
      };
    }
  }

  // User management
  if (lowerMessage.includes('user') || lowerMessage.includes('customer')) {
    if (lowerMessage.includes('create') || lowerMessage.includes('add')) {
      return {
        action: 'create_user',
        entity: 'user',
        operation: 'create',
        data: extractUserData(message)
      };
    }
    if (lowerMessage.includes('show') || lowerMessage.includes('list')) {
      return {
        action: 'list_users',
        entity: 'user',
        operation: 'list'
      };
    }
  }

  // Booking management
  if (lowerMessage.includes('booking') || lowerMessage.includes('appointment')) {
    if (lowerMessage.includes('today')) {
      return {
        action: 'list_bookings_today',
        entity: 'booking',
        operation: 'list',
        filter: 'today'
      };
    }
    if (lowerMessage.includes('show') || lowerMessage.includes('list')) {
      return {
        action: 'list_bookings',
        entity: 'booking',
        operation: 'list'
      };
    }
  }

  // Coupon management
  if (lowerMessage.includes('coupon') || lowerMessage.includes('discount') || lowerMessage.includes('promo')) {
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('new')) {
      return {
        action: 'create_coupon',
        entity: 'coupon',
        operation: 'create',
        data: extractCouponData(message)
      };
    }
  }

  // GoHighLevel operations
  if (lowerMessage.includes('ghl') || lowerMessage.includes('gohighlevel') || lowerMessage.includes('sync')) {
    if (lowerMessage.includes('contact')) {
      if (lowerMessage.includes('sync')) {
        return {
          action: 'sync_ghl_contacts',
          entity: 'ghl_contact',
          operation: 'sync'
        };
      }
      if (lowerMessage.includes('create')) {
        return {
          action: 'create_ghl_contact',
          entity: 'ghl_contact',
          operation: 'create',
          data: extractContactData(message)
        };
      }
    }
  }

  // MCP operations
  if (lowerMessage.includes('mcp')) {
    return {
      action: 'execute_mcp',
      entity: 'mcp',
      operation: 'execute',
      data: { message }
    };
  }

  // Default: general query
  return {
    action: 'general_query',
    entity: 'general',
    operation: 'query',
    data: { message }
  };
}

function checkMissingInformation(intent: any): string[] {
  const missing: string[] = [];

  switch (intent.action) {
    case 'create_service':
      if (!intent.data?.name) missing.push('What should the service be called?');
      if (!intent.data?.price) missing.push('What is the price for this service?');
      break;

    case 'create_user':
      if (!intent.data?.email) missing.push('What is the user\'s email address?');
      if (!intent.data?.name) missing.push('What is the user\'s name?');
      break;

    case 'create_coupon':
      if (!intent.data?.code) missing.push('What should the coupon code be?');
      if (!intent.data?.discount) missing.push('What discount should it provide? (e.g., 20% or $50)');
      break;

    case 'create_ghl_contact':
      if (!intent.data?.email) missing.push('What is the contact\'s email address?');
      break;
  }

  return missing;
}

async function executeAction(intent: any) {
  console.log('⚡ Executing action:', intent.action);

  switch (intent.action) {
    case 'list_services':
      return await listServices();

    case 'create_service':
      return await createService(intent.data);

    case 'list_users':
      return await listUsers();

    case 'list_bookings':
      return await listBookings(intent.filter);

    case 'list_bookings_today':
      return await listBookingsToday();

    case 'create_coupon':
      return await createCoupon(intent.data);

    case 'sync_ghl_contacts':
      return await syncGHLContacts();

    case 'create_ghl_contact':
      return await createGHLContact(intent.data);

    case 'general_query':
      return handleGeneralQuery(intent.data.message);

    default:
      return {
        success: false,
        response: 'I\'m not sure how to help with that yet. Could you try rephrasing?',
        data: null
      };
  }
}

// Action implementations
async function listServices() {
  const services = await DatabaseService.getAll('services');
  const serviceList = services.map((s: any, i: number) => 
    `${i + 1}. **${s.name}** - $${s.price}${s.duration ? ` (${s.duration} min)` : ''}`
  ).join('\n');

  return {
    success: true,
    response: `📋 **Here are all your services:**\n\n${serviceList || 'No services found.'}`,
    data: services,
    summary: `Found ${services.length} service(s)`,
    suggestions: ['Create a new service', 'Update a service price']
  };
}

async function createService(data: any) {
  const newService = {
    name: data.name,
    price: data.price,
    duration: data.duration || 60,
    description: data.description || '',
    category: data.category || 'General',
    createdAt: new Date()
  };

  const id = await DatabaseService.add('services', newService);

  return {
    success: true,
    response: `✅ **Service created successfully!**\n\n**${data.name}** - $${data.price}\n\nService ID: ${id}`,
    data: { id, ...newService },
    summary: `Created service: ${data.name}`,
    suggestions: ['Create another service', 'View all services']
  };
}

async function listUsers() {
  const users = await DatabaseService.getAll('users');
  const userList = users.slice(0, 10).map((u: any, i: number) => {
    const name = u.displayName || u.name || `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim();
    const email = u.email || u.profile?.email || 'No email';
    return `${i + 1}. **${name}** (${email}) - Role: ${u.role || 'user'}`;
  }).join('\n');

  return {
    success: true,
    response: `👥 **User List** (showing first 10):\n\n${userList || 'No users found.'}`,
    data: users,
    summary: `Found ${users.length} user(s)`,
    suggestions: ['Create a new user', 'View artists']
  };
}

async function listBookings(filter?: string) {
  const bookings = await DatabaseService.getAll('bookings');
  const bookingList = bookings.slice(0, 10).map((b: any, i: number) => 
    `${i + 1}. ${b.serviceName || 'Service'} - ${new Date(b.date).toLocaleDateString()} at ${b.time}`
  ).join('\n');

  return {
    success: true,
    response: `📅 **Bookings** (showing first 10):\n\n${bookingList || 'No bookings found.'}`,
    data: bookings,
    summary: `Found ${bookings.length} booking(s)`
  };
}

async function listBookingsToday() {
  const bookings = await DatabaseService.getAll('bookings');
  const today = new Date().toDateString();
  const todayBookings = bookings.filter((b: any) => new Date(b.date).toDateString() === today);

  const bookingList = todayBookings.map((b: any, i: number) => 
    `${i + 1}. ${b.serviceName || 'Service'} - ${b.time} - ${b.customerName || 'Customer'}`
  ).join('\n');

  return {
    success: true,
    response: `📅 **Today's Appointments:**\n\n${bookingList || 'No appointments scheduled for today.'}`,
    data: todayBookings,
    summary: `Found ${todayBookings.length} appointment(s) today`
  };
}

async function createCoupon(data: any) {
  const newCoupon = {
    code: data.code.toUpperCase(),
    discount: data.discount,
    type: data.discount.includes('%') ? 'percentage' : 'fixed',
    expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    maxUses: data.maxUses || 100,
    usedCount: 0,
    isActive: true,
    createdAt: new Date()
  };

  const id = await DatabaseService.add('coupons', newCoupon);

  return {
    success: true,
    response: `🎟️ **Coupon created successfully!**\n\nCode: **${newCoupon.code}**\nDiscount: ${newCoupon.discount}\nExpires: ${new Date(newCoupon.expiresAt).toLocaleDateString()}`,
    data: { id, ...newCoupon },
    summary: `Created coupon: ${newCoupon.code}`
  };
}

async function syncGHLContacts() {
  try {
    const settingsList = await DatabaseService.getAll('crmSettings');
    const settings = settingsList.length > 0 ? settingsList[0] : null;

    if (!settings || !(settings as any).apiKey) {
      return {
        success: false,
        response: '❌ GoHighLevel API key not configured. Please set it up in the GoHighLevel tab first.',
        data: null
      };
    }

    const orchestrator = new GHLOrchestrator({
      apiKey: (settings as any).apiKey,
      locationId: (settings as any).locationId
    });

    const contacts = await orchestrator.syncContacts();

    return {
      success: true,
      response: `✅ **Contacts synced from GoHighLevel!**\n\nSynced ${contacts.contacts?.length || 0} contacts.`,
      data: contacts,
      summary: `Synced ${contacts.contacts?.length || 0} contacts from GHL`
    };
  } catch (error) {
    return {
      success: false,
      response: `❌ Error syncing contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: null
    };
  }
}

async function createGHLContact(data: any) {
  try {
    const settingsList = await DatabaseService.getAll('crmSettings');
    const settings = settingsList.length > 0 ? settingsList[0] : null;

    if (!settings || !(settings as any).apiKey) {
      return {
        success: false,
        response: '❌ GoHighLevel API key not configured.',
        data: null
      };
    }

    const orchestrator = new GHLOrchestrator({
      apiKey: (settings as any).apiKey,
      locationId: (settings as any).locationId
    });

    const contact = await orchestrator.createContact(data);

    return {
      success: true,
      response: `✅ **Contact created in GoHighLevel!**\n\nEmail: ${data.email}`,
      data: contact,
      summary: `Created GHL contact: ${data.email}`
    };
  } catch (error) {
    return {
      success: false,
      response: `❌ Error creating contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: null
    };
  }
}

function handleGeneralQuery(message: string) {
  return {
    success: true,
    response: `I understand you're asking about: "${message}"\n\nI can help you with:\n- Managing services and pricing\n- Creating and viewing users\n- Handling bookings and appointments\n- Creating coupons and promotions\n- Syncing with GoHighLevel\n- Executing MCP server operations\n\nWhat would you like to do?`,
    data: null,
    suggestions: [
      'Show me all services',
      'View today\'s appointments',
      'Sync GoHighLevel contacts'
    ]
  };
}

// Helper functions to extract data from natural language
function extractServiceData(message: string) {
  const data: any = {};
  
  // Extract name (text in quotes or after "called")
  const nameMatch = message.match(/called\s+"([^"]+)"|"([^"]+)"/);
  if (nameMatch) data.name = nameMatch[1] || nameMatch[2];
  
  // Extract price
  const priceMatch = message.match(/\$(\d+)/);
  if (priceMatch) data.price = parseInt(priceMatch[1]);
  
  return data;
}

function extractUserData(message: string) {
  const data: any = {};
  
  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) data.email = emailMatch[1];
  
  return data;
}

function extractCouponData(message: string) {
  const data: any = {};
  
  // Extract code
  const codeMatch = message.match(/code\s+([A-Z0-9]+)/i);
  if (codeMatch) data.code = codeMatch[1];
  
  // Extract discount
  const discountMatch = message.match(/(\d+%|\$\d+)/);
  if (discountMatch) data.discount = discountMatch[1];
  
  return data;
}

function extractContactData(message: string) {
  const data: any = {};
  
  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) data.email = emailMatch[1];
  
  return data;
}
