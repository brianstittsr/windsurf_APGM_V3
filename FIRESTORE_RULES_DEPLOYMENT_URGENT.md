# URGENT: Firestore Rules Deployment Required

## Issue
The booking calendar is showing "Missing or insufficient permissions" errors because the `artistAvailability` collection rules were using incorrect role checking syntax.

## Fix Applied
Updated `firestore.rules` to use proper role checking functions instead of `request.auth.token.role`.

**Changed:**
```javascript
// OLD - Incorrect syntax
allow write: if request.auth != null && 
  (resource == null || resource.data.artistId == request.auth.uid) &&
  request.auth.token.role in ['admin', 'artist'];

// NEW - Correct syntax
allow write: if isAdminOrArtist() && 
  (resource == null || resource.data.artistId == request.auth.uid);
```

## Deployment Required
The updated rules must be deployed immediately to resolve the booking calendar errors.

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `aprettygirlmatterllc`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the entire contents of `firestore.rules` file
5. Paste into the console editor
6. Click **Publish**

### Option 2: Firebase CLI
```bash
cd permanent-makeup-website
firebase deploy --only firestore:rules
```

## Expected Result
After deployment, the booking calendar should load time slots without permission errors.

## Test After Deployment
1. Go to booking page
2. Select a service
3. Try to load available dates/times
4. Verify no "Missing or insufficient permissions" errors appear

## Priority: CRITICAL
This blocks all booking functionality and must be deployed immediately.
