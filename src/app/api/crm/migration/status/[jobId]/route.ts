import { NextRequest, NextResponse } from 'next/server';
import { GHLMigrationService } from '@/services/ghl-migration';

/**
 * Get migration job status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const migrationService = new GHLMigrationService();
    const job = await migrationService.getMigrationJob(jobId);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Migration job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get migration status' },
      { status: 500 }
    );
  }
}

/**
 * Cancel a running migration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const migrationService = new GHLMigrationService();
    await migrationService.cancelMigration(jobId);

    return NextResponse.json({
      success: true,
      message: 'Migration cancelled',
    });
  } catch (error: any) {
    console.error('Migration cancel error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel migration' },
      { status: 500 }
    );
  }
}
