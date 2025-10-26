import { NextResponse } from 'next/server';
import { getStripeConfig, getStripeModeAsync, getStripeModeDescription } from '@/lib/stripe-config';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET() {
  try {
    // Try to get mode from database first
    let mode: 'test' | 'live';
    let source = 'database';
    
    try {
      const configDoc = await getDoc(doc(getDb(), 'systemConfig', 'stripe'));
      if (configDoc.exists()) {
        const dbMode = configDoc.data().mode;
        if (dbMode === 'live' || dbMode === 'test') {
          mode = dbMode;
        } else {
          throw new Error('Invalid mode in database');
        }
      } else {
        throw new Error('No config document found');
      }
    } catch (dbError) {
      // Fallback to environment variable
      const config = getStripeConfig();
      mode = config.mode;
      source = 'environment';
    }
    
    // Get the full config for the determined mode
    const config = getStripeConfig();
    
    return NextResponse.json({
      mode: mode,
      description: getStripeModeDescription(),
      isLive: mode === 'live',
      publishableKeyPrefix: config.publishableKey.substring(0, 12) + '...',
      source: source
    });
  } catch (error) {
    console.error('Error getting Stripe mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get Stripe configuration',
        mode: 'unknown',
        description: 'Configuration Error',
        isLive: false,
        source: 'error'
      },
      { status: 500 }
    );
  }
}
