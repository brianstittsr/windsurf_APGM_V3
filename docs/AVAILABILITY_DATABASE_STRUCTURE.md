# Availability Calendar Database Structure

## Firebase Collections

### 1. `artistAvailability` Collection
```typescript
interface ArtistAvailability {
  id: string;
  artistId: string; // Reference to user ID with role 'artist' or 'admin'
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isEnabled: boolean; // Toggle for the day
  timeRanges: TimeRange[];
  servicesOffered: string[]; // Array of service IDs, or ['all'] for all services
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TimeRange {
  id: string;
  startTime: string; // Format: "9:00 AM"
  endTime: string;   // Format: "5:00 PM"
  isActive: boolean;
}
```

### 2. `artistScheduleExceptions` Collection (for holidays, time off, etc.)
```typescript
interface ScheduleException {
  id: string;
  artistId: string;
  date: string; // Format: "2025-08-04"
  type: 'unavailable' | 'custom_hours';
  reason?: string; // Optional reason (vacation, holiday, etc.)
  customTimeRanges?: TimeRange[]; // Only if type is 'custom_hours'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Update existing `users` collection to include availability settings
```typescript
interface User {
  // ... existing fields
  availabilitySettings?: {
    timezone: string; // e.g., "America/New_York"
    bufferTime: number; // Minutes between appointments
    advanceBookingDays: number; // How many days in advance can clients book
    defaultServiceDuration: number; // Default duration in minutes
  };
}
```

## Database Indexes Needed
- `artistAvailability`: compound index on (artistId, dayOfWeek)
- `artistScheduleExceptions`: compound index on (artistId, date)

## Example Data Structure

### Artist Weekly Availability
```json
{
  "artistAvailability": {
    "artist1_monday": {
      "id": "artist1_monday",
      "artistId": "artist123",
      "dayOfWeek": "monday",
      "isEnabled": false,
      "timeRanges": [],
      "servicesOffered": ["all"],
      "createdAt": "2025-08-04T21:15:37Z",
      "updatedAt": "2025-08-04T21:15:37Z"
    },
    "artist1_saturday": {
      "id": "artist1_saturday",
      "artistId": "artist123",
      "dayOfWeek": "saturday",
      "isEnabled": true,
      "timeRanges": [
        {
          "id": "range1",
          "startTime": "9:00 AM",
          "endTime": "5:00 PM",
          "isActive": true
        }
      ],
      "servicesOffered": ["all"],
      "createdAt": "2025-08-04T21:15:37Z",
      "updatedAt": "2025-08-04T21:15:37Z"
    }
  }
}
```

### Schedule Exception Example
```json
{
  "artistScheduleExceptions": {
    "exception1": {
      "id": "exception1",
      "artistId": "artist123",
      "date": "2025-12-25",
      "type": "unavailable",
      "reason": "Christmas Holiday",
      "createdAt": "2025-08-04T21:15:37Z",
      "updatedAt": "2025-08-04T21:15:37Z"
    }
  }
}
```
