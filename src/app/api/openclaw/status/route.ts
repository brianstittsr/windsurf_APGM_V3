import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET() {
  try {
    // Get OpenClaw configuration
    const docRef = doc(getDb(), 'integrationSettings', 'openclaw');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || !docSnap.data().enabled) {
      return NextResponse.json({
        connected: false,
        message: 'OpenClaw not configured or disabled'
      });
    }

    const config = docSnap.data();
    const gatewayUrl = `${config.gatewayUrl}:${config.gatewayPort}`;

    // Try to connect to OpenClaw Gateway
    try {
      // In a real implementation, you would establish a WebSocket connection
      // For now, we'll simulate a connection check
      
      // Simulated status - in production, this would query the actual Gateway
      const status = {
        connected: true,
        version: '2024.1.30',
        uptime: 3600, // seconds
        activeChannels: []
      };

      // Check which channels are enabled
      if (config.channels?.whatsapp?.enabled && config.channels.whatsapp.paired) {
        status.activeChannels.push('WhatsApp');
      }
      if (config.channels?.telegram?.enabled && config.channels.telegram.botToken) {
        status.activeChannels.push('Telegram');
      }
      if (config.channels?.sms?.enabled) {
        status.activeChannels.push('SMS');
      }
      if (config.channels?.webchat?.enabled) {
        status.activeChannels.push('WebChat');
      }

      return NextResponse.json(status);
    } catch (error) {
      return NextResponse.json({
        connected: false,
        message: 'Cannot connect to Gateway at ' + gatewayUrl
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      connected: false,
      message: 'Error checking status'
    });
  }
}
