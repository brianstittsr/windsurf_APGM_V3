import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { getDb } from '../../../../lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const qrCodesRef = collection(db, 'qr-codes');
    const q = query(qrCodesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const qrCodes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate analytics
    const totalQRCodes = qrCodes.length;
    const activeQRCodes = qrCodes.filter((qr: any) => qr.isActive).length;
    const totalScans = qrCodes.reduce((sum: number, qr: any) => sum + (qr.scans || 0), 0);
    const averageScans = totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0;

    // Top performing QR codes
    const topPerformers = qrCodes
      .sort((a: any, b: any) => (b.scans || 0) - (a.scans || 0))
      .slice(0, 5)
      .map((qr: any) => ({
        id: qr.id,
        name: qr.name,
        scans: qr.scans || 0,
        url: qr.url
      }));

    // Recently scanned
    const recentlyScanned = qrCodes
      .filter((qr: any) => qr.lastScannedAt)
      .sort((a: any, b: any) => {
        const aTime = a.lastScannedAt?.toMillis ? a.lastScannedAt.toMillis() : 0;
        const bTime = b.lastScannedAt?.toMillis ? b.lastScannedAt.toMillis() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((qr: any) => ({
        id: qr.id,
        name: qr.name,
        lastScannedAt: qr.lastScannedAt,
        scans: qr.scans || 0
      }));

    // QR codes with no scans
    const noScans = qrCodes.filter((qr: any) => !qr.scans || qr.scans === 0).length;

    return NextResponse.json({
      success: true,
      analytics: {
        totalQRCodes,
        activeQRCodes,
        inactiveQRCodes: totalQRCodes - activeQRCodes,
        totalScans,
        averageScans,
        noScans,
        topPerformers,
        recentlyScanned
      }
    });
  } catch (error) {
    console.error('Error fetching QR code analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
