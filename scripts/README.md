# Firebase Admin Setup Scripts

This directory contains scripts to help manage your Firebase project.

## Prerequisites

1. **Firebase Service Account Key**:
   - Go to Firebase Console: https://console.firebase.google.com/
   - Select your project
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account.json` in the root of this project

## Available Scripts

### Create Admin User

Creates an admin user in Firebase Authentication and adds the corresponding user document in Firestore.

```bash
node scripts/create-admin-user.js
```

This will:
1. Create a user with email `admin@example.com` and password `admin123`
2. Set admin custom claims
3. Create a user document in Firestore with ID `luFdSPKRuwd0OqKFu72adyoTQFr1`

### Add Authorized Domain

Provides instructions for adding `www.aprettygirlmatter.com` to Firebase Auth authorized domains.

```bash
node scripts/add-auth-domain.js
```

## Troubleshooting

- **Missing Service Account**: If you get an error about missing service account, make sure you've placed the `service-account.json` file in the root directory.
- **Insufficient Permissions**: Make sure your service account has the necessary permissions (Firebase Admin role is recommended).
- **User Already Exists**: If the user already exists, the script will only update the Firestore document.
