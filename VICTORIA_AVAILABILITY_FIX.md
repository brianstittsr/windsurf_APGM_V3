# Fix Victoria's Tuesday Availability Issue

## Problem
Victoria shows as available on Tuesday in the booking calendar but admin interface shows she's only available Saturday/Sunday.

## Root Cause
Stale data in the `artistAvailability` Firestore collection.

## Manual Fix via Firebase Console

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `aprettygirlmatterllc`
3. Navigate to **Firestore Database**

### Step 2: Find Victoria's Availability Records
1. Go to the `artistAvailability` collection
2. Look for documents where `artistId` = `"victoria"`
3. You should see documents like:
   - `victoria_monday`
   - `victoria_tuesday` ← **This is the problem**
   - `victoria_wednesday`
   - etc.

### Step 3: Delete Incorrect Records
Delete any Victoria documents where `isEnabled` = `true` for days other than Saturday/Sunday:
- Delete `victoria_tuesday` if `isEnabled: true`
- Delete `victoria_monday` if `isEnabled: true`
- Delete `victoria_wednesday` if `isEnabled: true`
- Delete `victoria_thursday` if `isEnabled: true`
- Delete `victoria_friday` if `isEnabled: true`

### Step 4: Verify Correct Records
Ensure only these Victoria records exist with `isEnabled: true`:
- `victoria_saturday` with `isEnabled: true`
- `victoria_sunday` with `isEnabled: true`

### Step 5: Test
1. Go to your booking page
2. Select a service
3. Try to navigate to Tuesday - Victoria should NOT appear
4. Navigate to Saturday/Sunday - Victoria should appear

## Expected Result
After cleanup, the booking calendar will only show Victoria available on Saturday/Sunday, matching your admin interface.

## Alternative: Admin Interface Fix
You can also use your admin interface:
1. Go to admin dashboard
2. Navigate to Artist Availability Management
3. Select Victoria
4. Ensure Tuesday is toggled OFF
5. Ensure only Saturday/Sunday are toggled ON
6. Save changes

The admin interface should sync the data correctly to the `artistAvailability` collection.
