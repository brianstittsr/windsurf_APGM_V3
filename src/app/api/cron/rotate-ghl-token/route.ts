import { NextRequest, NextResponse } from 'next/server';
import {
  getGhlOAuthRefreshConfigFromEnv,
  ResendGhlRotationEmailSender,
  rotateGhlTokenAndNotify,
  shouldAuthorizeCronRequest,
} from '@/services/ghlTokenRotation';
import { FirestoreGhlTokenStore } from '@/services/ghlTokenStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!shouldAuthorizeCronRequest(authorization, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = getGhlOAuthRefreshConfigFromEnv();
    const result = await rotateGhlTokenAndNotify({
      config,
      store: new FirestoreGhlTokenStore(),
      emailSender: new ResendGhlRotationEmailSender(),
      emailTo: process.env.GHL_ROTATION_SUCCESS_EMAIL || 'brianstittsr@gmail.com',
    });

    return NextResponse.json({
      success: true,
      message: 'GoHighLevel token refreshed and success email sent.',
      rotatedAt: result.rotation.rotatedAt,
      expiresAt: result.rotation.expiresAt,
      companyId: result.rotation.companyId || null,
      locationId: result.rotation.locationId || null,
      refreshTokenId: result.rotation.refreshTokenId || null,
      emailId: result.email.id || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GHL Token Rotation Cron] Failed:', error);
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}
