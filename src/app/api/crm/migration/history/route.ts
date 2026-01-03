import { NextRequest, NextResponse } from 'next/server';
import { GHLMigrationService } from '@/services/ghl-migration';

/**
 * Get migration history
 */
export async function GET(request: NextRequest) {
  try {
    const migrationService = new GHLMigrationService();
    const history = await migrationService.getMigrationHistory();

    // Sort by creation date, newest first
    const sortedHistory = history.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: sortedHistory,
    });
  } catch (error: any) {
    console.error('Migration history error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get migration history' },
      { status: 500 }
    );
  }
}
