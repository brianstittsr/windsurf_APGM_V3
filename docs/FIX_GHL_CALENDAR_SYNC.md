# How to Fix Calendar Sync with GoHighLevel

## Problem
The Calendar tab shows a 500 error when trying to sync bookings with GoHighLevel.

## Root Causes & Solutions

### 1. ✅ Missing or Invalid GHL API Credentials

**Check if you have GHL credentials configured:**

#### Option A: Check Firestore (Recommended)
1. Go to Firebase Console → Firestore Database
2. Look for collection: `crmSettings`
3. Look for document: `gohighlevel`
4. Should contain:
   - `apiKey`: Your GHL API key
   - `locationId`: Your GHL location ID

#### Option B: Check Environment Variables
1. Open `.env.local` file
2. Look for:
   ```
   GHL_API_KEY=your_api_key_here
   GHL_LOCATION_ID=your_location_id_here
   ```

**If missing, add them:**

##### Get Your GHL API Key:
1. Log in to GoHighLevel
2. Go to Settings → Integrations
3. Click "Private Integrations" or "API"
4. Create a new API key or copy existing one
5. Required scopes:
   - `contacts.readonly`
   - `contacts.write`
   - `calendars.readonly`
   - `calendars.write`
   - `calendars/events.readonly`
   - `calendars/events.write`

##### Get Your GHL Location ID:
1. In GoHighLevel, go to Settings → Business Profile
2. Look for "Location ID" or check the URL
3. Format: Usually starts with letters/numbers like `ve9EPM428h8vShlRW1KT`

##### Add to Admin Dashboard:
1. Go to your website: Admin Dashboard → GoHighLevel tab
2. Enter API Key
3. Enter Location ID
4. Click "Save Settings"
5. Click "Test Connection" to verify

---

### 2. ✅ No Bookings to Sync

**Problem:** The sync fails because there are no bookings in the database.

**Solution:** Create a test booking first.

#### Option A: Use the Sample Booking Script
```bash
npm run create-sample-booking
```

This creates a test booking for December 15, 2025.

#### Option B: Use the PMU Chatbot
1. Go to homepage
2. Click chatbot icon (bottom-right)
3. Say "I want to book an appointment"
4. Follow prompts to create booking

#### Option C: Manual Booking (if you have booking form)
1. Go to `/book-now` page
2. Fill out booking form
3. Submit

---

### 3. ✅ Code Not Deployed to Production

**Problem:** You're testing on production (www.aprettygirlmatter.com) but fixes aren't deployed yet.

**Solution:** Deploy the latest code.

#### Check Deployment Status:
1. Go to https://vercel.com/dashboard
2. Find your project
3. Check "Deployments" tab
4. Should see recent deployment from GitHub push

#### If No Auto-Deploy:
```bash
# In your project directory
npm run build
vercel --prod
```

Or manually redeploy in Vercel dashboard:
1. Click "Deployments"
2. Click "..." on latest deployment
3. Click "Redeploy"

---

### 4. ✅ GHL API Endpoint Issues

**Common API Errors:**

#### Error: "401 Unauthorized"
- **Cause:** Invalid or expired API key
- **Fix:** Generate new API key in GHL and update in admin dashboard

#### Error: "403 Forbidden"
- **Cause:** API key doesn't have required scopes
- **Fix:** Recreate API key with all calendar and contact scopes

#### Error: "404 Not Found"
- **Cause:** Invalid location ID or appointment ID
- **Fix:** Verify location ID in GHL settings

#### Error: "422 Unprocessable Entity"
- **Cause:** Invalid data format (date/time)
- **Fix:** Check booking date format is `YYYY-MM-DD` and time is `HH:MM`

---

### 5. ✅ Firestore Permissions

**Problem:** Can't read/write to Firestore collections.

**Solution:** Update Firestore Rules.

#### Check Current Rules:
1. Firebase Console → Firestore Database
2. Click "Rules" tab
3. Should allow authenticated admins to read/write `bookings` and `crmSettings`

#### Recommended Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admins full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow users to read their own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow reading CRM settings for API calls
    match /crmSettings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Step-by-Step Fix Guide

### Step 1: Configure GHL Credentials

1. **Get your GHL API Key and Location ID** (see above)

2. **Add to Admin Dashboard:**
   ```
   1. Go to: www.aprettygirlmatter.com/dashboard
   2. Click "GoHighLevel" tab
   3. Enter API Key
   4. Enter Location ID
   5. Click "Save Settings"
   6. Click "Test Connection" ✓
   ```

### Step 2: Create Test Booking

```bash
# In your project directory
npm run create-sample-booking
```

Or use the chatbot on your homepage.

### Step 3: Test Sync

1. Go to Admin Dashboard → Calendar tab
2. You should see the test booking
3. Click "Sync All with GHL" button
4. Should show success message: "Successfully synced 1 bookings with GHL"

### Step 4: Verify in GHL

1. Log in to GoHighLevel
2. Go to Contacts
3. Look for "Jane Smith" (test contact)
4. Go to Calendar
5. Should see the appointment

---

## Testing the Sync

### Test Individual Booking Sync:
1. Create a booking
2. Go to Calendar tab
3. Click on the booking
4. Change status (e.g., pending → confirmed)
5. Should auto-sync to GHL

### Test Bulk Sync:
1. Create multiple bookings
2. Go to Calendar tab
3. Click "Sync All with GHL" button
4. Check console for any errors
5. Verify all bookings appear in GHL

---

## Troubleshooting Commands

### Check if GHL credentials are set:
```bash
# Run this in browser console on admin dashboard
fetch('/api/calendar/sync-ghl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: 'test',
    booking: {
      clientName: 'Test',
      clientEmail: 'test@test.com',
      clientPhone: '555-1234',
      serviceName: 'Test Service',
      date: '2025-12-01',
      time: '10:00',
      status: 'pending',
      price: 100,
      depositPaid: false
    }
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Expected responses:
- ✅ Success: `{ success: true, contactId: '...', appointmentId: '...' }`
- ❌ No API Key: `{ error: 'GHL API key not configured' }`
- ❌ Invalid Key: `{ error: 'Failed to sync booking with GHL', details: '401 Unauthorized' }`

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "GHL API key not configured" | No API key in Firestore or .env | Add API key in admin dashboard |
| "Failed to create GHL contact" | Invalid API key or missing scopes | Regenerate API key with all scopes |
| "Failed to create GHL appointment" | Invalid location ID | Verify location ID in GHL |
| "No bookings to sync" | No bookings in database | Create test booking |
| "Failed to sync bookings with GHL" | Network error or API down | Check GHL status, retry later |

---

## Verification Checklist

- [ ] GHL API key is configured
- [ ] GHL location ID is configured
- [ ] Test connection shows success
- [ ] At least one booking exists
- [ ] Firestore permissions allow read/write
- [ ] Latest code is deployed to production
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No console errors (except Chrome extension warnings)
- [ ] Booking appears in GHL after sync
- [ ] Contact appears in GHL contacts

---

## Advanced: Manual API Testing

### Test GHL API Key Directly:

```bash
# Replace YOUR_API_KEY with your actual key
curl -X GET "https://services.leadconnectorhq.com/locations/" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Version: 2021-07-28"
```

Should return your locations. If error, API key is invalid.

### Test Contact Creation:

```bash
curl -X POST "https://services.leadconnectorhq.com/contacts/" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Version: 2021-07-28" \
  -d '{
    "locationId": "YOUR_LOCATION_ID",
    "name": "Test Contact",
    "email": "test@example.com",
    "phone": "+15551234567"
  }'
```

Should return contact ID. If error, check location ID or API scopes.

---

## Need More Help?

1. **Check GHL API Documentation:**
   - https://highlevel.stoplight.io/docs/integrations/

2. **Check Console Logs:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for detailed error messages

3. **Check Server Logs:**
   - If running locally: Check terminal where `npm run dev` is running
   - If on Vercel: Check Vercel dashboard → Functions → Logs

4. **Test with Postman:**
   - Import GHL API collection
   - Test endpoints manually
   - Verify API key works outside your app

---

## Summary

**Most Common Fix:**
1. Add GHL API key and location ID in Admin Dashboard → GoHighLevel tab
2. Create a test booking: `npm run create-sample-booking`
3. Test sync in Calendar tab
4. Verify booking appears in GHL

**If still not working:**
- Check console for specific error messages
- Verify API key has all required scopes
- Make sure latest code is deployed
- Clear browser cache and hard refresh
