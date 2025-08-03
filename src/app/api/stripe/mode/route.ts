import { NextResponse } from 'next/server';
import { getStripeConfig, getStripeModeDescription } from '@/lib/stripe-config';

export async function GET() {
  try {
    const config = getStripeConfig();
    
    return NextResponse.json({
      mode: config.mode,
      description: getStripeModeDescription(),
      isLive: config.isLive,
      publishableKeyPrefix: config.publishableKey.substring(0, 12) + '...'
    });
  } catch (error) {
    console.error('Error getting Stripe mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get Stripe configuration',
        mode: 'unknown',
        description: 'Configuration Error',
        isLive: false
      },
      { status: 500 }
    );
  }
}
