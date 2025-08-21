# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```bash
# Gmail SMTP (Primary method for contact form)
# Use Gmail account with App Password enabled
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_app_password_here

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

1. **Gmail SMTP Setup** (Primary contact form method):
   - Use a Gmail account for sending emails
   - Enable 2-Factor Authentication on the Gmail account
   - Generate an App Password: Google Account → Security → App passwords
   - Add `GMAIL_USER=youremail@gmail.com` and `GMAIL_PASS=your_app_password` to `.env.local`

2. **For Production (Vercel)**:
   - Add all environment variables in Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Redeploy after adding variables

## Contact Form Status

The contact form will:
- ✅ Work with Gmail SMTP configured (primary method)
- ✅ Fall back to FormSubmit service (no configuration needed)
- ✅ Always log submissions for backup

**Email Recipients:**
- TO: victoria@aprettygirlmatter.com
- CC: brianstittsr@gmail.com
