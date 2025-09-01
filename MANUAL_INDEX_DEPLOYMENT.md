# Manual Firestore Index Deployment Guide

## Firebase CLI Permission Issue
The Firebase CLI is installed but `brianstittsr@gmail.com` lacks permissions for the `aprettygirlmatterdb` project.

## **Option 1: Fix Permissions (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `aprettygirlmatterdb` project
3. Click **Settings** (gear icon) → **Users and permissions**
4. Click **Add member**
5. Enter: `brianstittsr@gmail.com`
6. Set role: **Owner** or **Editor**
7. Click **Add member**

After fixing permissions, run:
```bash
firebase deploy --only firestore:indexes
```

## **Option 2: Manual Index Creation**
Create indexes directly in Firebase Console:

### 1. Go to Firestore Console
- Visit: https://console.firebase.google.com/project/aprettygirlmatterdb/firestore/indexes
- Select **Composite** tab

### 2. Create Required Indexes

**Services Index:**
- Collection: `services`
- Fields:
  - `isActive` (Ascending)
  - `createdAt` (Ascending)

**Reviews Index:**
- Collection: `reviews`
- Fields:
  - `isApproved` (Ascending)
  - `isVisible` (Ascending)
  - `createdAt` (Descending)

**Appointments Index:**
- Collection: `appointments`
- Fields:
  - `clientId` (Ascending)
  - `appointmentDate` (Ascending)

**Coupons Index:**
- Collection: `coupons`
- Fields:
  - `isActive` (Ascending)
  - `expirationDate` (Ascending)

**Gift Cards Index:**
- Collection: `giftCards`
- Fields:
  - `isActive` (Ascending)
  - `expirationDate` (Ascending)

**Payments Index:**
- Collection: `payments`
- Fields:
  - `clientId` (Ascending)
  - `createdAt` (Descending)

### 3. Create Each Index
1. Click **Create Index**
2. Enter collection name
3. Add fields with correct sort order
4. Click **Create**
5. Wait for index to build (may take several minutes)

## **Verification**
After creating indexes, run this test:
```bash
node test-firestore-access.js
```

## **Next Steps**
Once indexes are deployed:
1. Test admin dashboard functionality
2. Verify reviews display correctly
3. Test coupon/gift card queries
4. Confirm appointment booking works

The website should be fully functional after index deployment.
