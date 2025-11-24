# Comprehensive test of all possible GHL appointment endpoints
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"
$CalendarId = "JvcOyRMMYoIPbH5s1Bg1"

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

$startDate = "2025-11-01T00:00:00.000Z"
$endDate = "2025-12-01T00:00:00.000Z"

Write-Host "=== COMPREHENSIVE GHL API TEST ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Calendar free/busy slots
Write-Host "1. Testing calendar free/busy slots..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/$CalendarId/free-slots?locationId=$LocationId&startDate=$startDate&endDate=$endDate"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Calendar appointments (different format)
Write-Host "2. Testing calendar appointments endpoint..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/appointments?locationId=$LocationId&calendarId=$CalendarId&startTime=$startDate&endTime=$endDate"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get calendar details (might include appointments)
Write-Host "3. Testing calendar details..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/$CalendarId?locationId=$LocationId"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 4: List all appointments for location
Write-Host "4. Testing location appointments..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/appointments?locationId=$LocationId&from=$startDate&to=$endDate"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Calendar events with different date format
Write-Host "5. Testing events with ISO date format..." -ForegroundColor Yellow
try {
    $start = "2025-11-01"
    $end = "2025-11-30"
    $url = "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$CalendarId&startTime=$start&endTime=$end"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "   Failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
