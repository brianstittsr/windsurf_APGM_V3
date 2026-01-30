import { NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/services/googleCalendar';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const contentType = headers.get('content-type');
    
    // Verify content type
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Verify this is a valid Google Calendar notification
    if (body.syncToken) {
      // Handle sync token updates
      const userId = body.state; // We stored userId in state during OAuth
      if (!userId) {
        return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
      }
      
      // Store the sync token for future syncs
      const userRef = doc(getDb(), 'googleCalendarTokens', userId);
      await setDoc(userRef, { syncToken: body.syncToken }, { merge: true });
      
      return NextResponse.json({ success: true });
    }
    
    // Handle actual event changes
    if (body.events) {
      // Process each changed event
      for (const event of body.events) {
        // TODO: Implement event sync logic
        console.log('Event changed:', event);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Google Calendar webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Used for webhook verification
  return NextResponse.json({ status: 'active' });
}
