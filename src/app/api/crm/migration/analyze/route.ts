import { NextRequest, NextResponse } from 'next/server';
import { GHLMigrationService } from '@/services/ghl-migration';

/**
 * Analyze source account to get data counts and estimate migration time
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
    const analysisResult = await migrationService.analyzeSourceAccount(sourceAccount);

    return NextResponse.json({
      success: analysisResult.success,
      data: analysisResult,
    });
  } catch (error: any) {
    console.error('Migration analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
