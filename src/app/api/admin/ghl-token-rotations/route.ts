import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import {
  getGhlOAuthRefreshConfigFromEnv,
  ResendGhlRotationEmailSender,
  rotateGhlTokenAndNotify,
} from '@/services/ghlTokenRotation';
import { FirestoreGhlTokenStore } from '@/services/ghlTokenStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

type FirestoreRotationRecord = Record<string, unknown>;


async function requireAdmin(request: NextRequest) {
  const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Unauthorized - no admin token provided' }, { status: 401 }) };
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};
    const adminEmails = ['victoria@aprettygirlmatter.com', 'admin@atlantaglamourpmu.com', 'brianstittsr@gmail.com'];
    const isAdmin = userData.role === 'admin' || (!!decoded.email && adminEmails.includes(decoded.email));
    if (!isAdmin) {
      return { ok: false, response: NextResponse.json({ success: false, error: 'Forbidden - admin access required' }, { status: 403 }) };
    }
    return { ok: true, uid: decoded.uid, email: decoded.email || null };
  } catch (error) {
    console.error('[GHL Token Rotation Admin] Admin verification failed:', error);
    return { ok: false, response: NextResponse.json({ success: false, error: 'Unauthorized - invalid admin token' }, { status: 401 }) };
  }
}

function publicRotationRecord(id: string, data: FirestoreRotationRecord) {
  return {
    id,
    rotatedAt: data.rotatedAt || null,
    expiresAt: data.expiresAt || null,
    source: data.source || 'unknown',
    tokenType: data.tokenType || null,
    scope: data.scope || null,
    companyId: data.companyId || null,
    locationId: data.locationId || null,
    userId: data.userId || null,
    refreshTokenId: data.refreshTokenId || null,
    traceId: data.traceId || null,
    accessTokenLast4: data.accessTokenLast4 || null,
    refreshTokenLast4: data.refreshTokenLast4 || null,
  };
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const settingsSnapshot = await db.collection('crmSettings').doc('gohighlevel').get();
    const settings = settingsSnapshot.exists ? settingsSnapshot.data() || {} : {};

    const historySnapshot = await db
      .collection('ghlTokenRotationHistory')
      .orderBy('rotatedAt', 'desc')
      .limit(50)
      .get();

    const rotations = historySnapshot.docs.map((doc) => publicRotationRecord(doc.id, doc.data()));

    return NextResponse.json({
      success: true,
      current: {
        exists: settingsSnapshot.exists,
        lastRotatedAt: settings.lastRotatedAt || null,
        expiresAt: settings.expiresAt || null,
        tokenSource: settings.tokenSource || null,
        tokenType: settings.tokenType || null,
        scope: settings.scope || null,
        companyId: settings.companyId || null,
        locationId: settings.locationId || null,
        userId: settings.userId || null,
        refreshTokenId: settings.refreshTokenId || null,
        traceId: settings.traceId || null,
      },
      rotations,
    });
  } catch (error) {
    console.error('[GHL Token Rotation Admin] Failed to load rotations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load token rotation history',
      rotations: [],
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json().catch(() => ({}));
    const emailTo = typeof body.emailTo === 'string' && body.emailTo.trim()
      ? body.emailTo.trim()
      : process.env.GHL_ROTATION_SUCCESS_EMAIL || 'brianstittsr@gmail.com';

    const result = await rotateGhlTokenAndNotify({
      config: getGhlOAuthRefreshConfigFromEnv(),
      store: new FirestoreGhlTokenStore(),
      emailSender: new ResendGhlRotationEmailSender(),
      emailTo,
      source: 'manual-admin-rotation',
    });

    return NextResponse.json({
      success: true,
      message: 'GoHighLevel private token rotated manually.',
      rotation: publicRotationRecord(result.rotation.rotatedAt.replace(/[.:]/g, '-'), {
        ...result.rotation,
        requestedByUid: admin.uid,
        requestedByEmail: admin.email,
        accessTokenLast4: result.rotation.accessToken.slice(-4),
        refreshTokenLast4: result.rotation.refreshToken.slice(-4),
      }),
      emailId: result.email.id || null,
    });
  } catch (error) {
    console.error('[GHL Token Rotation Admin] Manual rotation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Manual token rotation failed',
    }, { status: 500 });
  }
}
