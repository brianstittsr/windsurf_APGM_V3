# Fix Database Connection Issue

## Problem
Console shows Firestore errors connecting to `aprettygirlmatterdb` instead of default database:
```
database=projects%2Faprettygirlmatterdb%2Fdatabases%2F(default)
```

## Root Cause
Your `.env.local` file likely contains:
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aprettygirlmatterdb
```

## Solution
Update your `.env.local` file to use the correct project ID:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aprettygirlmatterllc
```

## Steps to Fix
1. Open `.env.local` file in project root
2. Change project ID from `aprettygirlmatterdb` to `aprettygirlmatterllc`
3. Save file
4. Restart development server: `npm run dev`

## Verification
After fixing, console should show:
- No more 400 errors from firestore.googleapis.com
- Services should load on book-now-custom page
- Database URLs should reference `aprettygirlmatterllc`
