# Firestore Rules Deployment for Coupon & Gift Card Functionality

## Overview
Updated Firestore security rules to properly support coupon and gift card functionality while maintaining security. The rules now allow authenticated clients to update coupon usage and gift card balances during checkout while restricting creation and management to admin/artist roles.

## Key Changes Made

### Gift Cards Collection Rules
- **Read**: Authenticated users can read for validation during checkout
- **Create**: Only admin/artist can create gift cards
- **Update**: 
  - Admin/artist can perform any updates
  - Authenticated clients can update during checkout (remainingAmount, isRedeemed, updatedAt only)
  - Clients can only decrease gift card balance, not increase it
- **Delete**: Only admin can delete

### Coupons Collection Rules
- **Read**: Authenticated users can read for validation during checkout
- **Create**: Only admin can create coupons
- **Update**:
  - Admin can perform any updates
  - Authenticated clients can update usage tracking during checkout (currentUses, updatedAt only)
  - Clients can only increment usage count, not decrease it
- **Delete**: Only admin can delete

## Security Features

### Gift Card Security
```javascript
// Clients can only update specific fields during checkout
request.resource.data.diff(resource.data).affectedKeys().hasOnly(['remainingAmount', 'isRedeemed', 'updatedAt'])
// Can only decrease balance (prevent fraud)
request.resource.data.remainingAmount <= resource.data.remainingAmount
```

### Coupon Security
```javascript
// Clients can only update usage tracking fields
request.resource.data.diff(resource.data).affectedKeys().hasOnly(['currentUses', 'updatedAt'])
// Can only increment usage count (prevent reuse)
request.resource.data.currentUses > resource.data.currentUses
```

## Deployment Steps

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **aprettygirlmatterllc**
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish** to deploy

### Option 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules from project directory
firebase deploy --only firestore:rules
```

## Testing the Rules

### Test Gift Card Usage
1. Create a test gift card via admin panel
2. Attempt to apply gift card during checkout as authenticated client
3. Verify gift card balance decreases correctly
4. Verify clients cannot increase gift card balance

### Test Coupon Usage
1. Create a test coupon via admin panel
2. Apply coupon during checkout as authenticated client
3. Verify coupon usage count increments
4. Verify clients cannot decrease usage count

### Test Security Restrictions
1. Verify unauthenticated users cannot read coupons/gift cards
2. Verify non-admin users cannot create coupons/gift cards
3. Verify clients cannot modify other fields during updates

## Rollback Plan
If issues occur, revert to previous rules:
1. Go to Firebase Console → Firestore → Rules
2. Click on **Rules history**
3. Select previous version and restore

## Files Modified
- `firestore.rules` - Updated security rules for coupons and gift cards
- Created this deployment guide

## Next Steps After Deployment
1. Test end-to-end coupon and gift card functionality on live site
2. Verify all checkout flows work correctly
3. Monitor Firebase logs for any permission errors
4. Update admin panel if needed for gift card/coupon management

## Support
If permission errors occur after deployment:
- Check Firebase Console → Firestore → Usage tab for error details
- Verify user authentication and role assignments
- Ensure client-side code handles permission errors gracefully
