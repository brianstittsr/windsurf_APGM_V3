# Stripe Admin Mode Toggle Setup Guide

This guide explains how to set up and use the new Stripe payment mode toggle feature for admin users.

## Overview

The Stripe Admin Toggle allows authorized admin users to switch between Test and Live payment modes directly from the admin interface, without requiring code changes or redeployment.

## Features

- **Database-driven configuration** - Mode stored in Firestore for persistence
- **Admin-only access** - Role-based security checks
- **Safety warnings** - Confirmation dialogs for live mode activation
- **Real-time updates** - Immediate mode switching without restart
- **Audit trail** - Tracks who made changes and when
- **Fallback support** - Uses environment variables if database unavailable

## Setup Instructions

### 1. Initialize Firestore Configuration

Run the initialization script to create the `systemConfig/stripe` document:

```bash
cd scripts
node init-stripe-config.js
```

This creates the initial configuration with your current `STRIPE_MODE` environment variable as the default.

### 2. Add Component to Admin Dashboard

Import and add the toggle component to your admin interface:

```tsx
import StripeAdminToggle from '@/components/StripeAdminToggle';

// In your admin dashboard component
<StripeAdminToggle 
  currentUser={currentUser} 
  userRole={userRole} 
/>
```

### 3. Ensure Admin Role Setup

Make sure your users have the correct role in Firestore:

```javascript
// Example: Set user as admin
await updateDoc(doc(db, 'users', userId), {
  role: 'admin'
});
```

## API Endpoints

### Get Current Mode
```
GET /api/stripe/mode
```

Returns current Stripe mode and configuration details.

### Update Mode (Admin Only)
```
POST /api/stripe/mode/update
Body: { "mode": "test|live", "adminUserId": "user-id" }
```

Updates the Stripe mode. Requires admin role verification.

## Security Features

- **Role verification** - Checks user role in Firestore before allowing changes
- **Confirmation dialogs** - Warning when switching to live mode
- **Audit logging** - Records all mode changes with timestamps and user IDs
- **Admin-only visibility** - Component hidden from non-admin users

## Usage

### For Admin Users:

1. **View Current Status** - See current mode (TEST/LIVE) with visual indicators
2. **Switch Modes** - Click the toggle button to switch between test and live
3. **Confirm Changes** - Confirm the switch, especially when going live
4. **Monitor Status** - Real-time updates show the current active mode

### Safety Warnings:

When switching to **LIVE MODE**, users see:
- ⚠️ Warning dialog about real payment processing
- Confirmation required before activation
- Clear indication that real money will be processed

## Database Structure

The configuration is stored in Firestore:

```
systemConfig/stripe:
{
  mode: "test" | "live",
  createdAt: timestamp,
  updatedAt: timestamp,
  updatedBy: "user-id",
  description: "Change description"
}
```

## Environment Variables

The system still respects environment variables as fallback:

- `STRIPE_MODE` - Default mode (test/live)
- `STRIPE_TEST_PUBLISHABLE_KEY` - Test mode publishable key
- `STRIPE_TEST_SECRET_KEY` - Test mode secret key
- `STRIPE_LIVE_PUBLISHABLE_KEY` - Live mode publishable key
- `STRIPE_LIVE_SECRET_KEY` - Live mode secret key

## Troubleshooting

### Component Not Visible
- Ensure user has `role: 'admin'` in Firestore users collection
- Check that `currentUser` and `userRole` props are passed correctly

### Mode Changes Not Persisting
- Verify Firestore rules allow admin users to write to `systemConfig` collection
- Check browser console for API errors
- Ensure Firebase configuration is correct

### API Errors
- Verify admin user permissions in Firestore
- Check that required environment variables are set
- Review server logs for detailed error messages

## Best Practices

1. **Test First** - Always test payment flows in test mode before going live
2. **Monitor Changes** - Review audit logs regularly
3. **Limit Admin Access** - Only grant admin role to trusted users
4. **Environment Consistency** - Ensure all environments have proper key configuration
5. **Regular Key Rotation** - Update Stripe keys periodically for security

## Integration with Existing Code

The new system is backward compatible:
- Existing `getStripeConfig()` calls continue to work
- Environment variable fallback ensures no breaking changes
- Database mode takes precedence when available

This setup provides a secure, user-friendly way to manage Stripe payment modes without requiring technical deployment processes.
