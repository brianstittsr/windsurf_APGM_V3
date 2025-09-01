# Deploy Firestore Indexes to New Database

## Required Action

The indexes need to be recreated in the new `aprettygirlmatterdb` Firebase project.

## Current Indexes

Your `firestore.indexes.json` contains:

```json
{
  "indexes": [
    {
      "collectionGroup": "services",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Deployment Methods

### Method 1: Firebase CLI (Recommended)
```bash
firebase deploy --only firestore:indexes
```

### Method 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `aprettygirlmatterdb` project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Configure:
   - Collection ID: `services`
   - Fields: `isActive` (Ascending), `createdAt` (Ascending)
   - Query scope: Collection

## Additional Indexes Needed

Based on your application features, you may also need:

### Reviews Collection
```json
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isApproved", "order": "ASCENDING" },
    { "fieldPath": "isVisible", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### Appointments Collection
```json
{
  "collectionGroup": "appointments", 
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "clientId", "order": "ASCENDING" },
    { "fieldPath": "appointmentDate", "order": "ASCENDING" }
  ]
}
```

### Coupons Collection
```json
{
  "collectionGroup": "coupons",
  "queryScope": "COLLECTION", 
  "fields": [
    { "fieldPath": "isActive", "order": "ASCENDING" },
    { "fieldPath": "expirationDate", "order": "ASCENDING" }
  ]
}
```

## Verification

After deployment:
1. Check Firebase Console → Firestore Database → Indexes
2. Verify indexes show as "Building" then "Enabled"
3. Test queries that use these indexes

## Status

- [ ] Deploy existing services index
- [ ] Add reviews index for homepage filtering
- [ ] Add appointments index for admin dashboard
- [ ] Add coupons index for validation queries
