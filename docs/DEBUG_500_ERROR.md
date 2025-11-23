# Debug 500 Error on Calendar Sync

## Current Status

The deployment is live (new hash: `dpl_VD174iUFXxddpsJdwGKDohrQFKHk`) but still getting 500 error.

This means the issue is NOT the "no bookings" fix - there's a different error.

## How to Debug

### Step 1: Check Vercel Function Logs

1. Go to: https://vercel.com/tdaent/windsurf-apgm-v3
2. Click "Deployments" tab
3. Click on the latest deployment
4. Click "Functions" tab
5. Look for `/api/calendar/sync-all-ghl`
6. Check the error logs

### Step 2: Test Locally

Run the site locally to see the actual error:

```bash
npm run dev
```

Then:
1. Go to: http://localhost:3000/dashboard
2. Click Calendar tab
3. Open DevTools Console (F12)
4. Look for the actual error message

### Step 3: Check Server Logs

In the terminal where `npm run dev` is running, you should see the actual error.

## Common Causes of 500 Error

### 1. Firestore getDb() Issue

The `getDb()` function might be failing in production.

**Check:** Does the error happen before or after trying to read from Firestore?

**Fix:** The sync-all-ghl endpoint needs to handle Firestore errors better.

### 2. Missing Environment Variables

Firebase credentials might not be set in Vercel.

**Check:** Vercel Dashboard → Settings → Environment Variables

**Required:**
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### 3. Firestore Permissions

The admin SDK might not have permission to read bookings.

**Check:** Firebase Console → Firestore → Rules

### 4. Import Error

The `getDb()` import might be failing in production build.

**Check:** Build logs for any import errors.

## Quick Test

Run this in browser console on the dashboard:

```javascript
fetch('/api/calendar/sync-all-ghl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

This will show you the actual error response.

## Next Steps

1. Check Vercel function logs (most important)
2. Test locally with `npm run dev`
3. Look at the actual error message
4. Fix based on the specific error

The error is happening server-side, so we need to see the server logs to know what's wrong.
