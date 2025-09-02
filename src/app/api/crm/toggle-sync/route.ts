import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();
    
    // Update sync status in database
    const syncStatus = {
      isEnabled: enabled,
      lastSync: enabled ? new Date().toISOString() : null,
      syncedContacts: 0,
      syncedWorkflows: 0,
      errors: []
    };

    await DatabaseService.updateDocument('crmSettings', 'syncStatus', syncStatus);

    return NextResponse.json({ success: true, syncStatus });
  } catch (error) {
    console.error('Failed to toggle sync:', error);
    return NextResponse.json(
      { error: 'Failed to toggle sync' },
      { status: 500 }
    );
  }
}
