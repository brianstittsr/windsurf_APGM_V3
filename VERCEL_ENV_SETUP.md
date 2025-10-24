# Vercel Environment Variables Setup Guide

This guide explains how to set up the required environment variables in your Vercel project for the permanent makeup booking website.

## Firebase Configuration

### Required Environment Variables

Add these environment variables to your Vercel project:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project-id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:abcdef1234567890` |

### Firebase Admin SDK Variables

For server-side Firebase Admin functionality, add these variables:

| Variable Name | Description | How to Get |
|---------------|-------------|------------|
| `FIREBASE_PROJECT_ID` | Firebase Project ID | Same as `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | From Firebase Service Account JSON |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | From Firebase Service Account JSON |

## How to Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (include the entire string with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

## Stripe Configuration

### Required Environment Variables

Add these environment variables for Stripe integration:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `STRIPE_TEST_PUBLISHABLE_KEY` | Stripe Test Publishable Key | `pk_test_...` |
| `STRIPE_TEST_SECRET_KEY` | Stripe Test Secret Key | `sk_test_...` |
| `STRIPE_TEST_WEBHOOK_SECRET` | Stripe Test Webhook Secret | `whsec_...` |
| `STRIPE_LIVE_PUBLISHABLE_KEY` | Stripe Live Publishable Key | `pk_live_...` |
| `STRIPE_LIVE_SECRET_KEY` | Stripe Live Secret Key | `sk_live_...` |
| `STRIPE_LIVE_WEBHOOK_SECRET` | Stripe Live Webhook Secret | `whsec_...` |

## How to Add Environment Variables in Vercel

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the project you want to configure
3. Go to "Settings" > "Environment Variables"
4. Add each variable with its name and value
5. Click "Save" when done
6. Redeploy your project to apply the changes

## Important Notes

- Make sure to add the environment variables to all environments (Production, Preview, Development)
- For `FIREBASE_PRIVATE_KEY`, you may need to replace newlines with `\n` characters
- Never commit your Firebase service account JSON or Stripe keys to your repository
- Use different Stripe API keys for development and production environments

## Troubleshooting

If you encounter build errors related to missing environment variables:

1. Verify all required variables are set in the Vercel dashboard
2. Check for typos in variable names
3. Ensure the values are correctly formatted (especially the Firebase private key)
4. Redeploy the application after making changes to environment variables
