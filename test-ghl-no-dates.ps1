# Test GHL without date filters
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"
$CalendarId = "JvcOyRMMYoIPbH5s1Bg1"  # Service Calendar

Write-Host "Testing GHL API without date filters..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Try different endpoints
$endpoints = @(
    "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$CalendarId",
    "https://services.leadconnectorhq.com/calendars/$CalendarId/events?locationId=$LocationId",
    "https://services.leadconnectorhq.com/calendars/events/appointments?locationId=$LocationId&calendarId=$CalendarId",
    "https://services.leadconnectorhq.com/calendars/$CalendarId/appointments?locationId=$LocationId",
    "https://services.leadconnectorhq.com/calendars/$CalendarId/blocked-slots?locationId=$LocationId"
)

foreach ($url in $endpoints) {
    Write-Host "Trying: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "Failed: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "---" -ForegroundColor Gray
    Write-Host ""
}
