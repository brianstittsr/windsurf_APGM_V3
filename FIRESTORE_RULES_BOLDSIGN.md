# Firestore Rules Update - BoldSign Collections

## New Collections Added

The following Firestore security rules have been added for the BoldSign integration:

```javascript
// BoldSign configuration collection - Admin only
match /boldsignConfig/{configId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}

// BoldSign templates collection - Admin only
match /boldsignTemplates/{templateId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}

// BoldSign documents collection - Admin manage, track sent documents
match /boldsignDocuments/{documentId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}
```

## Deployment Instructions

### Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **apgm-website** (or your project name)
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI

```bash
# Make sure you're logged in
firebase login

# Deploy rules only
firebase deploy --only firestore:rules
```

## Collections Purpose

| Collection | Purpose |
|------------|---------|
| `boldsignConfig` | Stores API key, webhook secret, notification settings, reminder schedule |
| `boldsignTemplates` | Stores synced templates from BoldSign with procedure mappings |
| `boldsignDocuments` | Tracks sent documents and their signature status |

## Access Control

All BoldSign collections are **admin-only** for both read and write operations. This ensures:
- Only admins can configure the BoldSign integration
- Only admins can view/manage templates and documents
- Sensitive API keys are protected

## After Deployment

Once the rules are deployed, the BoldSign Forms manager will be able to:
1. Save and load API configuration
2. Sync and persist templates from BoldSign
3. Track sent documents and signature status
