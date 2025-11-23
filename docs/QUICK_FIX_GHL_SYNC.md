# Quick Fix: GHL Calendar Sync

## 🚨 Problem
Calendar tab shows 500 error when syncing with GoHighLevel.

## ⚡ Quick Fix (5 Minutes)

### Step 1: Test Your GHL Connection
```bash
npm run test-ghl
```

This will:
- ✅ Check if GHL API key is configured
- ✅ Verify API key is valid
- ✅ Test location ID
- ✅ Check contact creation permissions
- ✅ Show any bookings in database

### Step 2: Fix Based on Results

#### If "GHL credentials not configured":
1. Go to: **Admin Dashboard → GoHighLevel tab**
2. Get your GHL API Key:
   - Log in to GoHighLevel
   - Settings → Integrations → API
   - Copy your API key
3. Get your Location ID:
   - GoHighLevel → Settings → Business Profile
   - Copy Location ID
4. Enter both in admin dashboard
5. Click "Save Settings"
6. Click "Test Connection"
7. Run `npm run test-ghl` again

#### If "No bookings found":
```bash
npm run create-sample-booking
```

This creates a test booking for December 15, 2025.

#### If "API Key invalid":
1. Generate new API key in GoHighLevel
2. Make sure it has these scopes:
   - ✅ contacts.readonly
   - ✅ contacts.write
   - ✅ calendars.readonly
   - ✅ calendars.write
   - ✅ calendars/events.readonly
   - ✅ calendars/events.write
3. Update in admin dashboard

### Step 3: Test the Sync
1. Go to **Admin Dashboard → Calendar tab**
2. Click "Sync All with GHL"
3. Should show: "Successfully synced X bookings with GHL"

### Step 4: Verify in GHL
1. Log in to GoHighLevel
2. Go to Contacts
3. Should see your test contact
4. Go to Calendar
5. Should see the appointment

## ✅ Done!

If it works, you're all set. If not, see the detailed guide:
- `docs/FIX_GHL_CALENDAR_SYNC.md`

## 🔧 Common Issues

| Issue | Fix |
|-------|-----|
| 500 error | Run `npm run test-ghl` to diagnose |
| No API key | Add in Admin → GoHighLevel tab |
| No bookings | Run `npm run create-sample-booking` |
| 401 error | API key invalid, generate new one |
| 403 error | API key missing scopes |
| Not deployed | Check Vercel dashboard, redeploy |

## 📞 Need Help?

Run the diagnostic script:
```bash
npm run test-ghl
```

It will tell you exactly what's wrong and how to fix it.
