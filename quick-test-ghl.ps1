# Quick GHL API Test
$ApiKey = "pit-8701ec64-d06c-4085-a3bc-bb170f873e88"

Write-Host "Testing GHL API Key..." -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Version" = "2021-07-28"
    }
    
    # For location-specific Private Integration, we need to get the location ID from the token
    # Try fetching calendars first as a test
    Write-Host "Testing with calendars endpoint..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "https://services.leadconnectorhq.com/calendars/" -Headers $headers -Method Get
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "This is a location-specific Private Integration key" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Calendars found: $($response.calendars.Count)" -ForegroundColor White
    Write-Host ""
    
    if ($response.calendars.Count -gt 0) {
        Write-Host "Calendars:" -ForegroundColor Cyan
        foreach ($cal in $response.calendars) {
            Write-Host "  - $($cal.name) (ID: $($cal.id))" -ForegroundColor White
        }
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
