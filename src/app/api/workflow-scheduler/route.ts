import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/services/WorkflowEngine';

// This API route would be called by a cron job or scheduler service
// In production, you'd use services like Vercel Cron, AWS Lambda, or similar

export async function POST(request: NextRequest) {
  try {
    console.log('Running scheduled workflow processor...');
    
    // Process all scheduled workflows
    await workflowEngine.processScheduledWorkflows();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scheduled workflows processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing scheduled workflows:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process scheduled workflows',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint for the scheduler
    return NextResponse.json({ 
      status: 'healthy',
      service: 'workflow-scheduler',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in scheduler health check:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Scheduler health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
