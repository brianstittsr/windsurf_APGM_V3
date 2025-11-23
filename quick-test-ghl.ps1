# Quick GHL API Test
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"

Write-Host "Testing GHL API Key..." -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Version" = "2021-07-28"
    }
    
    # For location-specific Private Integration, try multiple endpoints
    Write-Host "Testing with contacts endpoint..." -ForegroundColor Gray
    
    # First try contacts (most basic scope)
    try {
        $response = Invoke-RestMethod -Uri "https://services.leadconnectorhq.com/contacts/?limit=1" -Headers $headers -Method Get
        $endpoint = "contacts"
    } catch {
        Write-Host "Contacts failed, trying calendars..." -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri "https://services.leadconnectorhq.com/calendars/" -Headers $headers -Method Get
        $endpoint = "calendars"
    }
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "This is a location-specific Private Integration key" -ForegroundColor Cyan
    Write-Host "Working endpoint: $endpoint" -ForegroundColor Gray
    Write-Host ""
    
    if ($endpoint -eq "calendars") {
        Write-Host "Calendars found: $($response.calendars.Count)" -ForegroundColor White
        Write-Host ""
        
        if ($response.calendars.Count -gt 0) {
            Write-Host "Calendars:" -ForegroundColor Cyan
            foreach ($cal in $response.calendars) {
                Write-Host "  - $($cal.name) (ID: $($cal.id))" -ForegroundColor White
            }
            Write-Host ""
        }
    } else {
        Write-Host "Contacts endpoint accessible" -ForegroundColor White
        Write-Host "Total contacts: $($response.total)" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "Your API key is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Enter this API key on the website GoHighLevel tab" -ForegroundColor Yellow
    
} catch {
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "This means your API key is invalid or the wrong type." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You need to create a Private Integration API key:" -ForegroundColor Cyan
        Write-Host "1. Go to GHL: Settings -> Integrations -> Private Integrations" -ForegroundColor White
        Write-Host "2. Create new integration" -ForegroundColor White
        Write-Host "3. Enable locations.readonly scope" -ForegroundColor White
        Write-Host "4. Generate API Key" -ForegroundColor White
    }
}
