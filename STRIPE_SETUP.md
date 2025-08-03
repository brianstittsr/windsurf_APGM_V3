# Stripe Payment Integration Setup

This document explains how to set up Stripe payment processing for the A Pretty Girl Matter booking system.

## Overview

The checkout page now processes payments using Stripe API with the following features:

- **Secure Payment Processing**: PCI-compliant payment handling
- **Deposit System**: Customers pay 30% deposit, remaining balance due at appointment
- **Real-time Validation**: Card validation and error handling
- **Responsive Design**: Mobile-friendly payment forms
- **Webhook Support**: Automatic payment confirmation handling

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
# Set to 'test' for sandbox or 'live' for production
STRIPE_MODE=test

# Test/Sandbox Keys
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key
STRIPE_TEST_SECRET_KEY=sk_test_your_stripe_test_secret_key
STRIPE_TEST_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Live/Production Keys
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_your_stripe_live_publishable_key
STRIPE_LIVE_SECRET_KEY=sk_live_your_stripe_live_secret_key
STRIPE_LIVE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

## Mode Switching

The system supports easy switching between test and production modes:

### Test Mode (Default)
- Set `STRIPE_MODE=test` in your environment
- Uses test keys (pk_test_, sk_test_)
- No real charges are made
- Test cards work for payments
- Yellow indicator shown in checkout

### Live Mode (Production)
- Set `STRIPE_MODE=live` in your environment
- Uses live keys (pk_live_, sk_live_)
- Real charges are processed
- Only real cards work
- Green indicator shown in checkout

### Mode Indicator
The checkout page displays the current Stripe mode:
- **Test Mode**: Yellow warning badge with flask icon
- **Live Mode**: Green success badge with shield icon

## Stripe Account Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification
3. Navigate to the Dashboard

### 2. Get API Keys
1. Go to **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)
4. Add these to your `.env.local` file

### 3. Set up Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to your `.env.local` file

## Payment Flow

### 1. Service Selection
1. Customer selects service and fills booking details
2. Checkout page shows calculated totals (subtotal + tax)
3. Customer clicks "Add Payment Method" to show Stripe form
4. Secure payment processing through Stripe
5. Success confirmation and automatic progression to booking confirmation

**Pricing Structure:**
- Subtotal: Service price from database
- Tax: 7.75% (North Carolina rate)
- Total: Subtotal + Tax
- Deposit: Fixed $200 for all services
- Remaining: Total - $200 (due at appointment)

### 4. Payment Processing
- Customer clicks "Add Payment Method"
- Stripe payment form appears with:
  - Card number, expiry, CVC fields
  - Cardholder name
  - Billing address
- Form validates in real-time
- Payment processed securely through Stripe

### 5. Confirmation
- Successful payment shows confirmation message
- Customer proceeds to booking confirmation
- Webhook handles backend processing

## Components

### StripePaymentForm
Located: `src/components/StripePaymentForm.tsx`

Features:
- Secure card input fields using Stripe Elements
- Real-time validation
- Billing address collection
- Loading states and error handling
- PCI-compliant processing

### CheckoutCart
Located: `src/components/CheckoutCart.tsx`

Updated with:
- Stripe Elements provider
- Payment state management
- Dynamic pricing calculations
- Payment success/error handling
- Mode indicator display

### Stripe Configuration Utility
Located: `src/lib/stripe-config.ts`

Features:
- Automatic mode detection from environment
- Key validation and error handling
- Safe configuration logging
- Mode switching utilities

### Stripe Mode Indicator
Located: `src/components/StripeModeIndicator.tsx`

Features:
- Visual mode indication in checkout
- Real-time mode detection
- Test vs live mode styling
- Admin-friendly display

### API Routes

#### Payment Intent Creation
- **Endpoint**: `/api/create-payment-intent`
- **Method**: POST
- **Purpose**: Creates Stripe PaymentIntent for secure processing

#### Webhook Handler
- **Endpoint**: `/api/stripe/webhook`
- **Method**: POST
- **Purpose**: Handles Stripe webhook events for payment confirmation

#### Mode Information
- **Endpoint**: `/api/stripe/mode`
- **Method**: GET
- **Purpose**: Returns current Stripe mode information for client-side display

## Testing

### Test Cards
Use these test card numbers in development:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

Any future expiry date and any 3-digit CVC work with test cards.

### Test Flow
1. Select a service (e.g., "Strokes Eyebrows" - $550)
2. Fill out booking details
3. Proceed to checkout
4. Click "Add Payment Method"
5. Enter test card details
6. Complete payment
7. Verify success message and confirmation

## Security Features

- **PCI Compliance**: Stripe handles all sensitive card data
- **Encryption**: All data encrypted in transit and at rest
- **Validation**: Real-time card validation
- **Fraud Protection**: Stripe's built-in fraud detection
- **Webhook Verification**: Cryptographic signature verification

## Production Checklist

Before going live:

1. **Switch to Live Keys**:
   - Replace `pk_test_` with `pk_live_`
   - Replace `sk_test_` with `sk_live_`

2. **Webhook Endpoint**:
   - Update webhook URL to production domain
   - Test webhook delivery

3. **SSL Certificate**:
   - Ensure HTTPS is enabled
   - Verify SSL certificate is valid

4. **Business Verification**:
   - Complete Stripe account verification
   - Set up bank account for payouts

5. **Testing**:
   - Test full payment flow in production
   - Verify webhook processing
   - Test error scenarios

## Troubleshooting

### Common Issues

1. **"No such payment_intent" Error**:
   - Check API keys are correct
   - Verify environment variables are loaded

2. **Webhook Not Receiving Events**:
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check webhook event selection

3. **Payment Form Not Loading**:
   - Verify publishable key is set
   - Check browser console for errors
   - Ensure Stripe.js is loaded

### Support

For Stripe-related issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For integration issues, check the browser console and server logs for detailed error messages.
