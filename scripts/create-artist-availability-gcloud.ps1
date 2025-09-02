# Create artistAvailability collection using gcloud Firestore commands
# This bypasses authentication issues by using your gcloud session

Write-Host "🔧 Creating artistAvailability collection using gcloud..." -ForegroundColor Green

# Set project
gcloud config set project aprettygirlmatterllc

# Create Victoria's Monday record
Write-Host "Creating victoria_monday..." -ForegroundColor Yellow
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_monday --data='{
  "id": "victoria_monday",
  "artistId": "victoria", 
  "dayOfWeek": "monday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

# Create Victoria's Tuesday record
Write-Host "Creating victoria_tuesday..." -ForegroundColor Yellow
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_tuesday --data='{
  "id": "victoria_tuesday",
  "artistId": "victoria",
  "dayOfWeek": "tuesday", 
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

# Create Victoria's Wednesday record
Write-Host "Creating victoria_wednesday..." -ForegroundColor Yellow
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_wednesday --data='{
  "id": "victoria_wednesday",
  "artistId": "victoria",
  "dayOfWeek": "wednesday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

# Create Victoria's Thursday record
Write-Host "Creating victoria_thursday..." -ForegroundColor Yellow
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_thursday --data='{
  "id": "victoria_thursday",
  "artistId": "victoria",
  "dayOfWeek": "thursday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

# Create Victoria's Friday record
Write-Host "Creating victoria_friday..." -ForegroundColor Yellow
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_friday --data='{
  "id": "victoria_friday",
  "artistId": "victoria",
  "dayOfWeek": "friday",
  "isEnabled": false,
  "timeRanges": [],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

# Create Victoria's Saturday record (ENABLED)
Write-Host "Creating victoria_saturday (ENABLED)..." -ForegroundColor Green
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_saturday --data='{
  "id": "victoria_saturday",
  "artistId": "victoria",
  "dayOfWeek": "saturday",
  "isEnabled": true,
  "timeRanges": [
    {
      "mapValue": {
        "fields": {
          "id": {"stringValue": "sat-morning"},
          "startTime": {"stringValue": "9:00 AM"},
          "endTime": {"stringValue": "1:00 PM"},
          "isActive": {"booleanValue": true}
        }
      }
    }
  ],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

# Create Victoria's Sunday record (ENABLED)
Write-Host "Creating victoria_sunday (ENABLED)..." -ForegroundColor Green
gcloud firestore documents create --collection=artistAvailability --document-id=victoria_sunday --data='{
  "id": "victoria_sunday",
  "artistId": "victoria",
  "dayOfWeek": "sunday",
  "isEnabled": true,
  "timeRanges": [
    {
      "mapValue": {
        "fields": {
          "id": {"stringValue": "sun-morning"},
          "startTime": {"stringValue": "9:00 AM"},
          "endTime": {"stringValue": "1:00 PM"},
          "isActive": {"booleanValue": true}
        }
      }
    }
  ],
  "servicesOffered": ["Blade & Shade Eyebrows", "Powder Brows", "Lip Blush", "Eyeliner"],
  "createdAt": {"timestampValue": "2025-09-02T02:00:00.000Z"},
  "updatedAt": {"timestampValue": "2025-09-02T02:00:00.000Z"}
}'

Write-Host "✅ artistAvailability collection created!" -ForegroundColor Green
Write-Host "📅 Victoria is now available Saturday & Sunday only (9AM-1PM)" -ForegroundColor Cyan
Write-Host "🚫 Tuesday availability has been removed" -ForegroundColor Red
