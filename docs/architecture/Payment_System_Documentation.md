# Payment System Documentation

## Architecture Overview
- **Frontend Components**:
  - `PaymentForm` - Reusable payment form
  - `PackageCheckoutWithPayment` - Package checkout flow
  - `BookingPaymentStep` - Booking integration
- **Backend Services**:
  - `StripeService` - Handles Stripe API interactions
  - Payment Intent API - Creates payment intents
  - Webhook Endpoint - Processes Stripe events

## Key Flows
### 1. Payment Initialization
```mermaid
sequenceDiagram
  Client->>API: Create Payment Intent
  API->>Stripe: Create Intent
  Stripe->>API: Return client_secret
  API->>Client: Return payment details
  Client->>PaymentForm: Redirect with client_secret
```

### 2. Payment Processing
```mermaid
sequenceDiagram
  Client->>Stripe: Submit payment details
  Stripe->>Webhook: Send payment events
  Webhook->>Firestore: Update payment status
  Webhook->>GHL: Sync booking status if applicable
```

## Integration Points
- **Bookings**: Automatically processes deposits
- **Packages**: Handles package purchases
- **CRM**: Syncs payment status with GoHighLevel

## Error Handling
- Client-side validation
- Stripe error messages
- Webhook retry logic

## Security Considerations
- Never expose Stripe keys client-side
- Validate webhook signatures
- Secure Firestore payment records
