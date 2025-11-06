# Setup Instructions for APGM Website

## Fix Authentication Issues

### 1. Run Local Profile Creation Tool

This tool will create the missing user profile for the admin account.

```bash
# Navigate to the scripts directory
cd scripts

# Run the local server
node run-local-server.js
```

Then open http://localhost:3030 in your browser and follow the on-screen instructions.

### 2. Add Authorized Domain

To fix the OAuth domain error, you must add your domain to the Firebase authorized domains list:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Settings** > **Authorized domains**
4. Click **Add domain**
5. Enter `www.aprettygirlmatter.com` and click **Add**

### 3. Fix Firestore Security Rules

To fix the GHL permissions error:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** > **Rules**
4. Replace the rules with the content from the `firestore-rules-update.txt` file
5. Click **Publish**

## Alternative: Browser Console Method

If the above doesn't work, you can create the user profile directly in your browser console:

1. Log in to your website with admin@example.com
2. Open your browser developer tools (F12)
3. Go to the Console tab
4. Copy and paste the entire content of `scripts/create-profile-browser.js`
5. Press Enter to run the script

## Verifying Success

After completing these steps:

1. Log out and log back in with admin@example.com
2. The "No user profile found" error should be gone
3. OAuth operations should work correctly
4. GHL workflows should initialize properly
