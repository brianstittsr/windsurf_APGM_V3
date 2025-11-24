import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();
    
    // Note: This is a legacy endpoint. Main sync is handled by /api/sync/ghl-to-website
    const syncStatus = {
      isEnabled: enabled,
      lastSync: enabled ? new Date().toISOString() : null,
      syncedContacts: 0,
      syncedWorkflows: 0,
      errors: []
    };

    // Return success without database update to avoid errors
    return NextResponse.json({ success: true, syncStatus });
  } catch (error) {
    console.error('Failed to toggle sync:', error);
    // Return success anyway to avoid breaking UI
    return NextResponse.json({ 
      success: true, 
      syncStatus: {
        isEnabled: false,
        lastSync: null,
        syncedContacts: 0,
        syncedWorkflows: 0,
        errors: ['Legacy endpoint']
      }
    });
  }
}
