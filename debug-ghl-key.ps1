# Debug GHL API Key - Get detailed error info
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"

Write-Host "Debugging GHL API Key..." -ForegroundColor Cyan
Write-Host "Key: $ApiKey" -ForegroundColor Gray
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Test 1: Contacts
Write-Host "Test 1: Contacts endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://services.leadconnectorhq.com/contacts/?limit=1" -Headers $headers -Method Get
    Write-Host "SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Error Response: $responseBody" -ForegroundColor Red
}

Write-Host ""

# Test 2: Calendars
Write-Host "Test 2: Calendars endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://services.leadconnectorhq.com/calendars/" -Headers $headers -Method Get
    Write-Host "SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Error Response: $responseBody" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check if it's a valid JWT token format
Write-Host "Test 3: Key format analysis" -ForegroundColor Yellow
Write-Host "Key starts with: $($ApiKey.Substring(0, 4))" -ForegroundColor White
Write-Host "Key length: $($ApiKey.Length) characters" -ForegroundColor White

if ($ApiKey.StartsWith("pit-")) {
    Write-Host "Format: Location-specific Private Integration (pit-)" -ForegroundColor Cyan
} elseif ($ApiKey.StartsWith("eyJ")) {
    Write-Host "Format: JWT token (agency-level)" -ForegroundColor Cyan
} else {
    Write-Host "Format: Unknown" -ForegroundColor Yellow
}
