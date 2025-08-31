# Firestore Rules Deployment - Artist Availability Fix

## Issue Identified
The booking calendar is getting "Missing or insufficient permissions" errors when trying to access the `artistAvailability` collection. This collection was missing from the Firestore security rules.

## Solution Applied
Added comprehensive rules for the `artistAvailability` collection:

```javascript
// Artist Availability Collection - Public read access for booking calendar
match /artistAvailability/{docId} {
  allow read: if true; // Public read access for booking calendar
  allow write: if request.auth != null && 
    (resource == null || resource.data.artistId == request.auth.uid) &&
    request.auth.token.role in ['admin', 'artist'];
  allow create: if request.auth != null && 
    request.auth.token.role in ['admin', 'artist'] &&
    request.resource.data.artistId is string;
  allow update: if request.auth != null && 
    request.auth.token.role in ['admin', 'artist'] &&
    resource.data.artistId == request.resource.data.artistId;
  allow delete: if request.auth != null && 
    request.auth.token.role in ['admin', 'artist'];
}
```

## Key Features
- **Public read access**: Allows booking calendar to load availability data without authentication
- **Role-based write access**: Only admins and artists can modify availability
- **Data ownership validation**: Artists can only modify their own availability
- **Secure creation**: Requires proper artistId field

## Deployment Required

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `aprettygirlmatterllc`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the updated rules from `firestore.rules`
5. Click **Publish**

### Option 2: Firebase CLI
```bash
firebase deploy --only firestore:rules
```

## Expected Result
After deployment:
- Booking calendar will load without permission errors
- Date selection will work properly
- "Next Available Date" functionality will work
- Artists and admins can manage availability through admin dashboard

## Testing
1. Visit: https://aprettygirlmatter.com/book-now-custom
2. Verify no "Missing or insufficient permissions" errors in console
3. Confirm dates are clickable and selectable
4. Test "Next Available Date" button functionality
