import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

export async function GET(request: NextRequest) {
  try {
    // Get CRM sync status from database
    const syncStatus = await DatabaseService.getDocument('crmSettings', 'syncStatus');
    
    if (!syncStatus) {
      return NextResponse.json({
        isEnabled: false,
        lastSync: null,
        syncedContacts: 0,
        syncedWorkflows: 0,
        errors: []
      });
    }

    return NextResponse.json(syncStatus);
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
