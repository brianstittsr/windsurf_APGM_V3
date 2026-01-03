import { NextRequest, NextResponse } from 'next/server';
import { GHLMigrationService } from '@/services/ghl-migration';

/**
 * Validate source and destination GHL account credentials
 */
export async function POST(request: NextRequest) {
  try {
    const { sourceAccount, destinationAccount } = await request.json();

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

    const migrationService = new GHLMigrationService();
    const validationResult = await migrationService.validateAccounts(
      sourceAccount,
      destinationAccount
    );

    return NextResponse.json({
      success: validationResult.isValid,
      data: validationResult,
    });
  } catch (error: any) {
    console.error('Migration validation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
}
