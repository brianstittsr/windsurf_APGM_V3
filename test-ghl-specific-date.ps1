# Test GHL for specific appointment on Nov 24, 2025 at 10:00 AM
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"
$CalendarId = "JvcOyRMMYoIPbH5s1Bg1"  # Service Calendar

Write-Host "Testing for appointment on Nov 24, 2025..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Exact date from your screenshot: Nov 24, 2025, 10:00 am
$startDate = "2025-11-24T00:00:00.000Z"
$endDate = "2025-11-25T00:00:00.000Z"

Write-Host "Searching for events on Nov 24..." -ForegroundColor Yellow
Write-Host "Start: $startDate" -ForegroundColor Gray
Write-Host "End: $endDate" -ForegroundColor Gray
Write-Host ""

try {
    $url = "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$CalendarId&startTime=$startDate&endTime=$endDate"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    if ($response.events -and $response.events.Count -gt 0) {
        Write-Host "✅ Found $($response.events.Count) events!" -ForegroundColor Green
        foreach ($evt in $response.events) {
            Write-Host "  - $($evt.title) at $($evt.startTime)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ No events found for this date" -ForegroundColor Red
        Write-Host ""
        Write-Host "This could mean:" -ForegroundColor Yellow
        Write-Host "  1. The appointment hasn't been 'confirmed' yet" -ForegroundColor White
        Write-Host "  2. It's stored as a blocked slot, not an event" -ForegroundColor White
        Write-Host "  3. The appointment is in draft/pending status" -ForegroundColor White
        Write-Host "  4. Need to check the contact's appointments directly" -ForegroundColor White
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Try to get the contact's appointments (Vanessa Harris)
Write-Host "Checking contact 'Vanessa Harris' for appointments..." -ForegroundColor Yellow
try {
    # First find the contact
    $contactUrl = "https://services.leadconnectorhq.com/contacts/?locationId=$LocationId&query=vanessa"
    $contactResponse = Invoke-RestMethod -Uri $contactUrl -Headers $headers -Method Get
    
    if ($contactResponse.contacts -and $contactResponse.contacts.Count -gt 0) {
        $contact = $contactResponse.contacts[0]
        Write-Host "Found contact: $($contact.firstName) $($contact.lastName)" -ForegroundColor Green
        Write-Host "Contact ID: $($contact.id)" -ForegroundColor White
        Write-Host ""
        
        # Try to get contact's appointments
        Write-Host "Fetching contact's appointments..." -ForegroundColor Gray
        try {
            $apptUrl = "https://services.leadconnectorhq.com/contacts/$($contact.id)/appointments"
            $apptResponse = Invoke-RestMethod -Uri $apptUrl -Headers $headers -Method Get
            Write-Host ($apptResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
        } catch {
            Write-Host "Contact appointments endpoint not available" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "Could not search contacts: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
