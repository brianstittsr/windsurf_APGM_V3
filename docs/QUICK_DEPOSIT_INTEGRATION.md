# Quick Deposit Feature Integration

This document describes the integration of the "Quick Deposit" feature that allows clients to pay a $50 deposit upfront to secure their appointment before completing the full booking process.

## Overview

The Quick Deposit feature creates a streamlined path for clients to commit to services with a minimal initial commitment. After paying the deposit, the client receives the GRANDOPEN250 coupon ($250 value) which can be used during the full booking process.

## Customer Journey

1. Client clicks "Pay $50 Deposit" button on the website
2. Client enters email and optionally selects a specific service 
3. Client pays $50 deposit via Stripe
4. Client receives confirmation page with GRANDOPEN250 coupon code
5. Client receives email with booking instructions and coupon code
6. Client completes full booking using the "Book Now" button in the header
7. Client applies GRANDOPEN250 coupon code during checkout
8. Client completes health forms and pays remaining balance ($200) at the appointment

## Implementation Components

### 1. QuickDepositButton Component

- File: `src/components/QuickDepositButton.tsx`
- Usage: Import and add to any page where you want to offer quick deposits
- Example:

```tsx
import { QuickDepositButton } from '@/components';

export default function ServicePage() {
  return (
    <div>
      <h1>Microblading Service</h1>
      <p>Beautiful, natural-looking eyebrows...</p>
      
      <QuickDepositButton 
        serviceId="microblading"
        text="Reserve Your Appointment"
      />
    </div>
  );
}
```

### 2. Quick Deposit Form

- URL: `/quick-deposit`
- Form collects: Name, Email, Phone, and Service selection
- Stripe integration for payment processing

### 3. API Routes

- `POST /api/create-deposit-session` - Creates Stripe checkout session for deposit
- `POST /api/verify-deposit-payment` - Verifies successful payment and triggers workflow
- `POST /api/webhooks/stripe` - Processes Stripe webhooks for asynchronous payment events

### 4. BMAD Workflow Integration

The feature integrates with the existing `deposit_paid` workflow in `bmad-workflows.ts` which:

1. Sends SMS confirmation of deposit payment
2. Sends HTML email with booking instructions and GRANDOPEN250 coupon
3. Updates GHL opportunity stage (if applicable)

## Environment Variables

The following environment variables must be set:

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Secret for Stripe webhook verification
- `NEXT_PUBLIC_SITE_URL` - The public URL of your site

## How to Test

1. Set up environment variables in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to `/quick-deposit` or click a QuickDepositButton
4. Complete the form with test data
5. Use Stripe test card: 4242 4242 4242 4242 (exp: any future date, CVC: any 3 digits)
6. Check the success page and email to verify the workflow

## Adding the Button to Pages

Add the Quick Deposit button to strategic locations:

- Service pages
- Home page hero section
- Pricing page
- Special offers page

Example placement in home page:

```tsx
import { QuickDepositButton } from '@/components';

export default function HomePage() {
  return (
    <div className="hero-section">
      <h1>Transform Your Look</h1>
      <p>Premium permanent makeup services by certified artists</p>
      
      <div className="cta-buttons">
        <Link href="/services" className="btn btn-outline">
          Explore Services
        </Link>
        
        <QuickDepositButton 
          variant="primary"
          size="lg"
          text="Pay $50 Deposit & Save $300"
          className="ml-4"
        />
      </div>
    </div>
  );
}
```

## Support

For any issues or questions about the Quick Deposit feature, please contact the development team.
