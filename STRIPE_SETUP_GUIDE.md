# 🚨 URGENT: Stripe Payment Configuration Required

## Current Issue
Your Stripe payments are failing with 404 errors because **placeholder API keys** are being used instead of real Stripe credentials.

## Error Pattern
```
api.stripe.com/v1/payment_intents/pi_xxx/confirm: 404 (Not Found)
Payment error: No such payment_intent: 'pi_xxx'
```

## Root Cause
The Stripe configuration system is falling back to placeholder keys:
- `pk_test_placeholder_for_development`
- `sk_test_placeholder_for_development`

## Required Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Stripe Configuration
STRIPE_MODE=test

# Test/Development Keys (Get from Stripe Dashboard)
STRIPE_TEST_PUBLISHABLE_KEY=your_test_publishable_key
STRIPE_TEST_SECRET_KEY=your_test_secret_key
STRIPE_TEST_WEBHOOK_SECRET=your_test_webhook_secret

# Production Keys (Only set when ready for live payments)
# STRIPE_LIVE_PUBLISHABLE_KEY=your_live_publishable_key
# STRIPE_LIVE_SECRET_KEY=your_live_secret_key
# STRIPE_LIVE_WEBHOOK_SECRET=your_live_webhook_secret

# Next.js Public Environment Variable
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_test_publishable_key
```

## How to Get Stripe Keys

### 1. Create Stripe Account
- Go to [https://stripe.com](https://stripe.com)
- Sign up for a free account
- Complete account verification

### 2. Get Test Keys
1. Log into Stripe Dashboard
2. Make sure you're in **Test Mode** (toggle in top-left)
3. Go to **Developers** → **API Keys**
4. Copy the **Publishable key** (starts with `pk_test_`)
5. Click **Reveal** on **Secret key** (starts with `sk_test_`)

### 3. Set Up Webhook (Optional but Recommended)
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

## Quick Fix Steps

1. **Create `.env.local` file** in project root
2. **Add your real Stripe test keys** (see format above)
3. **Restart your development server**:
   ```bash
   npm run dev
   ```
4. **Test a payment** - should work immediately

## Verification

After setting up keys, check the browser console for:
```
✅ Payment intent created: pi_xxx (real payment intent ID)
```

Instead of:
```
❌ Stripe not configured - using placeholder key
```

## Security Notes

- **Never commit `.env.local`** to version control
- **Use test keys** for development
- **Only use live keys** in production
- **Rotate keys** if accidentally exposed

## Test Card Numbers

Use these test cards in development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

## Support

If you need help:
1. Check Stripe Dashboard logs
2. Verify environment variables are loaded
3. Restart development server after changes
4. Contact Stripe support for account issues
