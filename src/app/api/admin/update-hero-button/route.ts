import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const NEW_BUTTON_TEXT = 'Your Pretty Girl Matter Consultation Starts Here';
const NEW_BUTTON_LINK = 'https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP';
const OLD_BUTTON_TEXTS = ['Book Now', 'Schedule a Virtual Consultation'];

export async function POST() {
  try {
    const snapshot = await db.collection('heroSlides').get();
    const updates: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        if (OLD_BUTTON_TEXTS.includes(data.buttonText) || !data.buttonText) {
          await docSnap.ref.update({
            buttonText: NEW_BUTTON_TEXT,
            buttonLink: NEW_BUTTON_LINK,
            updatedAt: Timestamp.now()
          });
          updates.push({ id: docSnap.id, success: true });
        }
      } catch (error) {
        updates.push({ id: docSnap.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({ success: true, updated: updates.length, updates });
  } catch (error) {
    console.error('Update hero button error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
