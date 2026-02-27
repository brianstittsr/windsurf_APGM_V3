import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET() {
  try {
    const docRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 400 }
      );
    }

    const config = docSnap.data();
    
    if (!config.clientId || !config.clientSecret) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration is valid'
    });
  } catch (error) {
    console.error('Error testing Google Calendar config:', error);
    return NextResponse.json(
      { error: 'Failed to test configuration' },
      { status: 500 }
    );
  }
}
