# Vercel Deployment Environment Variables

## Environment Variable Configuration

When deploying to Vercel, you must configure environment variables in the **Vercel Dashboard** instead of using `.env.local`.

### Vercel Dashboard Setup

1. Go to your **Vercel Project Dashboard**
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

#### Stripe Configuration
```bash
# **Stripe Mode Control:**
STRIPE_MODE=test
# Set to `test` for development/staging, `live` for production.

# Test Keys (for staging/development)
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=your_test_publishable_key
STRIPE_TEST_SECRET_KEY=your_test_secret_key
STRIPE_TEST_WEBHOOK_SECRET=your_test_webhook_secret

# Live Keys (for production only)
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=your_live_publishable_key
STRIPE_LIVE_SECRET_KEY=your_live_secret_key
STRIPE_LIVE_WEBHOOK_SECRET=your_live_webhook_secret

# Public Key (must match the mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
```

#### Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

#### Email Configuration
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Other Configuration
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

## Environment-Specific Deployment

### Staging/Preview Deployments
- Use **test Stripe keys**
- Set `STRIPE_MODE=test`
- Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to test key

### Production Deployment
- Use **live Stripe keys**
- Set `STRIPE_MODE=live`
- Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to live key
- Update `NEXT_PUBLIC_APP_URL` to your production domain

## Vercel Environment Variable Scopes

Configure variables for different environments:

- **Development**: Local development (not used in Vercel)
- **Preview**: Branch deployments and pull requests
- **Production**: Main branch deployment

## Security Best Practices

1. **Never commit** environment variables to Git
2. **Use test keys** for all non-production environments
3. **Rotate keys** regularly
4. **Limit webhook endpoints** to your domain
5. **Monitor Stripe logs** for suspicious activity

## Webhook Configuration

Update your Stripe webhook endpoints for each environment:

- **Test Mode**: `https://your-preview-url.vercel.app/api/stripe/webhook`
- **Live Mode**: `https://yourdomain.com/api/stripe/webhook`

## Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Stripe mode matches key types (test/live)
- [ ] Webhook endpoints configured in Stripe Dashboard
- [ ] Firebase project configured for production domain
- [ ] SMTP credentials tested
- [ ] reCAPTCHA keys valid for production domain

## Troubleshooting

### Common Issues

1. **"No such payment_intent" errors**
   - Check `STRIPE_MODE` matches your key types
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct

2. **Firebase authentication failures**
   - Verify Firebase project settings
   - Check authorized domains in Firebase Console

3. **Email sending failures**
   - Test SMTP credentials
   - Check Gmail app password settings

### Vercel Build Logs

Check Vercel build logs for environment variable loading:
```
✅ Stripe Configuration:
   Mode: TEST
   Environment: Test (Sandbox)
   Publishable Key: pk_test_...
```

## Local vs Vercel Environment Variables

| Environment | File Location | Usage |
|-------------|---------------|-------|
| Local Development | `.env.local` | Development only |
| Vercel Deployment | Vercel Dashboard | Production/Preview |

**Important**: `.env.local` is ignored by Vercel. All production environment variables must be configured in the Vercel Dashboard.
