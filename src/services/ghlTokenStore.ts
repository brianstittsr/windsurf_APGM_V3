import { db } from '@/lib/firebase-admin';
import type { PersistedGhlTokenRotation, TokenStore } from '@/services/ghlTokenRotation';

export class FirestoreGhlTokenStore implements TokenStore {
  async saveRotation(rotation: PersistedGhlTokenRotation): Promise<void> {
    const batch = db.batch();

    const settingsRef = db.collection('crmSettings').doc('gohighlevel');
    batch.set(settingsRef, {
      apiKey: rotation.accessToken,
      accessToken: rotation.accessToken,
      refreshToken: rotation.refreshToken,
      tokenType: rotation.tokenType || 'Bearer',
      expiresIn: rotation.expiresIn,
      expiresAt: rotation.expiresAt,
      lastRotatedAt: rotation.rotatedAt,
      scope: rotation.scope || '',
      refreshTokenId: rotation.refreshTokenId || '',
      userType: rotation.userType || '',
      companyId: rotation.companyId || '',
      locationId: rotation.locationId || process.env.GHL_LOCATION_ID || '',
      userId: rotation.userId || '',
      traceId: rotation.traceId || '',
      tokenSource: rotation.source,
      updatedAt: rotation.rotatedAt,
    }, { merge: true });

    const historyRef = db.collection('ghlTokenRotationHistory').doc(rotation.rotatedAt.replace(/[.:]/g, '-'));
    batch.set(historyRef, {
      ...rotation,
      // Do not persist full token values in history records.
      accessToken: '[redacted]',
      refreshToken: '[redacted]',
      accessTokenLast4: rotation.accessToken.slice(-4),
      refreshTokenLast4: rotation.refreshToken.slice(-4),
    });

    await batch.commit();
  }
}
