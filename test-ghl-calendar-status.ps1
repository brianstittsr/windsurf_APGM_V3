# Test GHL Calendar Events with different status filters
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"
$CalendarId = "JvcOyRMMYoIPbH5s1Bg1"  # Service Calendar

Write-Host "Testing calendar events with status filters..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

$startDate = "2025-11-01T00:00:00.000Z"
$endDate = "2025-12-01T00:00:00.000Z"

# Try without any filters first
Write-Host "1. Testing without status filter..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$CalendarId&startTime=$startDate&endTime=$endDate"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   Found $($response.events.Count) events" -ForegroundColor Green
    if ($response.events.Count -gt 0) {
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    }
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Try with includeAll parameter
Write-Host "2. Testing with includeAll=true..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$CalendarId&startTime=$startDate&endTime=$endDate&includeAll=true"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   Found $($response.events.Count) events" -ForegroundColor Green
    if ($response.events.Count -gt 0) {
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    }
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Try fetching calendar details to see settings
Write-Host "3. Fetching calendar details..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/$CalendarId"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Try the appointments endpoint (not events)
Write-Host "4. Testing appointments endpoint..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/appointments?locationId=$LocationId&calendarId=$CalendarId&startDate=$startDate&endDate=$endDate"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Test complete!" -ForegroundColor Cyan
