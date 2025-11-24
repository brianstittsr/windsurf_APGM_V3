# Test Local Availability API
$date = "2025-11-29"
$url = "http://localhost:3000/api/availability/ghl?date=$date"

Write-Host "Testing GHL Availability API (LOCAL)..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Has Availability: $($json.hasAvailability)" -ForegroundColor $(if ($json.hasAvailability) { "Green" } else { "Red" })
    Write-Host "  Total Slots: $($json.timeSlots.Count)" -ForegroundColor $(if ($json.timeSlots.Count -gt 0) { "Green" } else { "Red" })
    
    if ($json.timeSlots.Count -gt 0) {
        Write-Host ""
        Write-Host "Time Slots:" -ForegroundColor Yellow
        foreach ($slot in $json.timeSlots) {
            $color = if ($slot.available) { "Green" } else { "Red" }
            Write-Host "  $($slot.time) - $($slot.endTime) [$($slot.duration)] - Available: $($slot.available)" -ForegroundColor $color
        }
    }
    
} catch {
    Write-Host "Error occurred!" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
}
