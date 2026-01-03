import { NextRequest, NextResponse } from 'next/server';
import { GHL_WORKFLOW_TEMPLATES, GHL_TRIGGERS, GHL_ACTIONS, GHL_CONDITIONS, WORKFLOW_BUILDER_QUESTIONS } from '@/data/ghl-workflow-knowledge';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface WorkflowBuilderRequest {
  message: string;
  conversationHistory: ConversationMessage[];
  context: Record<string, any>;
}

// Build system prompt with GHL knowledge
function buildSystemPrompt(): string {
  const triggersList = Object.values(GHL_TRIGGERS)
    .flatMap(cat => cat.triggers.map(t => `- ${t.name}: ${t.description}`))
    .join('\n');

  const actionsList = Object.values(GHL_ACTIONS)
    .flatMap(cat => cat.actions.map(a => `- ${a.name}: ${a.description}`))
    .join('\n');

  const conditionsList = Object.values(GHL_CONDITIONS)
    .flatMap(cat => cat.conditions.map(c => `- ${c.name}: ${c.description}`))
    .join('\n');

  const templatesList = Object.values(GHL_WORKFLOW_TEMPLATES)
    .map(t => `- ${t.name}: ${t.description}`)
    .join('\n');

  return `You are an expert GoHighLevel workflow builder assistant. Your role is to help users create effective automation workflows for their business.

## YOUR KNOWLEDGE BASE

### Available Workflow Triggers:
${triggersList}

### Available Workflow Actions:
${actionsList}

### Available Conditions (for branching):
${conditionsList}

### Pre-built Templates Available:
${templatesList}

## YOUR BEHAVIOR

1. **Ask clarifying questions** to understand the user's needs before building a workflow
2. **Suggest appropriate triggers** based on the user's goal
3. **Design step-by-step workflows** with proper timing and conditions
4. **Explain each step** so users understand the automation
5. **Provide the workflow in prompt format** that can be easily recreated in GHL

## WORKFLOW DESIGN PRINCIPLES

1. **Speed to Lead**: Respond to new leads within 5 minutes
2. **Multi-touch**: Use multiple channels (SMS, email) for better engagement
3. **Proper Timing**: Space messages appropriately (not too frequent)
4. **Personalization**: Include contact name and relevant details
5. **Clear Goals**: Every workflow should have a measurable outcome
6. **Exit Conditions**: Include ways to stop the workflow when goal is achieved

## RESPONSE FORMAT

When presenting a workflow, use this format:

**WORKFLOW NAME**

**Purpose:** [What this workflow accomplishes]

**Trigger:** [What starts this workflow]

**Sequence:**
1. [TIMING]: [Action] - [Brief description]
2. [TIMING]: [Action] - [Brief description]
...

**Key Messages:**
- [Message type]: [Purpose/content summary]

**Goal:** [Success metric]

## IMPORTANT RULES

- Always be helpful and encouraging
- If unsure, ask clarifying questions
- Suggest best practices from your knowledge
- Provide complete, actionable workflows
- Use markdown formatting for readability
- Keep responses focused and practical`;
}

// Analyze user intent
function analyzeIntent(message: string, context: Record<string, any>): string {
  const lowerMessage = message.toLowerCase();

  // Check for template selection
  if (context.selectedTemplate) {
    if (lowerMessage.includes('as-is') || lowerMessage.includes('use this') || lowerMessage.includes('generate')) {
      return 'generate_workflow';
    }
    if (lowerMessage.includes('customize') || lowerMessage.includes('change') || lowerMessage.includes('modify')) {
      return 'customize_template';
    }
    if (lowerMessage.includes('explain') || lowerMessage.includes('breakdown') || lowerMessage.includes('detail')) {
      return 'explain_workflow';
    }
  }

  // Check for specific intents
  if (lowerMessage.includes('trigger') || lowerMessage.includes('what starts')) {
    return 'list_triggers';
  }
  if (lowerMessage.includes('action') || lowerMessage.includes('what can')) {
    return 'list_actions';
  }
  if (lowerMessage.includes('template') || lowerMessage.includes('pre-built')) {
    return 'list_templates';
  }

  // Default to building a workflow
  return 'build_workflow';
}

// Generate response based on intent
async function generateResponse(
  message: string,
  history: ConversationMessage[],
  context: Record<string, any>
): Promise<{ message: string; workflow?: any; context?: Record<string, any> }> {
  const intent = analyzeIntent(message, context);
  const lowerMessage = message.toLowerCase();

  // Handle template generation
  if (intent === 'generate_workflow' && context.selectedTemplate) {
    const template = GHL_WORKFLOW_TEMPLATES[context.selectedTemplate as keyof typeof GHL_WORKFLOW_TEMPLATES];
    if (template) {
      return {
        message: `Here's your complete **${template.name}** workflow ready for deployment:

${template.promptDescription}

---

**Next Steps to Deploy in GoHighLevel:**

1. Go to **Automation → Workflows** in your GHL account
2. Click **"Create Workflow"**
3. Select the trigger: **${template.trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**
4. Add each action in sequence with the specified delays
5. Configure your message templates
6. Test with a sample contact before going live

Would you like me to:
- **Customize any part** of this workflow?
- **Create message templates** for the SMS/emails?
- **Build another workflow** for a different purpose?`,
        workflow: {
          name: template.name,
          description: template.description,
          trigger: template.trigger,
          steps: template.steps,
          promptDescription: template.promptDescription,
        },
        context: { ...context, workflowGenerated: true },
      };
    }
  }

  // Handle trigger listing
  if (intent === 'list_triggers') {
    const triggerList = Object.entries(GHL_TRIGGERS)
      .map(([category, data]) => {
        const triggers = data.triggers.map(t => `  • **${t.name}**: ${t.description}`).join('\n');
        return `**${data.label}:**\n${triggers}`;
      })
      .join('\n\n');

    return {
      message: `Here are all available workflow triggers in GoHighLevel:\n\n${triggerList}\n\nWhich trigger would you like to use for your workflow?`,
    };
  }

  // Handle action listing
  if (intent === 'list_actions') {
    const actionList = Object.entries(GHL_ACTIONS)
      .map(([category, data]) => {
        const actions = data.actions.map(a => `  • **${a.name}**: ${a.description}`).join('\n');
        return `**${data.label}:**\n${actions}`;
      })
      .join('\n\n');

    return {
      message: `Here are all available workflow actions in GoHighLevel:\n\n${actionList}\n\nWhat actions would you like to include in your workflow?`,
    };
  }

  // Handle template listing
  if (intent === 'list_templates') {
    const templateList = Object.entries(GHL_WORKFLOW_TEMPLATES)
      .map(([id, t]) => `• **${t.name}** (${t.category}): ${t.description}`)
      .join('\n');

    return {
      message: `Here are the pre-built workflow templates available:\n\n${templateList}\n\nWould you like me to explain any of these in detail, or would you prefer to build a custom workflow?`,
    };
  }

  // Build custom workflow based on user description
  if (intent === 'build_workflow') {
    // Detect workflow type from message
    let workflowType = '';
    let suggestedTemplate = '';

    if (lowerMessage.includes('lead') || lowerMessage.includes('nurtur') || lowerMessage.includes('follow up') || lowerMessage.includes('follow-up')) {
      workflowType = 'lead_nurturing';
      suggestedTemplate = 'lead_nurturing';
    } else if (lowerMessage.includes('no-show') || lowerMessage.includes('no show') || lowerMessage.includes('missed')) {
      workflowType = 'no_show';
      suggestedTemplate = 'no_show_recovery';
    } else if (lowerMessage.includes('reminder') || lowerMessage.includes('appointment')) {
      workflowType = 'appointment';
      suggestedTemplate = 'appointment_reminder';
    } else if (lowerMessage.includes('review') || lowerMessage.includes('testimonial')) {
      workflowType = 'review';
      suggestedTemplate = 'review_request';
    } else if (lowerMessage.includes('reactivat') || lowerMessage.includes('inactive') || lowerMessage.includes('dormant') || lowerMessage.includes('re-engage')) {
      workflowType = 'reactivation';
      suggestedTemplate = 'reactivation';
    } else if (lowerMessage.includes('birthday')) {
      workflowType = 'birthday';
      suggestedTemplate = 'birthday_campaign';
    } else if (lowerMessage.includes('speed') || lowerMessage.includes('instant') || lowerMessage.includes('fast')) {
      workflowType = 'speed_to_lead';
      suggestedTemplate = 'speed_to_lead';
    }

    // If we found a matching template, suggest it
    if (suggestedTemplate && GHL_WORKFLOW_TEMPLATES[suggestedTemplate as keyof typeof GHL_WORKFLOW_TEMPLATES]) {
      const template = GHL_WORKFLOW_TEMPLATES[suggestedTemplate as keyof typeof GHL_WORKFLOW_TEMPLATES];
      return {
        message: `Based on your request, I recommend the **${template.name}** workflow. Here's what it does:

${template.description}

**Quick Overview:**
- **Trigger:** ${template.trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Category:** ${template.category}
- **Steps:** ${template.steps.length} automated actions

Would you like me to:
1. **Show the full workflow** with all steps and timing
2. **Customize it** for your specific needs
3. **Build something different** from scratch

What would you prefer?`,
        context: { selectedTemplate: suggestedTemplate, workflowType },
      };
    }

    // Generic response for custom workflow building
    return {
      message: `I'd be happy to help you build a custom workflow! To create the perfect automation, I need to understand a few things:

**1. What's the goal?**
What do you want this workflow to accomplish? (e.g., convert leads, reduce no-shows, get reviews)

**2. What triggers it?**
When should this workflow start? (e.g., new contact, form submission, appointment booked)

**3. What channels?**
Do you want to use SMS, email, or both?

**4. How long should it run?**
Is this a short sequence (few days) or longer nurture (weeks)?

Please share more details and I'll design a workflow tailored to your needs!`,
      context: { buildingCustom: true },
    };
  }

  // Default helpful response
  return {
    message: `I'm here to help you build GoHighLevel workflows! Here's what I can do:

• **Create custom workflows** - Tell me what you want to automate
• **Explain templates** - I have ${Object.keys(GHL_WORKFLOW_TEMPLATES).length} pre-built workflows ready
• **List triggers/actions** - Show you all available options
• **Customize existing workflows** - Modify timing, messages, or conditions

What would you like to work on?`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowBuilderRequest = await request.json();
    const { message, conversationHistory, context } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await generateResponse(message, conversationHistory || [], context || {});

    return NextResponse.json({
      success: true,
      message: response.message,
      workflow: response.workflow,
      context: response.context,
    });
  } catch (error: any) {
    console.error('Workflow builder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
