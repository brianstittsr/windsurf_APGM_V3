import { ResendEmailService } from '@/services/resendEmailService';

export const GHL_API_BASE = 'https://services.leadconnectorhq.com';
export const GHL_API_VERSION = '2021-07-28';
export const DEFAULT_SUCCESS_EMAIL = 'brianstittsr@gmail.com';

export interface GhlOAuthRefreshConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  userType: string;
  redirectUri: string;
  locationId?: string;
}

export interface GhlOAuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in: number;
  refresh_token: string;
  scope?: string;
  refreshTokenId?: string;
  userType?: string;
  companyId?: string;
  locationId?: string;
  userId?: string;
  traceId?: string;
  isBulkInstallation?: boolean;
}

export type GhlTokenRotationSource = 'vercel-cron-oauth-refresh' | 'manual-admin-rotation';

export interface PersistedGhlTokenRotation {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
  rotatedAt: string;
  tokenType?: string;
  scope?: string;
  refreshTokenId?: string;
  userType?: string;
  companyId?: string;
  locationId?: string;
  userId?: string;
  traceId?: string;
  source: GhlTokenRotationSource;
}

export interface TokenStore {
  saveRotation(rotation: PersistedGhlTokenRotation): Promise<void>;
}

export interface EmailSender {
  sendSuccessEmail(to: string, rotation: PersistedGhlTokenRotation): Promise<{ success: boolean; id?: string; error?: string }>;
}

export function getGhlOAuthRefreshConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GhlOAuthRefreshConfig {
  const clientId = env.GHL_OAUTH_CLIENT_ID || '';
  const clientSecret = env.GHL_OAUTH_CLIENT_SECRET || '';
  const refreshToken = env.GHL_OAUTH_REFRESH_TOKEN || '';
  const userType = env.GHL_OAUTH_USER_TYPE || 'Company';
  const redirectUri = env.GHL_OAUTH_REDIRECT_URI || '';
  const locationId = env.GHL_LOCATION_ID || undefined;

  const missing = [
    ['GHL_OAUTH_CLIENT_ID', clientId],
    ['GHL_OAUTH_CLIENT_SECRET', clientSecret],
    ['GHL_OAUTH_REFRESH_TOKEN', refreshToken],
    ['GHL_OAUTH_REDIRECT_URI', redirectUri],
  ].filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required GoHighLevel OAuth environment variables: ${missing.join(', ')}`);
  }

  return { clientId, clientSecret, refreshToken, userType, redirectUri, locationId };
}

export function buildGhlOAuthRefreshForm(config: GhlOAuthRefreshConfig): string {
  const params = new URLSearchParams();
  params.set('client_id', config.clientId);
  params.set('client_secret', config.clientSecret);
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', config.refreshToken);
  params.set('user_type', config.userType || 'Company');
  params.set('redirect_uri', config.redirectUri);
  return params.toString();
}

export function computeTokenExpiry(expiresInSeconds: number, now = new Date()): Date {
  return new Date(now.getTime() + Number(expiresInSeconds || 0) * 1000);
}

export function shouldAuthorizeCronRequest(authorizationHeader?: string | null, expectedSecret?: string): boolean {
  if (!expectedSecret) return true;
  if (!authorizationHeader) return false;
  const normalized = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : authorizationHeader;
  return normalized === expectedSecret;
}

export async function refreshGhlOAuthToken(
  config: GhlOAuthRefreshConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<GhlOAuthTokenResponse> {
  const response = await fetchImpl(`${GHL_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buildGhlOAuthRefreshForm(config),
  });

  const rawText = await response.text();
  let payload: unknown;
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(`GoHighLevel OAuth refresh returned non-JSON HTTP ${response.status}: ${rawText.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`GoHighLevel OAuth refresh failed HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 1000)}`);
  }

  const token = payload as Partial<GhlOAuthTokenResponse>;
  if (!token.access_token || !token.refresh_token || !token.expires_in) {
    throw new Error(`GoHighLevel OAuth refresh response was missing required token fields: ${JSON.stringify(payload).slice(0, 1000)}`);
  }

  return token as GhlOAuthTokenResponse;
}

export function toPersistedRotation(
  token: GhlOAuthTokenResponse,
  config: Pick<GhlOAuthRefreshConfig, 'locationId'> = {},
  now = new Date(),
  source: GhlTokenRotationSource = 'vercel-cron-oauth-refresh',
): PersistedGhlTokenRotation {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresIn: token.expires_in,
    expiresAt: computeTokenExpiry(token.expires_in, now).toISOString(),
    rotatedAt: now.toISOString(),
    tokenType: token.token_type,
    scope: token.scope,
    refreshTokenId: token.refreshTokenId,
    userType: token.userType,
    companyId: token.companyId,
    locationId: token.locationId || config.locationId,
    userId: token.userId,
    traceId: token.traceId,
    source,
  };
}

export function createRotationEmailTemplate(args: {
  rotatedAt: Date;
  expiresAt: Date;
  companyId?: string;
  locationId?: string;
  refreshTokenId?: string;
  emailTo: string;
}) {
  const subject = `GoHighLevel token rotation successful - ${args.rotatedAt.toISOString()}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>GoHighLevel token rotation successful</h2>
      <p>The APGM V3 Vercel automation successfully refreshed the GoHighLevel OAuth token.</p>
      <table style="border-collapse: collapse; margin-top: 16px;">
        <tr><td style="font-weight: bold; padding: 4px 12px 4px 0;">Rotated at</td><td>${args.rotatedAt.toISOString()}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 12px 4px 0;">Expires at</td><td>${args.expiresAt.toISOString()}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 12px 4px 0;">Company ID</td><td>${args.companyId || 'n/a'}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 12px 4px 0;">Location ID</td><td>${args.locationId || 'n/a'}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 12px 4px 0;">Refresh token ID</td><td>${args.refreshTokenId || 'n/a'}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 12px 4px 0;">Notification recipient</td><td>${args.emailTo}</td></tr>
      </table>
      <p style="margin-top: 16px;">No token values are included in this email for security.</p>
    </div>`;
  const textContent = [
    'GoHighLevel token rotation successful',
    '',
    `The APGM V3 Vercel automation successfully refreshed the GoHighLevel OAuth token.`,
    `Rotated at: ${args.rotatedAt.toISOString()}`,
    `Expires at: ${args.expiresAt.toISOString()}`,
    `Company ID: ${args.companyId || 'n/a'}`,
    `Location ID: ${args.locationId || 'n/a'}`,
    `Refresh token ID: ${args.refreshTokenId || 'n/a'}`,
    `Notification recipient: ${args.emailTo}`,
    '',
    'No token values are included in this email for security.',
  ].join('\n');

  return { subject, htmlContent, textContent };
}

export class ResendGhlRotationEmailSender implements EmailSender {
  async sendSuccessEmail(to: string, rotation: PersistedGhlTokenRotation) {
    const rotatedAt = new Date(rotation.rotatedAt);
    const expiresAt = new Date(rotation.expiresAt);
    return ResendEmailService.sendEmail(
      to,
      createRotationEmailTemplate({
        rotatedAt,
        expiresAt,
        companyId: rotation.companyId,
        locationId: rotation.locationId,
        refreshTokenId: rotation.refreshTokenId,
        emailTo: to,
      }),
      process.env.RESEND_FROM_EMAIL || process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    );
  }
}

export async function rotateGhlTokenAndNotify(args: {
  config: GhlOAuthRefreshConfig;
  store: TokenStore;
  emailSender: EmailSender;
  emailTo?: string;
  fetchImpl?: typeof fetch;
  now?: Date;
  source?: GhlTokenRotationSource;
}) {
  const now = args.now || new Date();
  const token = await refreshGhlOAuthToken(args.config, args.fetchImpl || fetch);
  const rotation = toPersistedRotation(token, { locationId: args.config.locationId }, now, args.source);
  await args.store.saveRotation(rotation);

  const emailTo = args.emailTo || process.env.GHL_ROTATION_SUCCESS_EMAIL || DEFAULT_SUCCESS_EMAIL;
  const email = await args.emailSender.sendSuccessEmail(emailTo, rotation);
  if (!email.success) {
    throw new Error(`Token rotated, but success email failed: ${email.error || 'unknown email error'}`);
  }

  return { rotation, email };
}
