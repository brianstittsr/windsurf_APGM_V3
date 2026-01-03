import { NextRequest, NextResponse } from 'next/server';
import { GHLMigrationService } from '@/services/ghl-migration';

/**
 * Export all data from a GHL account to JSON (backup)
 */
export async function POST(request: NextRequest) {
  try {
    const { sourceAccount } = await request.json();

    if (!sourceAccount?.apiKey || !sourceAccount?.locationId) {
      return NextResponse.json(
        { success: false, error: 'Source account credentials are required' },
        { status: 400 }
      );
    }

    const migrationService = new GHLMigrationService();
    const exportData = await migrationService.exportToJson(sourceAccount);

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error: any) {
    console.error('Migration export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}
