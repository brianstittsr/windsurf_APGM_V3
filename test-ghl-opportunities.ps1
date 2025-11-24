# Test GHL Opportunities API
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"

Write-Host "Testing GHL Opportunities API..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
    "Content-Type" = "application/json"
}

# Search for opportunities
Write-Host "Searching for opportunities..." -ForegroundColor Yellow
try {
    $url = "https://services.leadconnectorhq.com/opportunities/search?location_id=$LocationId"
    $body = @{
        location_id = $LocationId
    } | ConvertTo-Json
    
    Write-Host "URL: $url" -ForegroundColor Gray
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    
    Write-Host "SUCCESS! Found $($response.opportunities.Count) opportunities" -ForegroundColor Green
    Write-Host ""
    
    foreach ($opp in $response.opportunities) {
        Write-Host "Opportunity: $($opp.name)" -ForegroundColor Cyan
        Write-Host "  ID: $($opp.id)" -ForegroundColor White
        Write-Host "  Status: $($opp.status)" -ForegroundColor White
        Write-Host "  Contact: $($opp.contact.name)" -ForegroundColor White
        
        # Get full opportunity details
        Write-Host "  Fetching details..." -ForegroundColor Gray
        try {
            $detailUrl = "https://services.leadconnectorhq.com/opportunities/$($opp.id)"
            $detailResponse = Invoke-RestMethod -Uri $detailUrl -Headers $headers -Method Get
            
            $oppDetail = $detailResponse.opportunity
            
            if ($oppDetail.calendarId) {
                Write-Host "  Calendar ID: $($oppDetail.calendarId)" -ForegroundColor Green
            }
            
            if ($oppDetail.appointmentDate) {
                Write-Host "  Appointment Date: $($oppDetail.appointmentDate)" -ForegroundColor Green
            }
            
            if ($oppDetail.appointmentStatus) {
                Write-Host "  Appointment Status: $($oppDetail.appointmentStatus)" -ForegroundColor Green
            }
            
            # Show raw appointment data
            if ($oppDetail.PSObject.Properties.Name -contains 'appointments') {
                Write-Host "  Appointments: $($oppDetail.appointments.Count)" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "  Failed to get details: $($_.Exception.Message)" -ForegroundColor Red
        }
        
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
