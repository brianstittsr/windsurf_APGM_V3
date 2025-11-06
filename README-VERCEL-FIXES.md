# Vercel Build Fixes

This document explains the fixes applied to resolve Vercel build errors.

## Issues Fixed

1. **Import Error: `db` is not exported from `@/lib/firebase`**
   - Updated files to import and use `getDb()` instead of directly importing `db`
   - Fixed in WorkflowEngine.ts, auth routes, calendar routes

2. **Suspense Boundary Missing for useSearchParams()**
   - Fixed the error: `useSearchParams() should be wrapped in a suspense boundary at page "/quick-deposit"`
   - Fixed the error: `useSearchParams() should be wrapped in a suspense boundary at page "/quick-deposit/success"`
   - Added proper Suspense boundary in both QuickDepositPage and QuickDepositSuccessPage

## Files Modified

1. **`src/services/WorkflowEngine.ts`**
   - Updated to use `getDb()` function instead of imported `db`
   - Fixed TypeScript errors with type assertions

2. **`src/app/api/auth/microsoft/disconnect/route.ts`**
   - Updated to use `getDb()` function

3. **`src/app/api/calendar/sync-ghl/route.ts`**
   - Updated to use `getDb()` function in API endpoints and helper functions

4. **`src/app/api/calendar/sync-all-ghl/route.ts`**
   - Updated to use `getDb()` function

5. **`src/app/quick-deposit/page.tsx`**
   - Added Suspense boundary for useSearchParams() to fix Next.js build error
   - Restructured component with QuickDepositForm inside Suspense

6. **`src/app/quick-deposit/success/page.tsx`**
   - Added Suspense boundary for useSearchParams() to fix Next.js build error
   - Restructured component with QuickDepositSuccessContent inside Suspense

## Firebase Admin Setup

To fully resolve the Firebase Admin setup issues in the build, ensure the following environment variables are set in your Vercel project settings:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## Testing

After making these changes, verify:

1. The WorkflowEngine functions correctly
2. Microsoft Calendar connections still work
3. Calendar synchronization with GoHighLevel works
4. The Quick Deposit form loads and processes correctly
