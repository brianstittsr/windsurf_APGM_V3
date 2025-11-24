# Test GHL Opportunities - Get actual opportunities
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"
$PipelineId = "kRzxfCM0uUTEuMHBFOtV"  # NEW CUSTOMERS pipeline

Write-Host "Fetching opportunities from GHL..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Get opportunities
Write-Host "Fetching opportunities..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/opportunities/?locationId=$LocationId&pipelineId=$PipelineId"
    Write-Host "URL: $url" -ForegroundColor Gray
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    
    Write-Host "SUCCESS! Found $($response.opportunities.Count) opportunities" -ForegroundColor Green
    Write-Host ""
    
    foreach ($opp in $response.opportunities | Select-Object -First 5) {
        Write-Host "Opportunity: $($opp.name)" -ForegroundColor Cyan
        Write-Host "  ID: $($opp.id)" -ForegroundColor White
        Write-Host "  Status: $($opp.status)" -ForegroundColor White
        Write-Host "  Stage: $($opp.pipelineStageId)" -ForegroundColor White
        Write-Host "  Contact ID: $($opp.contactId)" -ForegroundColor White
        
        # Get full opportunity details to see if it has appointment info
        Write-Host "  Fetching full details..." -ForegroundColor Gray
        try {
            $detailUrl = "https://services.leadconnectorhq.com/opportunities/$($opp.id)"
            $detailResponse = Invoke-RestMethod -Uri $detailUrl -Headers $headers -Method Get
            
            $oppDetail = $detailResponse.opportunity
            
            Write-Host "  Full opportunity data:" -ForegroundColor Yellow
            Write-Host ($oppDetail | ConvertTo-Json -Depth 3) -ForegroundColor White
            
        } catch {
            Write-Host "  Failed to get details: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "---" -ForegroundColor Gray
        Write-Host ""
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
