# Test if appointments are linked to contacts
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"

Write-Host "Checking for appointments via contacts..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Get contacts first
Write-Host "Fetching contacts..." -ForegroundColor Yellow
try {
    $contactsUrl = "https://services.leadconnectorhq.com/contacts/?locationId=$LocationId&limit=10"
    $contactsResponse = Invoke-RestMethod -Uri $contactsUrl -Headers $headers -Method Get
    
    Write-Host "Found $($contactsResponse.contacts.Count) contacts" -ForegroundColor Green
    Write-Host ""
    
    foreach ($contact in $contactsResponse.contacts) {
        Write-Host "Contact: $($contact.firstName) $($contact.lastName)" -ForegroundColor Cyan
        Write-Host "  Email: $($contact.email)" -ForegroundColor White
        Write-Host "  ID: $($contact.id)" -ForegroundColor White
        
        # Try to get appointments for this contact
        try {
            $apptUrl = "https://services.leadconnectorhq.com/contacts/$($contact.id)/appointments"
            $apptResponse = Invoke-RestMethod -Uri $apptUrl -Headers $headers -Method Get
            
            if ($apptResponse.appointments -and $apptResponse.appointments.Count -gt 0) {
                Write-Host "  Appointments: $($apptResponse.appointments.Count)" -ForegroundColor Green
                foreach ($appt in $apptResponse.appointments) {
                    Write-Host "    - $($appt.title) on $($appt.startTime)" -ForegroundColor White
                }
            }
        } catch {
            # Silently skip if endpoint doesn't exist
        }
        
        Write-Host ""
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Also try the appointments endpoint directly with just locationId
Write-Host "Trying direct appointments endpoint..." -ForegroundColor Yellow
try {
    $startDate = "2025-11-01T00:00:00Z"
    $endDate = "2025-12-01T00:00:00Z"
    
    $apptUrl = "https://services.leadconnectorhq.com/appointments/?locationId=$LocationId&startDate=$startDate&endDate=$endDate"
    Write-Host "URL: $apptUrl" -ForegroundColor Gray
    
    $apptResponse = Invoke-RestMethod -Uri $apptUrl -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ($apptResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
    
} catch {
    Write-Host "Failed: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
}
