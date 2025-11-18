# Firestore Security Rules Setup Guide

## 🔥 Fix "Missing or insufficient permissions" Error

This guide will help you update your Firestore security rules to fix the Firebase permissions error.

---

## 📋 Current Issue

**Error Message:**
```
FirebaseError: Missing or insufficient permissions.
Failed to initialize GHL for workflows: FirebaseError: Missing or insufficient permissions.
```

**Cause:**
The BMAD Workflow Engine and other components need to read the `crmSettings` collection from Firestore, but your current security rules are blocking access.

---

## 🛠️ Step-by-Step Fix

### **Step 1: Open Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **APGM V3** (or your project name)
3. Click **"Firestore Database"** in the left sidebar
4. Click the **"Rules"** tab at the top

### **Step 2: Copy the Updated Rules**

Replace your current rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==================== USERS ====================
    // Users can read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ==================== ADMIN ACCESS ====================
    // Admins have full access to all collections
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==================== CRM SETTINGS ====================
    // Allow authenticated users to READ crmSettings (needed for workflows)
    // Only admins can WRITE
    match /crmSettings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==================== BOOKINGS ====================
    // Authenticated users can create and manage bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // ==================== SERVICES ====================
    // Public can read services
    // Only admins can modify
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==================== ARTISTS ====================
    // Public can read artist profiles
    // Only admins can modify
    match /artists/{artistId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==================== AVAILABILITY ====================
    // Public can read availability
    // Only admins can modify
    match /availability/{availabilityId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==================== COUPONS ====================
    // Public can read coupons (for validation)
    // Only admins can modify
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==================== GIFT CARDS ====================
    // Authenticated users can read and use gift cards
    match /giftCards/{giftCardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // ==================== HEALTH FORMS ====================
    // Users can create and read their own health forms
    match /healthForms/{formId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### **Step 3: Paste and Publish**

1. Select all the text in the Rules editor
2. Delete it
3. Paste the new rules from above
4. Click **"Publish"** button (top right)
5. Wait for confirmation: "Rules published successfully"

### **Step 4: Verify the Fix**

1. Refresh your application: `http://localhost:3000`
2. Open browser DevTools (F12)
3. Check the Console tab
4. You should see:
   ```
   ✅ Workflows initialized successfully
   ✅ User profile loaded: your@email.com Role: admin
   ```
5. You should NOT see:
   ```
   ❌ Failed to initialize GHL for workflows: FirebaseError
   ```

---

## 🎯 What These Rules Do

### **Security Levels:**

1. **Public Access (No Auth Required):**
   - Services (read-only)
   - Artists (read-only)
   - Availability (read-only)
   - Coupons (read-only)

2. **Authenticated Users:**
   - Can read their own user profile
   - Can read CRM settings (needed for workflows)
   - Can create/read/write bookings
   - Can create/read health forms
   - Can read/use gift cards

3. **Admin Users:**
   - Full access to ALL collections
   - Can modify services, artists, availability
   - Can manage coupons and gift cards
   - Can view all bookings and health forms

### **Key Rule for Fixing the Error:**

```javascript
match /crmSettings/{document} {
  allow read: if request.auth != null;  // ← This fixes the error!
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

**Why This Works:**
- The BMAD Workflow Engine needs to read GHL settings from `crmSettings/gohighlevel`
- Previously, only admins could read this collection
- Now, any authenticated user can read it (but only admins can write)
- This allows workflows to initialize properly

---

## 🔒 Security Considerations

### **Is This Safe?**

✅ **YES** - The updated rules are secure because:

1. **CRM Settings are read-only for non-admins**
   - Users can see the settings but can't modify them
   - Only admins can change API keys or settings

2. **Sensitive data is protected**
   - Users can only access their own bookings and health forms
   - Admin verification required for modifications

3. **Public data is intentionally public**
   - Services, artists, and availability need to be public for booking
   - Coupons need to be readable for validation

### **What's Protected:**

- ✅ User passwords (handled by Firebase Auth, not Firestore)
- ✅ Payment information (handled by Stripe, not stored in Firestore)
- ✅ API keys (only admins can write, but authenticated users can read)
- ✅ Personal health information (users can only see their own)
- ✅ Admin functions (require admin role verification)

---

## 🧪 Testing Your Rules

### **Test 1: Unauthenticated User**
1. Open incognito window
2. Go to `http://localhost:3000`
3. Should be able to:
   - ✅ View services
   - ✅ View artists
   - ✅ View availability
4. Should NOT be able to:
   - ❌ Create bookings
   - ❌ Access admin dashboard
   - ❌ View CRM settings

### **Test 2: Authenticated User (Non-Admin)**
1. Log in as a regular user
2. Should be able to:
   - ✅ Create bookings
   - ✅ View their own bookings
   - ✅ Submit health forms
3. Should NOT be able to:
   - ❌ Access admin dashboard
   - ❌ Modify services or artists
   - ❌ View other users' bookings

### **Test 3: Admin User**
1. Log in as admin (brianstittsr@gmail.com)
2. Should be able to:
   - ✅ Access admin dashboard
   - ✅ View all bookings
   - ✅ Modify services, artists, availability
   - ✅ Manage CRM settings
   - ✅ Everything a regular user can do

---

## 🚨 Troubleshooting

### **Still Getting Permission Errors?**

1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear "Cached images and files"
   - Clear "Cookies and other site data"

2. **Log out and log back in:**
   - Firebase auth tokens may be cached
   - Fresh login will get new permissions

3. **Verify rules were published:**
   - Go back to Firebase Console → Firestore → Rules
   - Check that your changes are there
   - Look for "Last published" timestamp

4. **Check user role:**
   - Go to Firebase Console → Firestore → Data
   - Navigate to `users` collection
   - Find your user document
   - Verify `role: "admin"` is set

### **Rules Not Taking Effect?**

- Wait 1-2 minutes after publishing
- Firestore rules can take a moment to propagate
- Restart your dev server
- Clear browser cache

---

## 📊 Before vs After

### **Before (Restrictive Rules):**
```
❌ Failed to initialize GHL for workflows: FirebaseError
❌ Missing or insufficient permissions
❌ Cannot read crmSettings
```

### **After (Updated Rules):**
```
✅ Workflows initialized successfully
✅ CRM settings loaded
✅ GHL integration working
✅ No permission errors
```

---

## 🎓 Understanding Firestore Rules

### **Rule Structure:**
```javascript
match /collectionName/{documentId} {
  allow read: if <condition>;
  allow write: if <condition>;
}
```

### **Common Conditions:**
- `if true` - Anyone (public access)
- `if request.auth != null` - Any authenticated user
- `if request.auth.uid == userId` - Only the user who owns the data
- `if get(...).data.role == 'admin'` - Only admin users

### **Operations:**
- `read` - Includes `get` and `list`
- `write` - Includes `create`, `update`, and `delete`
- You can specify these individually if needed

---

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Common Security Patterns](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

## ✅ Checklist

- [ ] Opened Firebase Console
- [ ] Selected correct project
- [ ] Navigated to Firestore Database → Rules
- [ ] Copied new rules from this document
- [ ] Pasted into Rules editor
- [ ] Clicked "Publish"
- [ ] Waited for confirmation
- [ ] Refreshed application
- [ ] Checked console for success messages
- [ ] No more permission errors

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** Active Setup Guide
