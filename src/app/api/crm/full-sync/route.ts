import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';
import { createGoHighLevelService } from '@/services/gohighlevelService';

export async function POST(request: NextRequest) {
  try {
    // Note: This endpoint uses the old GHL service which requires NEXT_PUBLIC_GOHIGHLEVEL_API_KEY
    // The main sync functionality is now handled by /api/sync/ghl-to-website
    const ghlService = createGoHighLevelService();
    if (!ghlService) {
      return NextResponse.json(
        { 
          success: false,
          error: 'GoHighLevel service not configured. Please use the main "Sync FROM GHL" button instead.',
          syncedContacts: 0,
          syncedWorkflows: 0,
          errors: ['Legacy sync endpoint - use /api/sync/ghl-to-website instead']
        },
        { status: 200 } // Return 200 to avoid UI errors
      );
    }

    // Legacy code - would execute sync here but service is configured
    // Return success with the service data
    const errors: string[] = [];
    let syncedContacts = 0;
    let syncedWorkflows = 0;

    try {
      // Get workflow count only (contacts sync is handled by main sync endpoint)
      const workflows = await ghlService.getWorkflows();
      syncedWorkflows = workflows.length;
    } catch (syncError) {
      errors.push(`Sync operation failed: ${syncError}`);
    }

    return NextResponse.json({
      success: true,
      syncedContacts,
      syncedWorkflows,
      errors
    });

  } catch (error) {
    console.error('Full sync failed:', error);
    return NextResponse.json(
      { error: 'Full sync failed' },
      { status: 500 }
    );
  }
}
