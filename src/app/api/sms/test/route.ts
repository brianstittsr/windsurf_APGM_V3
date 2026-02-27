import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function POST() {
  try {
    // Get SMS configuration
    const docRef = doc(getDb(), 'integrationSettings', 'sms');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'SMS not configured' },
        { status: 400 }
      );
    }

    const config = docSnap.data();

    if (config.provider === 'twilio') {
      // Test Twilio SMS
      if (!config.accountSid || !config.authToken || !config.phoneNumber) {
        return NextResponse.json(
          { error: 'Twilio credentials incomplete' },
          { status: 400 }
        );
      }

      // In production, you would send actual SMS here
      // For now, just validate configuration
      return NextResponse.json({
        success: true,
        message: 'SMS configuration is valid',
        provider: 'twilio',
        phoneNumber: config.phoneNumber
      });
    }

    if (config.provider === 'ghl') {
      // Test GHL SMS
      return NextResponse.json({
        success: true,
        message: 'GHL SMS is configured',
        provider: 'ghl'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SMS configuration found',
      provider: config.provider
    });
  } catch (error) {
    console.error('SMS test error:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
