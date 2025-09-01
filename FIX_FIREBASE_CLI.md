# Fix Firebase CLI Connection Issue

## Problem
Firebase CLI commands are not working, preventing index deployment.

## Solutions

### Option 1: Install Firebase CLI
```powershell
# Install via npm
npm install -g firebase-tools

# Or install via standalone installer
# Download from: https://firebase.tools/bin/win/instant/latest
```

### Option 2: Use npx (No Installation Required)
```powershell
# Login
npx firebase login

# Deploy indexes
npx firebase deploy --only firestore:indexes

# Check project
npx firebase projects:list
```

### Option 3: Manual Index Creation (Firebase Console)
If CLI continues to fail, create indexes manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `aprettygirlmatterdb` project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index** for each:

#### Services Index
- Collection ID: `services`
- Fields: 
  - `isActive` (Ascending)
  - `createdAt` (Ascending)

#### Reviews Index
- Collection ID: `reviews`
- Fields:
  - `isApproved` (Ascending)
  - `isVisible` (Ascending)
  - `createdAt` (Descending)

#### Appointments Index
- Collection ID: `appointments`
- Fields:
  - `clientId` (Ascending)
  - `appointmentDate` (Ascending)

#### Coupons Index
- Collection ID: `coupons`
- Fields:
  - `isActive` (Ascending)
  - `expirationDate` (Ascending)

#### Gift Cards Index
- Collection ID: `giftCards`
- Fields:
  - `isActive` (Ascending)
  - `expirationDate` (Ascending)

#### Payments Index
- Collection ID: `payments`
- Fields:
  - `clientId` (Ascending)
  - `createdAt` (Descending)

## Troubleshooting Steps

### Check Node.js
```powershell
node --version
npm --version
```

### Clear npm cache
```powershell
npm cache clean --force
```

### Alternative: Use Firebase Admin SDK
If CLI fails, indexes can be created programmatically via Firebase Admin SDK.

## Quick Fix Commands

```powershell
# Try npx approach first
npx firebase login
npx firebase use aprettygirlmatterdb
npx firebase deploy --only firestore:indexes
```

## Verification
After index creation:
- Check Firebase Console → Firestore Database → Indexes
- Status should show "Building" then "Enabled"
- Test queries that use these indexes
