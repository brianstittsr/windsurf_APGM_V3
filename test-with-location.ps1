# Test GHL with Location ID
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"  # Your location ID

Write-Host "Testing GHL API with Location ID..." -ForegroundColor Cyan
Write-Host "Location ID: $LocationId" -ForegroundColor Gray
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Test with location ID in query params
Write-Host "Test 1: Contacts with locationId parameter" -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/contacts/?locationId=$LocationId&limit=1"
    Write-Host "URL: $url" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Total contacts: $($response.total)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Test 2: Calendars with locationId parameter" -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/calendars/?locationId=$LocationId"
    Write-Host "URL: $url" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Calendars found: $($response.calendars.Count)" -ForegroundColor White
    
    if ($response.calendars.Count -gt 0) {
        Write-Host ""
        Write-Host "Calendars:" -ForegroundColor Cyan
        foreach ($cal in $response.calendars) {
            Write-Host "  - $($cal.name) (ID: $($cal.id))" -ForegroundColor White
        }
    }
    Write-Host ""
    Write-Host "API KEY IS WORKING!" -ForegroundColor Green
    Write-Host "Use this key and location ID on the website" -ForegroundColor Yellow
} catch {
    Write-Host "FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
