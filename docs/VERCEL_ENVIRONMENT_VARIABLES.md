# Vercel Environment Variables Setup

## Issue

The API routes are failing with:
```
FirebaseError: Missing or insufficient permissions.
```

This means the **Firebase Admin SDK credentials** are not configured in Vercel.

## Required Environment Variables

Your Vercel project needs these environment variables for the API routes to work:

### Firebase Admin SDK (Server-Side)

These are used by API routes (`/api/*`) for server-side Firebase access:

1. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
   - Your Firebase project ID
   - Example: `aprettygirlmatterllc`

2. **FIREBASE_CLIENT_EMAIL**
   - Service account email
   - Example: `firebase-adminsdk-xxxxx@aprettygirlmatterllc.iam.gserviceaccount.com`

3. **FIREBASE_PRIVATE_KEY**
   - Service account private key
   - **Important**: Must be the full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - **Important**: Newlines must be preserved (use `\n` in Vercel)

### Firebase Client SDK (Browser-Side)

These are already set (for client-side Firebase):

- ✅ NEXT_PUBLIC_FIREBASE_API_KEY
- ✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- ✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
- ✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- ✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- ✅ NEXT_PUBLIC_FIREBASE_APP_ID

### GoHighLevel (Optional - can be set in admin dashboard)

- GHL_API_KEY (optional - can be set in dashboard)
- GHL_LOCATION_ID (optional - can be set in dashboard)

## How to Get Firebase Admin Credentials

### Step 1: Go to Firebase Console

1. Visit: https://console.firebase.google.com
2. Select project: **aprettygirlmatterllc**
3. Click the **gear icon** (⚙️) → **Project settings**
4. Click **Service accounts** tab

### Step 2: Generate Private Key

1. Click **"Generate new private key"** button
2. Click **"Generate key"** in the confirmation dialog
3. A JSON file will download (e.g., `aprettygirlmatterllc-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract Values from JSON

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "aprettygirlmatterllc",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@aprettygirlmatterllc.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

Extract these values:
- **project_id** → Use for `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **client_email** → Use for `FIREBASE_CLIENT_EMAIL`
- **private_key** → Use for `FIREBASE_PRIVATE_KEY`

## How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit: https://vercel.com/tdaent/windsurf-apgm-v3
   - Click **Settings** tab
   - Click **Environment Variables**

2. **Add Each Variable:**

   **Variable 1:**
   - Name: `FIREBASE_CLIENT_EMAIL`
   - Value: `firebase-adminsdk-xxxxx@aprettygirlmatterllc.iam.gserviceaccount.com`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 2:**
   - Name: `FIREBASE_PRIVATE_KEY`
   - Value: Copy the ENTIRE private_key from JSON (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - **Important**: The value should look like:
     ```
     -----BEGIN PRIVATE KEY-----
     MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
     ...many lines...
     -----END PRIVATE KEY-----
     ```
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

3. **Redeploy:**
   - After adding variables, click **Deployments** tab
   - Click the **three dots** (⋯) on the latest deployment
   - Click **Redeploy**
   - Check **"Use existing Build Cache"**
   - Click **Redeploy**

### Method 2: Vercel CLI

```bash
# Set client email
vercel env add FIREBASE_CLIENT_EMAIL

# Set private key (paste the entire key when prompted)
vercel env add FIREBASE_PRIVATE_KEY

# Redeploy
vercel --prod
```

## Verify Environment Variables

After adding and redeploying:

1. **Check Vercel Logs:**
   - Go to: https://vercel.com/tdaent/windsurf-apgm-v3
   - Click **Deployments** → Latest deployment
   - Click **Functions** tab
   - Look for `/api/calendar/sync-all-ghl`
   - Check logs for `[sync-all-ghl]` messages

2. **Test the API:**
   - Go to: www.aprettygirlmatter.com/dashboard
   - Click **Calendar** tab
   - Click **"Sync All with GHL"**
   - Should work without 500 error

## Common Issues

### Issue: "Missing or insufficient permissions"

**Cause**: Firebase Admin credentials not set or incorrect

**Fix**:
1. Verify `FIREBASE_CLIENT_EMAIL` is set
2. Verify `FIREBASE_PRIVATE_KEY` is set
3. Verify private key includes BEGIN/END markers
4. Redeploy after adding variables

### Issue: "Invalid service account"

**Cause**: Private key format is wrong

**Fix**:
1. Make sure you copied the ENTIRE private_key value
2. Include `-----BEGIN PRIVATE KEY-----` at the start
3. Include `-----END PRIVATE KEY-----` at the end
4. Preserve all newlines (use `\n` if needed)

### Issue: Still getting 500 error after adding variables

**Cause**: Deployment hasn't picked up new variables

**Fix**:
1. Go to Vercel → Deployments
2. Redeploy the latest deployment
3. Wait 2-3 minutes for deployment to complete
4. Hard refresh your site (Ctrl + Shift + R)

## Security Notes

⚠️ **IMPORTANT**:
- Never commit the service account JSON file to Git
- Never share your private key publicly
- The private key gives full access to your Firebase project
- Keep it secure in Vercel environment variables only

## Summary Checklist

- [ ] Download service account JSON from Firebase
- [ ] Extract `client_email` and `private_key` values
- [ ] Add `FIREBASE_CLIENT_EMAIL` to Vercel
- [ ] Add `FIREBASE_PRIVATE_KEY` to Vercel (with BEGIN/END markers)
- [ ] Redeploy from Vercel dashboard
- [ ] Wait 2-3 minutes for deployment
- [ ] Test Calendar sync - should work!

Once these variables are set, the 500 error will be fixed! 🎉
