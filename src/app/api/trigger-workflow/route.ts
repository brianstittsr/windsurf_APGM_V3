import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/services/WorkflowEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, userId, userEmail, additionalData } = body;

    if (!trigger || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: trigger, userId, userEmail' },
        { status: 400 }
      );
    }

    // Trigger workflows
    await workflowEngine.triggerWorkflows(trigger, userId, userEmail, additionalData);

    return NextResponse.json({ 
      success: true, 
      message: 'Workflows triggered successfully' 
    });

  } catch (error) {
    console.error('Error triggering workflows:', error);
    return NextResponse.json(
      { error: 'Failed to trigger workflows' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const workflowId = searchParams.get('workflowId');

    if (userId) {
      // Get user's workflow executions
      const executions = await workflowEngine.getUserWorkflowExecutions(userId);
      return NextResponse.json({ executions });
    } else if (workflowId) {
      // Get workflow executions
      const executions = await workflowEngine.getWorkflowExecutions(workflowId);
      return NextResponse.json({ executions });
    } else {
      return NextResponse.json(
        { error: 'Missing userId or workflowId parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error getting workflow executions:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow executions' },
      { status: 500 }
    );
  }
}
