# Payment System Deployment Checklist

## Pre-Deployment
- [ ] Verify Stripe API keys are configured in environment variables
- [ ] Test all payment flows with Stripe test credentials
- [ ] Confirm webhook endpoint is publicly accessible
- [ ] Validate Firestore security rules for payment records

## Deployment Steps
1. Set production Stripe keys in environment:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
2. Deploy API routes:
   - `/api/payment-intents`
   - `/api/stripe/webhook`
3. Deploy payment UI components
4. Verify webhook URL in Stripe Dashboard

## Post-Deployment Tests
- [ ] Test successful payment flow
- [ ] Test failed payment flow
- [ ] Verify webhook event processing
- [ ] Check Firestore payment records
- [ ] Test booking payment integration

## Rollback Plan
1. Revert to previous API version
2. Disable payment components
3. Use backup Stripe keys if needed
