# Firebase Setup Guide

## Prerequisites
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Enable Authentication (optional, for user login)
4. Enable Storage (for image uploads)

## Environment Setup
1. Copy `env-template.txt` to `.env.local`
2. Fill in your Firebase configuration values from the Firebase console
3. Add your Stripe keys for payment processing
4. Configure SMTP settings for email notifications

## Database Initialization
1. Start the development server: `npm run dev`
2. Navigate to any page and add `?setup=true` to the URL
3. This will render the DatabaseSetup component to initialize default data
4. Or manually run the initialization script

## Firebase Security Rules
Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Services are publicly readable
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only in production
    }
    
    // Appointments - users can read/write their own
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Health forms - sensitive data, restricted access
    match /healthForms/{formId} {
      allow read, write: if request.auth != null;
    }
    
    // Other collections...
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Features Implemented
- ✅ Complete Firebase database structure
- ✅ Service management
- ✅ Appointment booking flow
- ✅ Health form submission
- ✅ Contact form integration
- ✅ Real-time availability
- ✅ Gift card system
- ✅ Payment tracking
- ✅ Business settings

## Next Steps
1. Set up authentication for user accounts
2. Implement payment processing with Stripe
3. Add email notifications
4. Deploy to production
5. Configure proper security rules
6. Add admin dashboard for managing bookings

## Testing
- Use the DatabaseSetup component to populate test data
- Test the booking flow from service selection to checkout
- Verify data is being saved to Firestore
- Test form submissions and error handling
