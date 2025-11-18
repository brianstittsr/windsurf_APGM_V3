# Get Location ID from GoHighLevel API
# Usage: .\get-location-id.ps1 "YOUR_API_KEY"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host ""
Write-Host "Finding your Location ID..." -ForegroundColor Cyan
Write-Host ""

# Try to get user info which includes location
$endpoints = @(
    @{
        name = "User Info"
        url = "https://services.leadconnectorhq.com/users/me"
    },
    @{
        name = "Businesses"
        url = "https://services.leadconnectorhq.com/businesses"
    },
    @{
        name = "Calendars"
        url = "https://services.leadconnectorhq.com/calendars/"
    }
)

foreach ($endpoint in $endpoints) {
    Write-Host "Trying endpoint: $($endpoint.name)..." -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod `
            -Uri $endpoint.url `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $ApiKey"
                "Version" = "2021-07-28"
                "Accept" = "application/json"
            } `
            -ErrorAction Stop
        
        Write-Host "SUCCESS! Response from $($endpoint.name):" -ForegroundColor Green
        Write-Host ""
        
        # Pretty print the response
        $response | ConvertTo-Json -Depth 10 | Write-Host
        
        Write-Host ""
        Write-Host "Look for 'locationId' or 'companyId' in the response above." -ForegroundColor Yellow
        Write-Host ""
        
        # Try to extract location ID
        if ($response.locationId) {
            Write-Host "Found Location ID: $($response.locationId)" -ForegroundColor Green -BackgroundColor Black
        }
        if ($response.companyId) {
            Write-Host "Found Company ID: $($response.companyId)" -ForegroundColor Green -BackgroundColor Black
        }
        if ($response.location) {
            Write-Host "Found Location: $($response.location | ConvertTo-Json)" -ForegroundColor Green
        }
        
        Write-Host ""
        
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "====================================================================" -ForegroundColor White
Write-Host ""
Write-Host "Alternative Method:" -ForegroundColor Cyan
Write-Host "1. Go to https://app.gohighlevel.com/" -ForegroundColor White
Write-Host "2. Look at the URL when you're in your location" -ForegroundColor White
Write-Host "3. Format: https://app.gohighlevel.com/location/{LOCATION_ID}/..." -ForegroundColor White
Write-Host "4. Copy the {LOCATION_ID} part" -ForegroundColor White
Write-Host ""
