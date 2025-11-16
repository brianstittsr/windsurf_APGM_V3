# GoHighLevel Integration Setup Guide

This guide explains how to properly set up GoHighLevel integration with your APGM website, fix permission issues, and ensure all components work correctly.

## 1. Initial Setup

### Create GoHighLevel API Key

1. Log into your [GoHighLevel account](https://app.gohighlevel.com/)
2. Navigate to **Settings → Integrations → API**
3. Click on **+ Create** to add a new Private Integration
4. Name it "APGM Website Integration"
5. **Important**: Enable the following permissions:
   - ✅ businesses.readonly
   - ✅ calendars.readonly, calendars.write
   - ✅ campaigns.readonly
   - ✅ contacts.readonly, contacts.write
   - ✅ conversations.readonly, conversations.write
   - ✅ forms.readonly
   - ✅ invoices.readonly, invoices.write
   - ✅ locations.readonly
   - ✅ opportunities.readonly, opportunities.write
   - ✅ surveys.readonly
   - ✅ workflows.readonly
6. Copy the generated API key

### Find Your Location ID

1. In GoHighLevel, go to **Settings → Account Settings**
2. Your Location ID appears at the top of the page
3. Copy this ID

## 2. Update Firestore Settings

There are two ways to store your GHL credentials:

### Option A: Store in Firestore (Recommended)

Run the included script with your API key:

1. Open `src/scripts/setup-ghl-settings.js`
2. Replace `YOUR_GHL_API_KEY_HERE` with your actual API key
3. Replace `YOUR_LOCATION_ID_HERE` with your location ID
4. Save the file
5. Run:
   ```
   cd permanent-makeup-website
   node src/scripts/setup-ghl-settings.js --update
   ```

### Option B: Use Environment Variables

Add the following to your `.env.local` file:

```
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id_here
```

## 3. Fix Firestore Permissions

The "Missing or insufficient permissions" error is caused by restrictive Firestore security rules.

Update your Firestore rules to:

```
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
    }
  }
}
```

To update the rules:

1. Go to the Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Click on the "Rules" tab
5. Paste the rules above
6. Click "Publish"

## 4. Test Your Integration

1. Log in to your website as an admin
2. Navigate to the Admin Dashboard
3. Click on the "GoHighLevel" tab
4. Enter your API key if requested
5. Click "Test Connection"
6. You should see a success message

## Troubleshooting

### Error: "Failed to initialize GHL for workflows"

**Cause**: The BMAD Workflow Engine cannot access the `crmSettings` collection due to Firestore permissions.

**Solution**: Update your Firestore rules as shown in section 3.

### Error: "Body has already been read"

**Cause**: The test-connection API route is trying to read the response body multiple times.

**Solution**: This has been fixed in the latest update. If you still see this error, make sure your code matches the latest version.

### Error: "Cannot GET /locations/"

**Cause**: The GoHighLevel API endpoint URL is incorrect or your API key lacks necessary permissions.

**Solution**: Make sure you've enabled all required permissions in your GoHighLevel Private Integration settings and are using the correct endpoint URL.

## Next Steps

Once your integration is working:

1. **Set up automated workflows**: BMAD Workflows will now automatically trigger for booking confirmations, user registrations, etc.

2. **Synchronize calendars**: You can now use the Calendar tab to sync bookings with GoHighLevel.

3. **Use GoHighLevel CRM**: Your website will now share data with GoHighLevel for complete customer journey management.

---

If you continue to experience issues, verify that:

1. You are logged in as an admin user
2. Your API key has all required permissions
3. Your Firestore security rules allow access to the crmSettings collection
4. Your GoHighLevel account is active and properly configured
