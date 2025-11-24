# Test GHL Raw Response
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"
$CalendarId = "JvcOyRMMYoIPbH5s1Bg1"  # Service Calendar

Write-Host "Testing GHL Raw API Response..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Set date range for November 2025
$startDate = "2025-11-01T00:00:00.000Z"
$endDate = "2025-11-30T23:59:59.999Z"

Write-Host "Date Range: $startDate to $endDate" -ForegroundColor Yellow
Write-Host ""

# Try /calendars/events endpoint
$url = "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$CalendarId&startTime=$startDate&endTime=$endDate"

Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    
    Write-Host "RAW RESPONSE:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
    Write-Host ""
    Write-Host "---" -ForegroundColor Gray
    Write-Host ""
    
    if ($response.events) {
        Write-Host "Found $($response.events.Count) events" -ForegroundColor Green
        foreach ($evt in $response.events) {
            Write-Host "Event: $($evt.title)" -ForegroundColor Cyan
            Write-Host "  ID: $($evt.id)" -ForegroundColor White
            Write-Host "  Start: $($evt.startTime)" -ForegroundColor White
            Write-Host "  Status: $($evt.status)" -ForegroundColor White
        }
    } else {
        Write-Host "No 'events' property in response" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody -ForegroundColor White
}
