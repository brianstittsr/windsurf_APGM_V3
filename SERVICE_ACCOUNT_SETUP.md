# Firebase Service Account Setup

## Step 1: Download Service Account Key
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=aprettygirlmatterllc
2. Find: `firebase-adminsdk-xxxxx@aprettygirlmatterllc.iam.gserviceaccount.com`
3. Click "Keys" tab → "Add Key" → "Create new key" → JSON
4. Download the JSON file

## Step 2: Extract Values from JSON
The downloaded JSON will look like:
```json
{
  "type": "service_account",
  "project_id": "aprettygirlmatterllc",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@aprettygirlmatterllc.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40aprettygirlmatterllc.iam.gserviceaccount.com"
}
```

## Step 3: Add to .env.local
Add these lines to your .env.local file:

```env
# Firebase Admin SDK Credentials
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aprettygirlmatterllc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## Step 4: Test the Script
Run: `node create-availability-firebase.mjs`

## Alternative: Use Service Account File
Instead of environment variables, you can:
1. Save the JSON file as `serviceAccountKey.json` in your project root
2. Add `serviceAccountKey.json` to .gitignore
3. The script will automatically use the file

## Security Notes
- Never commit service account keys to Git
- Keep the private key secure
- The key has admin access to your Firebase project
