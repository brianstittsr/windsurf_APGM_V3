import { NextRequest, NextResponse } from 'next/server';
import { doc, deleteDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

// POST - Disconnect Canva account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Delete the integration record from Firestore
    await deleteDoc(doc(getDb(), 'canvaIntegration', userId));

    return NextResponse.json({
      success: true,
      message: 'Canva account disconnected successfully'
    });

  } catch (error) {
    console.error('Error disconnecting Canva:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
