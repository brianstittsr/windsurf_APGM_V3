# GoHighLevel Token Rotation Automation

This site now includes a Vercel Cron automation at:

```text
/api/cron/rotate-ghl-token
```

It runs every 2 days from `vercel.json`:

```json
{
  "path": "/api/cron/rotate-ghl-token",
  "schedule": "0 9 */2 * *"
}
```

## Important implementation note

GoHighLevel Private Integration Tokens are static/fixed OAuth-style tokens, but HighLevel's public documentation describes rotation as a UI action. I did not find a documented public API endpoint that can click **Rotate and expire this token later** for Private Integration Tokens.

This automation therefore implements the Vercel-hosted OAuth refresh-token process that the referenced video demonstrates. It refreshes the token, stores the new token in Firestore where the existing APGM GHL integrations already look for `crmSettings/gohighlevel.apiKey`, and emails Brian on success.

## Required Vercel environment variables

Set these in Vercel Project Settings → Environment Variables:

```text
GHL_OAUTH_CLIENT_ID=...
GHL_OAUTH_CLIENT_SECRET=...
GHL_OAUTH_REFRESH_TOKEN=...
GHL_OAUTH_REDIRECT_URI=...
GHL_OAUTH_USER_TYPE=Company
GHL_LOCATION_ID=...
GHL_ROTATION_SUCCESS_EMAIL=brianstittsr@gmail.com
RESEND_API_KEY=...
RESEND_FROM_EMAIL=info@aprettygirl.com
CRON_SECRET=...
```

Existing Firebase variables must also be configured because the automation stores the rotated token in Firestore:

```text
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

## What gets updated in Firestore

Document:

```text
crmSettings/gohighlevel
```

Fields include:

```text
apiKey
accessToken
refreshToken
tokenType
expiresIn
expiresAt
lastRotatedAt
scope
refreshTokenId
userType
companyId
locationId
userId
tokenSource
updatedAt
```

A redacted history record is also written under:

```text
ghlTokenRotationHistory/{timestamp}
```

The history record does not store full token values.

## Success email

On successful refresh and Firestore update, the route sends an email to:

```text
brianstittsr@gmail.com
```

The email includes metadata like rotated time, expiration time, company ID, location ID, and refresh token ID, but it does not include token values.

## Manual test after deploy

Invoke the route with the cron secret:

```bash
curl https://YOUR-VERCEL-DOMAIN.vercel.app/api/cron/rotate-ghl-token --header Authorization:Bearer:REDACTED
```

Expected success response:

```json
{
  "success": true,
  "message": "GoHighLevel token refreshed and success email sent.",
  "rotatedAt": "...",
  "expiresAt": "...",
  "companyId": "...",
  "locationId": "...",
  "refreshTokenId": "...",
  "emailId": "..."
}
```

## If it fails

- `Missing required GoHighLevel OAuth environment variables`: add the missing Vercel env vars.
- `GoHighLevel OAuth refresh failed HTTP 400`: the refresh token may be invalid/used/revoked, or redirect URI/client credentials do not match the OAuth app.
- `Token rotated, but success email failed`: check `RESEND_API_KEY` and verified sender domain/email.
- Firebase errors: check Firebase service account env vars.
