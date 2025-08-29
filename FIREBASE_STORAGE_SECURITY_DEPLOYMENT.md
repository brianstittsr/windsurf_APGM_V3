# Firebase Storage Security Rules Deployment Guide

## 🚨 URGENT: Your Firebase Storage is in Test Mode and expires in 3 days!

I've created secure Firebase Storage rules to replace the current open Test Mode rules. Here are the deployment options:

## Option 1: Deploy via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** → **Rules**
4. Copy the contents of `storage.rules` and paste them into the rules editor
5. Click **Publish** to deploy the rules

## Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed and authenticated:

```bash
cd permanent-makeup-website
firebase deploy --only storage
```

If Firebase CLI is not installed:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only storage
```

## Security Rules Summary

The new rules implement comprehensive access control for all file types:

### File Organization & Permissions

#### Client Documents
- **`/client-forms/{clientId}/`** - PDF forms, accessible by client owner and staff
- **`/health-forms/{clientId}/`** - Health forms, client and staff access
- **`/consent-forms/{clientId}/`** - Consent documents, staff-managed
- **`/appointments/{appointmentId}/`** - Appointment files, client and staff access

#### User Content
- **`/profile-images/{userId}/`** - Profile photos, user-managed
- **`/before-after/{clientId}/`** - Before/after photos, client and staff access
- **`/temp/{userId}/`** - Temporary uploads, user-owned

#### Business Assets
- **`/portfolio/`** - Portfolio images, authenticated read, staff-managed
- **`/service-images/`** - Service photos, authenticated read, admin-managed
- **`/business/`** - Business assets, authenticated read, admin-managed
- **`/public/`** - Public assets (logos), public read, admin-managed

#### Administrative
- **`/admin/`** - Admin-only files, full admin control

### Key Security Features

1. **Authentication Required**: Most operations require user authentication
2. **Role-Based Access**: Different permissions for clients, artists, and admins
3. **Data Ownership**: Users can only access their own files
4. **Staff Override**: Artists and admins can access client files for support
5. **Admin Control**: Admins have delete permissions for data management

## Firebase Configuration Update

Update your `firebase.json` to include storage rules:

```json
{
  "firestore": {
    "database": "(default)",
    "location": "us-east1",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## PDF Document Access Fix

This addresses the PDF document access issue for client99@aprettygirlmatter.com:

- PDFs stored in `/client-forms/{clientId}/` are now properly secured
- Clients can access their own PDFs
- Staff can access all client PDFs for support
- Authentication is required for all access

## Testing the Rules

After deployment, test these scenarios:
1. Client login and PDF document access
2. Admin access to all storage folders
3. Unauthorized access attempts (should be denied)
4. File upload/download functionality

## Emergency Fallback

If you encounter issues after deployment, you can temporarily revert to test mode by adding this rule (NOT RECOMMENDED for production):

```javascript
match /{allPaths=**} {
  allow read, write: if request.time < timestamp.date(2025, 9, 30);
}
```

## Next Steps

1. **Deploy the storage rules immediately** to prevent service disruption
2. Test all file upload/download functionality after deployment
3. Monitor Firebase Console for any rule violations
4. Verify PDF documents are accessible in user profiles

## Support

If you encounter any issues:
1. Check Firebase Console logs for rule violations
2. Verify user roles are properly set in the users collection
3. Ensure file paths match the rule patterns
4. Contact me if you need rule adjustments for specific use cases
