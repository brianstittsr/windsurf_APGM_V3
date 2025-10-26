import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { artistId } = await req.json();

    if (!artistId) {
      return NextResponse.json(
        { error: 'Artist ID is required' },
        { status: 400 }
      );
    }

    // Remove Outlook connection data from the artist-availability document
    const availabilityRef = doc(db, 'artist-availability', artistId);
    await updateDoc(availabilityRef, {
      outlookConnected: deleteField(),
      outlookAccessToken: deleteField(),
      outlookRefreshToken: deleteField(),
      outlookTokenExpiry: deleteField(),
      outlookEmail: deleteField(),
    });

    return NextResponse.json({ success: true, message: 'Outlook Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Outlook Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Outlook Calendar' },
      { status: 500 }
    );
  }
}
