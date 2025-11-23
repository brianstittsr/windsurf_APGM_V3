import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { getDb } from '../../../../lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { qrCodeId } = await request.json();

    if (!qrCodeId) {
      return NextResponse.json(
        { error: 'QR Code ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const qrCodeRef = doc(db, 'qr-codes', qrCodeId);
    const qrCodeDoc = await getDoc(qrCodeRef);

    if (!qrCodeDoc.exists()) {
      return NextResponse.json(
        { error: 'QR Code not found' },
        { status: 404 }
      );
    }

    const qrCodeData = qrCodeDoc.data();

    // Update scan count and last scanned timestamp
    await updateDoc(qrCodeRef, {
      scans: increment(1),
      lastScannedAt: Timestamp.now()
    });

    // Return the target URL for redirect
    return NextResponse.json({
      success: true,
      url: qrCodeData.url,
      scans: (qrCodeData.scans || 0) + 1
    });
  } catch (error) {
    console.error('Error tracking QR code scan:', error);
    return NextResponse.json(
      { error: 'Failed to track scan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const qrCodeId = searchParams.get('id');

    if (!qrCodeId) {
      return NextResponse.json(
        { error: 'QR Code ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const qrCodeRef = doc(db, 'qr-codes', qrCodeId);
    const qrCodeDoc = await getDoc(qrCodeRef);

    if (!qrCodeDoc.exists()) {
      return NextResponse.json(
        { error: 'QR Code not found' },
        { status: 404 }
      );
    }

    const qrCodeData = qrCodeDoc.data();

    // Track the scan
    await updateDoc(qrCodeRef, {
      scans: increment(1),
      lastScannedAt: Timestamp.now()
    });

    // Redirect to the target URL
    return NextResponse.redirect(qrCodeData.url);
  } catch (error) {
    console.error('Error processing QR code scan:', error);
    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    );
  }
}
