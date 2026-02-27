  # Deploy Google Calendar Firestore Rules

## Updated Rules

Added the following collections to `firestore.rules`:

1. **googleCalendarTokens** - Stores OAuth tokens for Google Calendar integration
   - Artists can read/write their own tokens
   - Admins can manage all tokens

2. **settings** - General settings collection (for availability toggle, etc.)
   - All authenticated users can read
   - Only admins can write

## Deployment Steps

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database → Rules
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click "Publish"

### Option 2: Firebase CLI
```bash
firebase deploy --only firestore:rules
```

## Testing After Deployment

1. Restart your development server
2. Navigate to Admin Dashboard → Artist Availability
3. Click "Connect to Google Calendar"
4. The permission error should be resolved

## Rules Added

```
// Google Calendar tokens collection - Artists/Admins can manage their own tokens
match /googleCalendarTokens/{artistId} {
  allow read: if isAuthenticated() && (request.auth.uid == artistId || isAdmin());
  allow write: if isAuthenticated() && (request.auth.uid == artistId || isAdmin());
  allow delete: if isAuthenticated() && (request.auth.uid == artistId || isAdmin());
}

// Settings collection - Admin manage, authenticated read
match /settings/{settingId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
}
```
