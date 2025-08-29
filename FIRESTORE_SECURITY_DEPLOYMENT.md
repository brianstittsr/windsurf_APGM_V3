# Firestore Security Rules Deployment Guide

## 🚨 URGENT: Your Firestore database is in Test Mode and will expire in 2 days!

I've created secure Firestore security rules to replace the current open Test Mode rules. Here are the deployment options:

## Option 1: Deploy via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` and paste them into the rules editor
5. Click **Publish** to deploy the rules

## Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed and authenticated:

```bash
cd permanent-makeup-website
firebase deploy --only firestore:rules
```

If Firebase CLI is not installed:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## Security Rules Summary

The new rules implement the following security model:

### User Roles & Permissions
- **Clients**: Can read/write their own data and appointments
- **Artists**: Can read all appointments and user data, manage availability
- **Admins**: Full access to all collections

### Collection-Specific Rules

#### Users Collection
- Users can read/write their own profile
- Admins/artists can read all user profiles
- Only admins can delete users

#### Appointments Collection
- Clients can only see their own appointments
- Admins/artists can see and manage all appointments
- Only admins can delete appointments

#### Health Forms
- Only accessible by the client who submitted it and staff
- Staff can update forms (for review/approval)

#### Payments & Financial Data
- Only accessible by the client and staff
- Only staff can create/modify payment records

#### Public Data
- Services, artists, reviews are readable by authenticated users
- Contact forms and assessments allow anonymous submissions
- Reviews are publicly readable

#### Admin-Only Data
- Business settings, analytics, coupon codes
- Only admins can modify these collections

## Key Security Features

1. **Authentication Required**: Most operations require user authentication
2. **Role-Based Access**: Different permissions based on user roles
3. **Data Ownership**: Users can only access their own sensitive data
4. **Input Validation**: Validates required fields for user creation
5. **Audit Trail**: Maintains proper access controls for all collections

## Testing the Rules

After deployment, test the following scenarios:
1. Client login and appointment viewing
2. Admin access to all collections
3. Anonymous contact form submissions
4. Unauthorized access attempts (should be denied)

## Emergency Fallback

If you encounter issues after deployment, you can temporarily revert to test mode by adding this rule (NOT RECOMMENDED for production):

```javascript
match /{document=**} {
  allow read, write: if request.time < timestamp.date(2025, 9, 30);
}
```

## Next Steps

1. **Deploy the rules immediately** to prevent service disruption
2. Test all app functionality after deployment
3. Monitor Firebase Console for any rule violations
4. Consider setting up Firebase security monitoring alerts

## Support

If you encounter any issues:
1. Check Firebase Console logs for rule violations
2. Verify user roles are properly set in the users collection
3. Ensure all required user profile fields are present
4. Contact me if you need rule adjustments for specific use cases
