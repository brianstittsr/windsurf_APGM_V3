import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/services/bmad-workflows';

/**
 * Workflow Trigger API Endpoint
 * Allows external systems to trigger BMAD workflows
 */
export async function POST(request: NextRequest) {
  try {
    const { trigger, data } = await request.json();

    console.log('🔔 Workflow trigger received:', trigger);

    if (!trigger) {
      return NextResponse.json(
        { error: 'Trigger type is required' },
        { status: 400 }
      );
    }

    // Execute the workflow
    const result = await workflowEngine.executeWorkflow({
      type: trigger,
      data
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      results: result.results || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Workflow trigger error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get all active workflows
 */
export async function GET(request: NextRequest) {
  try {
    const workflows = await workflowEngine.getActiveWorkflows();

    return NextResponse.json({
      success: true,
      workflows,
      count: workflows.length
    });

  } catch (error) {
    console.error('❌ Error fetching workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
