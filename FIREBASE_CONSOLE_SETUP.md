# Create artistAvailability Collection - Firebase Console

## Step 1: Access Firebase Console
Go to: https://console.firebase.google.com/project/aprettygirlmatterllc/firestore/data

## Step 2: Create Collection
1. Click "Start collection"
2. Collection ID: `artistAvailability`
3. Click "Next"

## Step 3: Create Victoria's Documents
Create these 7 documents with exact data:

### Document 1: victoria_monday
```json
{
  "id": "victoria_monday",
  "artistId": "victoria",
  "dayOfWeek": "monday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

### Document 2: victoria_tuesday
```json
{
  "id": "victoria_tuesday",
  "artistId": "victoria",
  "dayOfWeek": "tuesday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

### Document 3: victoria_wednesday
```json
{
  "id": "victoria_wednesday",
  "artistId": "victoria",
  "dayOfWeek": "wednesday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

### Document 4: victoria_thursday
```json
{
  "id": "victoria_thursday",
  "artistId": "victoria",
  "dayOfWeek": "thursday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

### Document 5: victoria_friday
```json
{
  "id": "victoria_friday",
  "artistId": "victoria",
  "dayOfWeek": "friday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

### Document 6: victoria_saturday ⭐ ENABLED
```json
{
  "id": "victoria_saturday",
  "artistId": "victoria",
  "dayOfWeek": "saturday",
  "isEnabled": true,
  "timeRanges": [
    {
      "id": "sat-morning",
      "startTime": "9:00 AM",
      "endTime": "1:00 PM",
      "isActive": true
    }
  ],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

### Document 7: victoria_sunday ⭐ ENABLED
```json
{
  "id": "victoria_sunday",
  "artistId": "victoria",
  "dayOfWeek": "sunday",
  "isEnabled": true,
  "timeRanges": [
    {
      "id": "sun-morning",
      "startTime": "9:00 AM",
      "endTime": "1:00 PM",
      "isActive": true
    }
  ],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": "2025-09-02T02:00:00.000Z",
  "updatedAt": "2025-09-02T02:00:00.000Z"
}
```

## Important Notes:
- Only Saturday and Sunday have `isEnabled: true`
- Only Saturday and Sunday have timeRanges with 9:00 AM - 1:00 PM
- All other days have `isEnabled: false` and empty timeRanges
- This will fix the Tuesday availability issue completely

## Result:
After creating these documents, the booking calendar will show Victoria only available on Saturday and Sunday from 9 AM to 1 PM, eliminating the Tuesday availability problem.
