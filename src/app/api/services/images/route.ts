import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// GET /api/services/images — list all service images
export async function GET() {
  try {
    const snapshot = await db.collection('serviceImages').get();

    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a: any, b: any) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, images }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service images:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/services/images — create a new service image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, base64, mimeType, size } = body;

    if (!name || !base64 || !mimeType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, base64, mimeType' },
        { status: 400 }
      );
    }

    const docRef = await db.collection('serviceImages').add({
      name,
      base64,
      mimeType,
      size: size || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({ success: true, id: docRef.id, message: 'Image created' }, { status: 200 });
  } catch (error) {
    console.error('Error creating service image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
