# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```bash
# Resend Email Service (Required for contact form)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Firebase Configuration (if using Firebase features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Development Admin Override (optional)
ADMIN_EMAIL=your_admin_email@example.com
```

## Setup Instructions

1. **Resend Email Service** (Required for contact form):
   - Sign up at https://resend.com
   - Get your API key from the dashboard
   - Add `RESEND_API_KEY=re_your_key_here` to `.env.local`

2. **For Production (Vercel)**:
   - Add all environment variables in Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Redeploy after adding variables

## Contact Form Status

The contact form will:
- ✅ Work with Resend API key configured
- ⚠️ Fall back to console logging if no API key
- ❌ Show error if API key is invalid

Make sure to add the `RESEND_API_KEY` to fix the contact form.
