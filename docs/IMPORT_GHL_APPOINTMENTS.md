# Import Appointments from GoHighLevel

## Overview

This script imports existing appointments from your GoHighLevel service calendar into your website's booking system.

## What It Does

1. **Fetches appointments** from GHL for the current month
2. **Gets contact details** for each appointment
3. **Creates bookings** in your Firestore database
4. **Skips duplicates** (won't import the same appointment twice)
5. **Maps GHL status** to your booking status:
   - `confirmed` → confirmed
   - `showed` → completed
   - `cancelled` / `noshow` → cancelled
   - Other → pending

## How to Use

### Step 1: Make Sure GHL is Configured

Run the test script first:
```bash
npm run test-ghl
```

If it fails, configure GHL in your admin dashboard:
1. Go to: Admin Dashboard → GoHighLevel tab
2. Enter API Key and Location ID
3. Click "Save Settings"

### Step 2: Run the Import

```bash
npm run import-ghl-appointments
```

### Step 3: View Imported Appointments

1. Go to: Admin Dashboard → Calendar tab
2. You should see all appointments from GHL

## What Gets Imported

For each GHL appointment, the script creates a booking with:

- **Client Name**: From GHL contact
- **Client Email**: From GHL contact
- **Client Phone**: From GHL contact
- **Service Name**: Extracted from appointment title
- **Date & Time**: From appointment start time
- **Status**: Mapped from GHL appointment status
- **Notes**: Includes original GHL notes
- **GHL IDs**: Stores contactId and appointmentId for future sync

## Example Output

```
🚀 Starting GHL Appointment Import...

✅ GHL credentials found
   Location ID: ve9EPM428h8vShlRW1KT

📅 Fetching appointments from 2025-11-01 to 2025-11-30...
✅ Found 8 appointments in GHL

📥 Importing 8 appointments...

✅ Imported: Microblading - Jane Smith (2025-11-04 14:00)
✅ Imported: Lip Blush - Sarah Johnson (2025-11-06 10:00)
⏭️  Skipping: Touch Up - Mike Brown (already imported)
✅ Imported: Eyeliner - Lisa Davis (2025-11-11 15:30)
...

============================================================
📊 IMPORT SUMMARY
============================================================
✅ Imported: 6
⏭️  Skipped: 2 (already exist)
❌ Failed: 0
📅 Total: 8
============================================================

🎉 Success! Appointments have been imported to your website.
   View them in: Admin Dashboard → Calendar tab
```

## Date Range

By default, the script imports appointments for the **current month**.

To import a different date range, you can modify the script or run it multiple times (it won't create duplicates).

## Duplicate Prevention

The script checks for existing bookings with the same `ghlAppointmentId` before importing. If a booking already exists, it will be skipped.

## Appointment Title Format

The script expects GHL appointment titles in one of these formats:
- `"Service Name - Client Name"` (preferred)
- `"Service Name"` (will use contact name as client name)

Examples:
- ✅ `"Microblading - Jane Smith"`
- ✅ `"Lip Blush - Sarah Johnson"`
- ✅ `"Touch Up"` (will use contact name)

## Status Mapping

| GHL Status | Website Status |
|------------|----------------|
| confirmed | confirmed |
| showed | completed |
| cancelled | cancelled |
| noshow | cancelled |
| new | pending |
| (other) | pending |

## Fields Not Available from GHL

Some fields are not available in GHL appointments and will be set to defaults:

- **Price**: Set to 0 (update manually in dashboard)
- **Deposit Paid**: Set to false (update manually)
- **Artist Name**: Set to "Imported from GHL" (update manually)

You can edit these fields in the admin dashboard after import.

## Troubleshooting

### Error: "GHL API key or Location ID not configured"

**Fix:**
1. Go to Admin Dashboard → GoHighLevel tab
2. Enter your API Key and Location ID
3. Click "Save Settings"
4. Run `npm run test-ghl` to verify
5. Try import again

### Error: "Failed to fetch appointments: 401"

**Fix:**
- Your API key is invalid or expired
- Generate a new API key in GoHighLevel
- Update in admin dashboard

### Error: "Failed to fetch appointments: 403"

**Fix:**
- Your API key doesn't have calendar permissions
- Regenerate API key with these scopes:
  - `calendars.readonly`
  - `calendars/events.readonly`
  - `contacts.readonly`

### No Appointments Found

**Possible reasons:**
- No appointments in the current month
- Appointments are in a different calendar
- Location ID is incorrect

**Check:**
1. Verify appointments exist in GHL for current month
2. Check the correct calendar is selected
3. Verify Location ID in admin dashboard

### Appointments Import But Missing Details

**If price is 0:**
- GHL appointments don't include price
- Update manually in dashboard after import

**If artist is "Imported from GHL":**
- GHL appointments may not have assigned user
- Update manually in dashboard after import

## Re-Running the Import

You can safely run the import multiple times. It will:
- ✅ Skip appointments that already exist
- ✅ Import new appointments
- ✅ Not create duplicates

## After Import

1. **Review imported bookings** in Calendar tab
2. **Update missing fields**:
   - Set correct prices
   - Assign to specific artists
   - Mark deposits as paid if applicable
3. **Future appointments** will sync automatically if you set up two-way sync

## Advanced: Custom Date Range

To import appointments from a specific date range, modify the script:

```typescript
// Change these lines in importGHLAppointments.ts
const startDate = '2025-11-01T00:00:00Z'; // Start date
const endDate = '2025-12-31T23:59:59Z';   // End date
```

Then run:
```bash
npm run import-ghl-appointments
```

## Integration with Sync

After importing:
- Appointments have `ghlAppointmentId` stored
- Future updates can sync both ways
- Use "Sync All with GHL" to push updates back to GHL

## Summary

✅ **Command**: `npm run import-ghl-appointments`  
✅ **What it does**: Imports GHL appointments to website  
✅ **Safe to re-run**: Yes, skips duplicates  
✅ **Date range**: Current month by default  
✅ **View results**: Admin Dashboard → Calendar tab  

This is a one-time import to get your existing GHL appointments into the website. After this, you can manage bookings from either system!
