import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await db.collection('serviceImages').doc(id).delete();
    return NextResponse.json({ success: true, message: 'Image deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting service image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
