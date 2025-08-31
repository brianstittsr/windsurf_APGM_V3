# Firestore Rules Fix - Gift Cards & Coupons

## Issue Identified
Gift cards and coupons are failing to apply with "Failed to apply" errors because the `giftCards` and `coupons` collections are missing from Firestore security rules.

## Root Cause
The validation services try to read from these collections but get permission denied errors:
- `GiftCardService.validateGiftCard()` queries `giftCards` collection
- `CouponService.validateCoupon()` queries `coupons` collection

## Solution Applied
Added comprehensive rules for both collections:

```javascript
// Gift Cards Collection - Public read for validation, admin/artist write
match /giftCards/{giftCardId} {
  allow read: if true; // Public read access for gift card validation
  allow create: if isAdminOrArtist();
  allow update: if isAdminOrArtist();
  allow delete: if isAdmin();
}

// Coupons Collection - Public read for validation, admin write
match /coupons/{couponId} {
  allow read: if true; // Public read access for coupon validation
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

## Key Features
- **Public read access**: Allows checkout process to validate codes without authentication
- **Role-based write access**: Only admins can create/manage coupons, admins/artists can manage gift cards
- **Secure operations**: Proper permission checks for all CRUD operations

## Expected Result
After deploying these rules:
- ✅ Gift card validation will work
- ✅ Coupon code validation will work
- ✅ Discounts will apply to final price
- ✅ Checkout process will complete successfully

## Deployment Required
Deploy via Firebase Console or CLI:
```bash
firebase deploy --only firestore:rules
```
