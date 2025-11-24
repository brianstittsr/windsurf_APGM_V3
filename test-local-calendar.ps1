# Test Local Calendar Structure Debug Endpoint
$url = "http://localhost:3000/api/debug/calendar-structure"

Write-Host "Fetching GHL Calendar Structure (LOCAL)..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Calendar Structure:" -ForegroundColor Yellow
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 20
    
    # Save to file for easier viewing
    $json | ConvertTo-Json -Depth 20 | Out-File "calendar-structure-debug.json"
    Write-Host ""
    Write-Host "Saved to calendar-structure-debug.json" -ForegroundColor Green
    
} catch {
    Write-Host "Error occurred!" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
