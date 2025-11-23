# Troubleshooting: Calendar Sync Not Working

## Current Status

You've added:
- ✅ Location ID to GoHighLevel Manager
- ✅ Environment variables for Firebase Admin

But the calendar sync is still failing with 500 errors.

## Step-by-Step Diagnostic

### Step 1: Test Firebase Admin Connection

After the latest deployment completes (wait 2-3 minutes), visit this URL:

**https://www.aprettygirlmatter.com/api/test-firebase-admin**

**Expected Result:**
```json
{
  "success": true,
  "message": "Firebase Admin SDK is working correctly",
  "details": {
    "hasProjectId": true,
    "hasClientEmail": true,
    "hasPrivateKey": true,
    "firestoreConnected": true,
    "testCollectionSize": 1
  }
}
```

**If you see `success: false`:**
- The environment variables are not set correctly in Vercel
- Follow the guide in `docs/VERCEL_ENVIRONMENT_VARIABLES.md`

**If you see `hasProjectId: false` or `hasClientEmail: false` or `hasPrivateKey: false`:**
- That specific environment variable is missing in Vercel
- Add it in Vercel Settings → Environment Variables
- Redeploy

### Step 2: Check Vercel Environment Variables

1. Go to: https://vercel.com/tdaent/windsurf-apgm-v3/settings/environment-variables

2. Verify these variables exist:
   - ✅ `FIREBASE_CLIENT_EMAIL`
   - ✅ `FIREBASE_PRIVATE_KEY`
   - ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

3. **Important**: Each variable should be set for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

4. **If any are missing**, add them:
   - Click "Add New"
   - Enter name and value
   - Select all three environments
   - Click Save
   - **Then redeploy**

### Step 3: Check Vercel Function Logs

1. Go to: https://vercel.com/tdaent/windsurf-apgm-v3/deployments

2. Click on the **latest deployment**

3. Click **"Functions"** tab

4. Look for `/api/calendar/sync-all-ghl`

5. Check the logs for errors

**Common errors:**
- `"Missing or insufficient permissions"` → Firebase Admin credentials not set
- `"Failed to get Firestore instance"` → Firebase Admin not initialized
- `"Cannot find module"` → Deployment issue, redeploy

### Step 4: Verify GHL Credentials in Firestore

The GHL credentials should be stored in Firestore. Let's verify:

1. Go to: https://console.firebase.google.com
2. Select: **aprettygirlmatterllc**
3. Click: **Firestore Database**
4. Look for collection: `crmSettings`
5. Look for document: `gohighlevel`
6. Verify it has:
   - `apiKey`: Your GHL API key
   - `locationId`: Your GHL location ID

**If the document doesn't exist:**
- Go to your admin dashboard
- Click GoHighLevel tab
- Enter API Key and Location ID
- Click "Save Settings"

### Step 5: Test GHL Connection

In your admin dashboard:

1. Click **GoHighLevel** tab
2. Verify API Key and Location ID are filled
3. Click **"Test Connection"** button

**Expected result:**
- ✅ "Connection successful! Found X location(s)."

**If it fails:**
- Check your GHL API key is correct
- Check your Location ID is correct
- Verify the API key has the required scopes:
  - `calendars.readonly`
  - `calendars/events.readonly`
  - `contacts.readonly`

### Step 6: Try Local Import First

Before testing the web sync, try importing from your local machine:

```bash
npm run import-ghl-appointments
```

**Expected output:**
```
🚀 Starting GHL Appointment Import...
✅ GHL credentials found
📋 Available calendars:
   - Service (ID: abc123)
✅ Using calendar: "Service"
📅 Fetching appointments...
✅ Found X appointments
📥 Importing...
```

**If this works locally but not on the website:**
- The issue is with Vercel environment variables
- The Firebase Admin credentials are not set in Vercel

**If this fails locally:**
- Check your `.env.local` file has correct credentials
- Run `npm run test-ghl` to verify GHL connection

## Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions"

**Cause**: Firebase Admin credentials not in Vercel

**Solution**:
1. Get service account JSON from Firebase Console
2. Add `FIREBASE_CLIENT_EMAIL` to Vercel
3. Add `FIREBASE_PRIVATE_KEY` to Vercel (entire key with BEGIN/END)
4. Redeploy

### Issue 2: "Failed to sync bookings with GHL"

**Cause**: Multiple possible causes

**Check**:
1. Are GHL credentials saved in admin dashboard?
2. Does "Test Connection" work in GoHighLevel tab?
3. Is the API key valid and has correct scopes?
4. Is the Location ID correct?

### Issue 3: Sync button does nothing or shows generic error

**Cause**: API endpoint is failing before it can return a proper error

**Solution**:
1. Check Vercel function logs (Step 3 above)
2. Visit `/api/test-firebase-admin` to verify Firebase works
3. Check browser console for actual error message

### Issue 4: "No bookings to sync" but you have bookings in GHL

**This is expected!** The sync button syncs FROM your website TO GHL, not the other way.

**To import FROM GHL TO website:**
```bash
npm run import-ghl-appointments
```

This will import your GHL Service calendar appointments into the website.

## Quick Checklist

- [ ] Vercel has `FIREBASE_CLIENT_EMAIL` environment variable
- [ ] Vercel has `FIREBASE_PRIVATE_KEY` environment variable  
- [ ] Both variables are set for Production, Preview, AND Development
- [ ] Latest deployment has completed (check Vercel)
- [ ] `/api/test-firebase-admin` returns `success: true`
- [ ] GoHighLevel tab has API Key and Location ID saved
- [ ] "Test Connection" in GoHighLevel tab works
- [ ] Tried `npm run import-ghl-appointments` locally

## Next Steps After Fixing

Once all diagnostics pass:

1. **Import GHL appointments:**
   ```bash
   npm run import-ghl-appointments
   ```

2. **View in Calendar tab:**
   - Go to admin dashboard
   - Click Calendar tab
   - See your imported appointments

3. **Sync works both ways:**
   - Website → GHL: "Sync All with GHL" button
   - GHL → Website: `npm run import-ghl-appointments` script

## Need More Help?

If you've completed all steps and it's still not working:

1. Share the output of `/api/test-firebase-admin`
2. Share the Vercel function logs for `/api/calendar/sync-all-ghl`
3. Share the output of `npm run import-ghl-appointments`

This will help identify the exact issue!
