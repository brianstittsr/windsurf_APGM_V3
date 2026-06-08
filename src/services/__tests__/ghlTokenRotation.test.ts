import assert from 'node:assert/strict';
import {
  buildGhlOAuthRefreshForm,
  computeTokenExpiry,
  createRotationEmailTemplate,
  shouldAuthorizeCronRequest,
  toPersistedRotation,
} from '../ghlTokenRotation';

function testBuildRefreshForm() {
  const body = buildGhlOAuthRefreshForm({
    clientId: 'client id',
    clientSecret: 'secret/value',
    refreshToken: 'refresh token',
    userType: 'Company',
    redirectUri: 'https://example.com/oauth/callback?x=1',
  });

  const params = new URLSearchParams(body);
  assert.equal(params.get('client_id'), 'client id');
  assert.equal(params.get('client_secret'), 'secret/value');
  assert.equal(params.get('grant_type'), 'refresh_token');
  assert.equal(params.get('refresh_token'), 'refresh token');
  assert.equal(params.get('user_type'), 'Company');
  assert.equal(params.get('redirect_uri'), 'https://example.com/oauth/callback?x=1');
}

function testComputeTokenExpiry() {
  const now = new Date('2026-06-06T12:00:00.000Z');
  assert.equal(computeTokenExpiry(3600, now).toISOString(), '2026-06-06T13:00:00.000Z');
}

function testCronAuthorization() {
  assert.equal(shouldAuthorizeCronRequest(undefined, undefined), true);
  assert.equal(shouldAuthorizeCronRequest('Bearer abc', 'abc'), true);
  assert.equal(shouldAuthorizeCronRequest('abc', 'abc'), true);
  assert.equal(shouldAuthorizeCronRequest('Bearer wrong', 'abc'), false);
}

function testPersistedRotationSourceDefaultsToCronAndSupportsManual() {
  const token = {
    access_token: 'access-token-1234',
    refresh_token: 'refresh-token-5678',
    expires_in: 3600,
    token_type: 'Bearer',
    companyId: 'cmp_123',
  };

  const cronRotation = toPersistedRotation(token, {}, new Date('2026-06-06T12:00:00.000Z'));
  const manualRotation = toPersistedRotation(token, {}, new Date('2026-06-06T12:00:00.000Z'), 'manual-admin-rotation');

  assert.equal(cronRotation.source, 'vercel-cron-oauth-refresh');
  assert.equal(manualRotation.source, 'manual-admin-rotation');
}

function testSuccessEmailTemplate() {
  const template = createRotationEmailTemplate({
    rotatedAt: new Date('2026-06-06T12:00:00.000Z'),
    expiresAt: new Date('2026-06-07T12:00:00.000Z'),
    companyId: 'cmp_123',
    locationId: 'loc_456',
    refreshTokenId: 'rt_789',
    emailTo: 'brianstittsr@gmail.com',
  });

  assert.match(template.subject, /GoHighLevel token rotation successful/);
  assert.match(template.htmlContent, /cmp_123/);
  assert.match(template.htmlContent, /loc_456/);
  assert.match(template.textContent, /rt_789/);
  assert.match(template.textContent, /brianstittsr@gmail.com/);
}

testBuildRefreshForm();
testComputeTokenExpiry();
testCronAuthorization();
testPersistedRotationSourceDefaultsToCronAndSupportsManual();
testSuccessEmailTemplate();
console.log('PASS: ghlTokenRotation unit tests');
