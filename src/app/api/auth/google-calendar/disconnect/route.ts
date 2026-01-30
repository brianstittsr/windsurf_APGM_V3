import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const userRef = doc(getDb(), 'googleCalendarTokens', userId);
    await deleteDoc(userRef);
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error disconnecting Google Calendar:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
