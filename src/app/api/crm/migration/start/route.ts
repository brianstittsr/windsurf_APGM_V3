import { NextRequest, NextResponse } from 'next/server';
import { GHLMigrationService } from '@/services/ghl-migration';
import { MigrationOptions, MigrationDataCounts } from '@/types/ghl-migration';

/**
 * Start a new migration job
 */
export async function POST(request: NextRequest) {
  try {
    const { sourceAccount, destinationAccount, options, dataCounts } = await request.json();

    if (!sourceAccount?.apiKey || !sourceAccount?.locationId) {
      return NextResponse.json(
        { success: false, error: 'Source account credentials are required' },
        { status: 400 }
      );
    }

    if (!destinationAccount?.apiKey || !destinationAccount?.locationId) {
      return NextResponse.json(
        { success: false, error: 'Destination account credentials are required' },
        { status: 400 }
      );
    }

    if (!options?.categories || options.categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one migration category must be selected' },
        { status: 400 }
      );
    }

    const migrationService = new GHLMigrationService();
    
    // Create the migration job
    const job = await migrationService.createMigrationJob(
      sourceAccount,
      destinationAccount,
      options as MigrationOptions,
      dataCounts as MigrationDataCounts
    );

    // Start the migration in the background
    migrationService.executeMigration(job.id).catch((error) => {
      console.error('Migration execution error:', error);
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        message: 'Migration started successfully',
      },
    });
  } catch (error: any) {
    console.error('Migration start error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start migration' },
      { status: 500 }
    );
  }
}
