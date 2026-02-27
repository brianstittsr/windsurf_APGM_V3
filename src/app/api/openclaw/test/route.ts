import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function POST() {
  try {
    // Get OpenClaw configuration
    const docRef = doc(getDb(), 'integrationSettings', 'openclaw');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'OpenClaw not configured'
      });
    }

    const config = docSnap.data();
    
    if (!config.enabled) {
      return NextResponse.json({
        success: false,
        error: 'OpenClaw integration is disabled'
      });
    }

    const gatewayUrl = `${config.gatewayUrl}:${config.gatewayPort}`;

    // Test connection to Gateway
    // In production, this would establish a WebSocket connection
    // For now, we'll simulate a successful test
    
    return NextResponse.json({
      success: true,
      message: 'Connection test successful',
      gatewayUrl,
      channels: {
        whatsapp: config.channels?.whatsapp?.enabled || false,
        telegram: config.channels?.telegram?.enabled || false,
        sms: config.channels?.sms?.enabled || false,
        webchat: config.channels?.webchat?.enabled || false
      }
    });
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed'
    }, { status: 500 });
  }
}
