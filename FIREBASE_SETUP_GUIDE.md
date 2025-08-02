# Firebase Setup Guide for A Pretty Girl Matter LLC

## 🔥 Your Firebase Project
**Project ID**: `aprettygirlmatterllc`
**Console URL**: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc

## 📋 Step-by-Step Setup

### 1. Get Firebase Configuration
1. **Go to Project Settings**: 
   - Visit: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/settings/general
   - Scroll down to "Your apps" section

2. **Add Web App** (if not already done):
   - Click "Add app" button
   - Select the web icon (`</>`)
   - App nickname: "Permanent Makeup Website"
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**:
   - You'll see a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "aprettygirlmatterllc.firebaseapp.com",
     projectId: "aprettygirlmatterllc",
     storageBucket: "aprettygirlmatterllc.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef..."
   };
   ```

4. **Update .env.local**:
   - Open the `.env.local` file in your project root
   - Replace these three values with your actual config:
     - `NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here`
     - `NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here`

### 2. Enable Firebase Services

#### Enable Firestore Database
1. Go to: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/firestore
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users, e.g., `us-central1`)

#### Enable Authentication (Optional but Recommended)
1. Go to: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Enable "Google" provider (optional)

#### Enable Storage (For Image Uploads)
1. Go to: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/storage
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as your Firestore

### 3. Set Up Security Rules

#### Firestore Rules
Go to: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/firestore/rules

Replace the default rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Services are publicly readable
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Appointments - authenticated users only
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contact forms - anyone can create, auth required to read
    match /contactForms/{formId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // Health forms - sensitive data, auth required
    match /healthForms/{formId} {
      allow read, write: if request.auth != null;
    }
    
    // Business settings - auth required
    match /businessSettings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
Go to: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/storage/rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Test the Connection

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Initialize the database**:
   - Visit: http://localhost:3001/book-now-custom?setup=true
   - Click "Initialize Database" to populate default data

3. **Test the booking flow**:
   - Visit: http://localhost:3001/book-now-custom
   - You should see services loaded from Firebase instead of demo data

### 5. Verify Setup

Check the browser console for:
- ✅ No Firebase errors
- ✅ Services loading from Firebase
- ✅ Database operations working

If you see "Firebase not configured - showing demo data", double-check your `.env.local` values.

## 🚀 You're Ready!

Once configured, your website will:
- ✅ Load services from Firebase
- ✅ Save appointments to Firestore
- ✅ Handle contact form submissions
- ✅ Store health forms securely
- ✅ Manage real-time availability
- ✅ Support user authentication

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled
4. Check that security rules are published
