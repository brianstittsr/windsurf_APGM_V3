# Setting Up Firebase Admin Environment Variables on Vercel

The build logs indicate that Firebase Admin environment variables are not properly configured. This guide explains how to set them up correctly.

## Required Environment Variables

For Firebase Admin SDK to work correctly, you need to set the following environment variables in your Vercel project settings:

1. **`FIREBASE_PROJECT_ID`**: Your Firebase project ID
2. **`FIREBASE_CLIENT_EMAIL`**: The client email from your Firebase service account
3. **`FIREBASE_PRIVATE_KEY`**: The private key from your Firebase service account

## Steps to Configure

1. **Generate a Firebase Service Account Key**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Extract the Required Information**:
   From the downloaded JSON file, you'll need:
   - `project_id` → use as `FIREBASE_PROJECT_ID`
   - `client_email` → use as `FIREBASE_CLIENT_EMAIL`
   - `private_key` → use as `FIREBASE_PRIVATE_KEY`

3. **Add to Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add each variable with its corresponding value
   - Make sure to include the entire private key, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
   - For `FIREBASE_PRIVATE_KEY`, you may need to enclose it in quotes: `"-----BEGIN PRIVATE KEY-----\nXXX...\n-----END PRIVATE KEY-----\n"`

4. **Redeploy Your Application**:
   - After setting these variables, trigger a new deployment

## Important Notes

- Never commit service account keys or environment variables to your repository
- The private key may contain newlines represented as `\n` characters - these need to be preserved
- Environment variables in Vercel are encrypted and secure
- You may need different environment variables for development and production environments

## Troubleshooting

If you continue to see the error after setting these variables, check:

1. Ensure there are no typos in the variable names
2. Verify the private key format includes the header, footer, and all newlines
3. Check that the service account has the necessary permissions in Firebase
4. Try regenerating the service account key if issues persist
