# Services Not Loading - Fix Guide

## Issue
Services are not loading on the book-now-custom page locally.

## Most Likely Cause
Missing or incorrect Firebase environment variables in `.env.local` file.

## Solution Steps

### 1. Check if .env.local exists
Look for `.env.local` file in your project root. If it doesn't exist, create it.

### 2. Copy Firebase credentials
Copy the template from `env-template.txt` and fill in your real Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...your_real_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aprettygirlmatterllc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aprettygirlmatterllc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aprettygirlmatterllc.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_real_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your_real_app_id:web:your_real_app_id
```

### 3. Get Firebase credentials
1. Go to [Firebase Console](https://console.firebase.google.com/project/aprettygirlmatterllc)
2. Click Project Settings (gear icon)
3. Scroll to "Your apps" section
4. Copy the config values

### 4. Restart development server
After updating .env.local:
```bash
npm run dev
```

## Alternative Causes

### A. No Services in Database
If environment is correct but still no services, check if services exist:
- Go to Firebase Console → Firestore Database
- Look for `services` collection
- Ensure services have `isActive: true`

### B. Firestore Security Rules
Check if security rules allow reading services:
```javascript
// In firestore.rules
match /services/{serviceId} {
  allow read: if true; // Public read access
}
```

### C. Network/Permission Issues
Check browser console for specific error messages:
- Press F12 → Console tab
- Look for Firebase/Firestore errors
- Common errors: "permission-denied", "unavailable"

## Quick Test
Run this in browser console on the page:
```javascript
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
```

If you see "demo-api-key" or "your_project_id", environment variables are not loaded.
