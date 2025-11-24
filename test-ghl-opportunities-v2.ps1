# Test GHL Opportunities API - Version 2
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"

Write-Host "Testing GHL Opportunities API (GET method)..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Try different endpoints
$endpoints = @(
    "https://services.leadconnectorhq.com/opportunities/?locationId=$LocationId",
    "https://services.leadconnectorhq.com/opportunities?location_id=$LocationId",
    "https://services.leadconnectorhq.com/opportunities/pipelines?locationId=$LocationId"
)

foreach ($url in $endpoints) {
    Write-Host "Trying: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        Write-Host ""
        
        # If we found opportunities, get details
        if ($response.opportunities) {
            Write-Host "Found $($response.opportunities.Count) opportunities" -ForegroundColor Green
            
            foreach ($opp in $response.opportunities | Select-Object -First 3) {
                Write-Host ""
                Write-Host "Opportunity: $($opp.name)" -ForegroundColor Cyan
                Write-Host "  ID: $($opp.id)" -ForegroundColor White
                
                # Get full details
                try {
                    $detailUrl = "https://services.leadconnectorhq.com/opportunities/$($opp.id)"
                    $detailResponse = Invoke-RestMethod -Uri $detailUrl -Headers $headers -Method Get
                    Write-Host "  Full details:" -ForegroundColor Gray
                    Write-Host ($detailResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
                } catch {
                    Write-Host "  Failed to get details" -ForegroundColor Red
                }
            }
        }
        
        break  # Success, no need to try other endpoints
        
    } catch {
        Write-Host "Failed: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "---" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
