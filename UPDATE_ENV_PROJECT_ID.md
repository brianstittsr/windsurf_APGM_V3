# Update .env.local Project ID

## Required Change

Update your `.env.local` file to match the Firebase project where you created the database:

**Change this line:**
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aprettygirlmatterllc
```

**To this:**
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aprettygirlmatterdb
```

## Steps:

1. Open `.env.local` file
2. Find the line with `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
3. Change the value from `aprettygirlmatterllc` to `aprettygirlmatterdb`
4. Save the file

## After Update:

Test the connection:
```bash
node test-rules-simple.js
```

You should see the "Invalid resource field value" errors disappear once the project ID matches your actual Firebase project.

## Then Deploy Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `aprettygirlmatterdb` project
3. Navigate to Firestore Database → Rules
4. Copy contents from `firestore-rules-fixed.rules`
5. Paste and publish the rules
