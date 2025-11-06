# Firebase Authentication Troubleshooting

This document provides solutions for the authentication and permission issues identified on your PMU website.

## Issues Identified

1. **Login Authentication** - Users like `victoria@aprettygirlmatter.com` are encountering `auth/invalid-credential` errors
2. **GHL Initialization** - Missing or insufficient permissions error when accessing GHL settings
3. **API Routes** - 500 errors when accessing `/api/users/manage`
4. **OAuth Domain** - Domain not authorized in Firebase Auth

## Interactive Troubleshooting Tool

The simplest way to fix these issues is to use the interactive troubleshooter:

1. Run your site locally using `npm run dev`
2. Open `http://localhost:3000` in your browser
3. Log in with your admin account
4. Open the troubleshooter by navigating to:
   ```
   http://localhost:3000/scripts/pmu_troubleshooter.html
   ```
5. Follow the on-screen instructions to resolve the issues

## Browser Console Scripts

If you prefer to fix the issues directly from the browser console, you can use these scripts:

### Fix GHL Permissions
When logged in as admin on your live site, open browser console and paste:
```javascript
// Copy and paste the entire content from scripts/fix-ghl-permissions.js
```

### Create Victoria User Profile
When logged in as admin on your live site, open browser console and paste:
```javascript
// Copy and paste the entire content from scripts/add_victoria_user.js
```

### Test API Connection
When logged in as admin on your live site, open browser console and paste:
```javascript
// Copy and paste the entire content from scripts/api_troubleshoot.js
```

## Required Firebase Auth Steps

You must perform these steps in the Firebase Console:

1. **Add Domain to Auth Settings**:
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add `www.aprettygirlmatter.com` to the list

2. **Create Victoria User in Auth**:
   - Go to Firebase Console → Authentication → Users
   - Click "Add User"
   - Enter Email: `victoria@aprettygirlmatter.com`
   - Set a password
   - The Firestore profile will be created automatically when Victoria logs in

## Fixing Admin Login Issues

If `admin@example.com` doesn't exist or you can't log in:

1. Run your site locally
2. Open the troubleshooter
3. Log in with your working admin account
4. Click "Create Admin Profile" to set up your profile correctly

## Required Firestore Security Rules

Add these rules to your Firestore to fix GHL permissions:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /crmSettings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Need More Help?

If you continue to experience issues, check:

1. Your Firebase environment variables in `.env.local`
2. Server logs for API route errors
3. Make sure you're using the correct Firebase project
