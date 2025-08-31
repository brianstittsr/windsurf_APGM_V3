# Deploy Temporary Test Rules for Coupon/Gift Card Creation

## Quick Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `aprettygirlmatterllc`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the updated rules from `firestore.rules` file
5. Click **Publish** to deploy

## Command Line Deployment (Alternative)

```bash
firebase deploy --only firestore:rules --project aprettygirlmatterllc
```

## Important Notes

⚠️ **TEMPORARY RULES**: The current rules allow public creation of coupons and gift cards for testing purposes. After creating test data, revert to secure rules:

```javascript
// Secure rules (revert after testing)
match /giftCards/{giftCardId} {
  allow read: if true;
  allow create: if isAdminOrArtist(); // Revert to this
  allow update: if isAdminOrArtist();
  allow delete: if isAdmin();
}

match /coupons/{couponId} {
  allow read: if true;
  allow create: if isAdmin(); // Revert to this
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

## After Test Data Creation

1. Run the test coupon/gift card creation script
2. Verify discount calculations work correctly
3. Revert firestore.rules to secure permissions
4. Deploy secure rules again
