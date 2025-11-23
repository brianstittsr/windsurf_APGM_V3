# Test GHL Private Integration API Key
# This script verifies your API key can access locations

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "Testing GHL Private Integration API Key..." -ForegroundColor Cyan
Write-Host "Key preview: $($ApiKey.Substring(0, [Math]::Min(20, $ApiKey.Length)))..." -ForegroundColor Gray
Write-Host ""

# Test 1: Fetch Locations
Write-Host "Test 1: Fetching locations..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Version" = "2021-07-28"
        "Accept" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://services.leadconnectorhq.com/locations/search" -Headers $headers -Method Get
    
    if ($response.locations) {
        $locationCount = $response.locations.Count
        Write-Host "✅ SUCCESS: Found $locationCount location(s)" -ForegroundColor Green
        
        foreach ($location in $response.locations) {
            Write-Host "   📍 $($location.name) - ID: $($location.id)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "✅ Your API key is a valid Private Integration key!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Copy one of the Location IDs above" -ForegroundColor White
        Write-Host "2. Go to: www.aprettygirlmatter.com/dashboard → GoHighLevel tab" -ForegroundColor White
        Write-Host "3. Paste this API key and the Location ID" -ForegroundColor White
        Write-Host "4. Click 'Save API Key' then 'Test Connection'" -ForegroundColor White
        
    } else {
        Write-Host "⚠️ WARNING: API key works but no locations found" -ForegroundColor Yellow
        Write-Host "This might mean you don't have access to any locations" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ FAILED: $errorMessage" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 401) {
        Write-Host "Error: 401 Unauthorized" -ForegroundColor Red
        Write-Host "This means:" -ForegroundColor Yellow
        Write-Host "  • API key is invalid or expired" -ForegroundColor White
        Write-Host "  • You're using the wrong type of API key" -ForegroundColor White
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Cyan
        Write-Host "1. Go to GHL: Settings → Integrations → Private Integrations" -ForegroundColor White
        Write-Host "2. Create a NEW Private Integration" -ForegroundColor White
        Write-Host "3. Enable 'locations.readonly' scope" -ForegroundColor White
        Write-Host "4. Generate API Key" -ForegroundColor White
        Write-Host "5. Run this script again with the new key" -ForegroundColor White
    }
    elseif ($statusCode -eq 403) {
        Write-Host "Error: 403 Forbidden" -ForegroundColor Red
        Write-Host "This means:" -ForegroundColor Yellow
        Write-Host "  • API key is missing 'locations.readonly' scope" -ForegroundColor White
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Cyan
        Write-Host "1. Go to GHL: Settings → Integrations → Private Integrations" -ForegroundColor White
        Write-Host "2. Edit your integration" -ForegroundColor White
        Write-Host "3. Enable 'locations.readonly' scope" -ForegroundColor White
        Write-Host "4. Regenerate API Key (IMPORTANT!)" -ForegroundColor White
        Write-Host "5. Run this script again with the new key" -ForegroundColor White
    }
    else {
        Write-Host "Unexpected error. Status code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "API Key Type Check:" -ForegroundColor Cyan
Write-Host ""

if ($ApiKey.StartsWith("eyJ")) {
    Write-Host "✅ Key format looks correct (JWT token)" -ForegroundColor Green
    Write-Host "   This appears to be a Private Integration key" -ForegroundColor White
} else {
    Write-Host "⚠️ Key format looks suspicious" -ForegroundColor Yellow
    Write-Host "   Private Integration keys should start with 'eyJ'" -ForegroundColor White
    Write-Host "   You might be using an Agency API key instead" -ForegroundColor White
}

Write-Host ""
Write-Host "Key length: $($ApiKey.Length) characters" -ForegroundColor Gray
if ($ApiKey.Length -gt 100) {
    Write-Host "✅ Length looks good for Private Integration" -ForegroundColor Green
} else {
    Write-Host "⚠️ Key seems too short for Private Integration" -ForegroundColor Yellow
    Write-Host "   Private Integration keys are usually 500+ characters" -ForegroundColor White
}
