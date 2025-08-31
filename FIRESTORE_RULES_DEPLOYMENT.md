# Firestore Security Rules Deployment Guide

## Overview
Updated Firestore security rules to fix permission errors and add missing collections:
- Added `userActivities` collection rules for activity logging
- Added `pdfDocuments` collection rules for document management
- All existing rules remain intact with proper role-based access control

## Deployment Methods

### Method 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish** to deploy

### Method 2: Firebase CLI
If you have Firebase CLI installed and configured:

```bash
# Navigate to project directory
cd permanent-makeup-website

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Or deploy all Firebase services
firebase deploy
```

### Method 3: Install Firebase CLI (if needed)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
```

## Updated Rules Summary

### New Collections Added:
1. **userActivities** - User activity logging
   - Users can read/write their own activities
   - Admins and artists can read all activities
   - Only admins can delete activities

2. **pdfDocuments** - PDF document management
   - Users can read their own documents
   - Admins and artists can create/update documents
   - Only admins can delete documents

### Existing Collections:
- All existing security rules remain unchanged
- Role-based access control maintained
- Authentication required for all sensitive operations

## Testing After Deployment

1. **Dashboard Access**: Verify user dashboard loads without permission errors
2. **Activity Logging**: Check that user activities are logged properly
3. **Document Access**: Test PDF document viewing and management
4. **Admin Functions**: Ensure admin services management works correctly

## Troubleshooting

If you encounter deployment issues:

1. **Check Firebase Project**: Ensure you're connected to the correct Firebase project
2. **Verify Authentication**: Make sure you're logged into Firebase CLI
3. **Check Syntax**: Validate the rules syntax in Firebase Console
4. **Test Mode**: If urgent, temporarily enable test mode (not recommended for production)

## Security Notes

- Rules enforce authentication for all operations
- Role-based access control (client, artist, admin)
- Data ownership validation (users can only access their own data)
- Admin override permissions for management functions

## Next Steps

After successful deployment:
1. Test dashboard functionality
2. Verify activity logging works
3. Check document access permissions
4. Test admin services management
