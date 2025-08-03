import { NextResponse } from 'next/server';
import { testStripeConnections } from '@/scripts/testStripeConnection';

export async function GET() {
  try {
    console.log('🧪 Starting Stripe connection test via API...');
    
    const results = await testStripeConnections();
    
    // Format response for client
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      currentMode: process.env.STRIPE_MODE || 'test',
      results: results.map(result => ({
        mode: result.mode,
        success: result.success,
        error: result.error || null,
        accountId: result.accountInfo?.id || null,
        country: result.accountInfo?.country || null,
        currency: result.accountInfo?.defaultCurrency || null,
        businessName: result.accountInfo?.businessProfile?.name || null
      })),
      summary: {
        totalTests: results.length,
        successfulConnections: results.filter(r => r.success).length,
        testModeWorking: results.find(r => r.mode === 'test')?.success || false,
        liveModeWorking: results.find(r => r.mode === 'live')?.success || false
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Stripe connection test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
