# Console Errors - Troubleshooting Guide

## 🔍 Current Errors Detected

### 1. ❌ GoHighLevel API 401 Unauthorized
**Error:** `POST http://localhost:3000/api/crm/test-connection 401 (Unauthorized)`

**Cause:** The GoHighLevel API key is either:
- Not entered in the admin dashboard
- Invalid or expired
- Missing required scopes

**Solution:**
1. Go to Admin Dashboard → GoHighLevel tab
2. Enter your GHL Private Integration API Key
3. Make sure the API key has ALL required scopes enabled:
   - ✅ businesses.readonly
   - ✅ calendars.readonly, calendars.write
   - ✅ campaigns.readonly
   - ✅ contacts.readonly, contacts.write
   - ✅ conversations.readonly, conversations.write
   - ✅ forms.readonly
   - ✅ invoices.readonly, invoices.write
   - ✅ locations.readonly ← **CRITICAL**
   - ✅ opportunities.readonly, opportunities.write
   - ✅ surveys.readonly
   - ✅ workflows.readonly
4. After enabling scopes, **regenerate the API key** in GoHighLevel
5. Copy the NEW API key and paste it in the admin dashboard
6. Click "Save Settings"
7. Click "Test Connection"

**Reference:** See `GHL-INTEGRATION-SETUP.md` for detailed setup instructions.

---

### 2. ⚠️ Firebase Permissions Error
**Error:** `Failed to initialize GHL for workflows: FirebaseError: Missing or insufficient permissions.`

**Cause:** Firestore security rules are blocking access to the `crmSettings` collection.

**Solution:**

#### Update Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Update your rules to include:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rules - authenticated users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin access to all collections
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow all authenticated users to read crmSettings
    match /crmSettings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read/write their own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read services
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

5. Click **"Publish"**
6. Refresh your application

**Why This Happens:**
The BMAD Workflow Engine tries to read GHL settings from Firestore on app initialization. If the rules are too restrictive, it fails silently.

---

### 3. 🎥 Missing Video File
**Error:** `videos/hero-video.mp4:1 Failed to load resource: the server responded with a status of 404 (Not Found)`

**Cause:** The hero video file doesn't exist in the `public/videos/` directory.

**Solution:**

#### Option A: Add the Video File
1. Create the directory: `public/videos/`
2. Add your hero video file as `hero-video.mp4`
3. Recommended specs:
   - Format: MP4 (H.264 codec)
   - Resolution: 1920x1080 or 1280x720
   - File size: < 5MB (optimized for web)
   - Duration: 10-30 seconds (looping)

#### Option B: Use Fallback Image Only
If you don't have a video, update `src/components/Hero.tsx`:

**Current Code (line 25):**
```tsx
<source src="/videos/hero-video.mp4" type="video/mp4" />
```

**Replace with:**
```tsx
{/* Video temporarily disabled - using fallback image */}
{/* <source src="/videos/hero-video.mp4" type="video/mp4" /> */}
```

The component already has a fallback image that will display if the video is missing.

#### Option C: Use a Placeholder Video
Use a free stock video from:
- [Pexels Videos](https://www.pexels.com/videos/)
- [Pixabay Videos](https://pixabay.com/videos/)
- [Coverr](https://coverr.co/)

Search for: "beauty salon", "makeup artist", "spa", or "cosmetics"

---

### 4. ℹ️ Info Messages (Not Errors)

**Message:** `🔥 No Firebase user authenticated`
- **Status:** Normal
- **Explanation:** This appears before login. It's expected behavior.

**Message:** `Skipping auto-scroll behavior due to position: sticky or position: fixed`
- **Status:** Normal
- **Explanation:** Next.js informational message about scroll behavior. No action needed.

**Message:** `Detected scroll-behavior: smooth on the <html> element`
- **Status:** Informational
- **Explanation:** Future Next.js version will handle this differently. No immediate action needed.

**Message:** `[Fast Refresh] done in XXXms`
- **Status:** Normal
- **Explanation:** Hot module replacement working correctly.

---

## ✅ Quick Fix Checklist

- [ ] **GoHighLevel API Key:**
  - [ ] Go to GoHighLevel → Settings → Integrations → Private Integrations
  - [ ] Enable ALL required scopes (especially `locations.readonly`)
  - [ ] Regenerate API key
  - [ ] Copy new API key
  - [ ] Paste in Admin Dashboard → GoHighLevel tab
  - [ ] Save Settings
  - [ ] Test Connection

- [ ] **Firebase Permissions:**
  - [ ] Go to Firebase Console
  - [ ] Update Firestore Rules (see above)
  - [ ] Publish rules
  - [ ] Refresh application

- [ ] **Hero Video:**
  - [ ] Add video file to `public/videos/hero-video.mp4`, OR
  - [ ] Comment out video source in Hero.tsx, OR
  - [ ] Accept the 404 (fallback image will display)

---

## 🎯 Priority Order

1. **HIGH:** Fix Firebase permissions (blocks workflow functionality)
2. **HIGH:** Configure GoHighLevel API key (required for CRM integration)
3. **LOW:** Add hero video (cosmetic issue, fallback image works)

---

## 📊 Expected Results After Fixes

### Console Should Show:
```
✅ User profile loaded: brianstittsr@gmail.com Role: admin
✅ GHL API Connection Successful
✅ Workflows initialized successfully
✅ All resources loaded
```

### No More Errors:
- ❌ No more 401 Unauthorized errors
- ❌ No more Firebase permission errors
- ❌ No more 404 video errors (if video added)

---

## 🔧 Testing Steps

1. **Test Firebase Permissions:**
   - Log in as admin
   - Go to Admin Dashboard
   - Check console for "Workflows initialized successfully"

2. **Test GoHighLevel Connection:**
   - Go to Admin Dashboard → GoHighLevel tab
   - Enter API key
   - Click "Test Connection"
   - Should see: "✅ Connection successful! Found X location(s)."

3. **Test Hero Video:**
   - Go to homepage
   - Check if video plays or fallback image displays
   - No 404 errors in console

---

## 📞 Need Help?

If errors persist after following these steps:

1. Check browser console for additional error details
2. Verify Firebase project configuration
3. Confirm GoHighLevel account is active
4. Review `GHL-INTEGRATION-SETUP.md` for detailed setup

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** Active Troubleshooting Guide
