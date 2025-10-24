# Permanent Makeup Website Deployment Guide

This guide provides instructions for deploying the permanent makeup booking website to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Firebase](https://firebase.google.com) project
- [Stripe](https://stripe.com) account with API keys

## Deployment Steps

### 1. Set Up Environment Variables

Before deploying, you need to set up all required environment variables in Vercel:

1. Follow the instructions in [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) to configure:
   - Firebase client and admin credentials
   - Stripe API keys
   - Other required environment variables

### 2. Deploy to Vercel

#### Using Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel
```

#### Using Vercel Dashboard

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the project settings
4. Deploy

### 3. Verify Deployment

After deployment, verify that:

1. The website loads correctly
2. Authentication works
3. Booking functionality works
4. Admin dashboard is accessible
5. Payments process correctly

## Troubleshooting Common Issues

### Firebase Initialization Errors

If you see errors like "Failed to initialize Firebase Admin" or "Service account object must contain a string 'project_id' property":

1. Check that all Firebase environment variables are correctly set in Vercel
2. Verify the format of `FIREBASE_PRIVATE_KEY` (it should include `\n` for line breaks)
3. Make sure `FIREBASE_CLIENT_EMAIL` is correctly formatted

### Stripe Payment Issues

If payment processing fails:

1. Ensure Stripe environment variables are correctly set
2. Check that you're using the correct mode (test or live)
3. Verify webhook endpoints are properly configured

### Build Errors

For Next.js build errors:

1. Check for syntax errors in your code
2. Verify that all required environment variables are set
3. Make sure all dependencies are correctly installed

## Maintenance

### Updating the Application

1. Make changes to your codebase
2. Push to your repository
3. Vercel will automatically rebuild and deploy the changes

### Monitoring

1. Use Vercel Analytics to monitor performance
2. Check Firebase Console for authentication and database issues
3. Monitor Stripe Dashboard for payment processing

## Security Considerations

1. Never commit sensitive credentials to your repository
2. Use environment variables for all secrets
3. Regularly rotate API keys and credentials
4. Keep dependencies updated to patch security vulnerabilities
