# GoHighLevel API Key Diagnostic Script
# Usage: .\test-ghl-api-key.ps1 "YOUR_API_KEY_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "🔍 Testing GoHighLevel API Key..." -ForegroundColor Cyan
Write-Host "Key Length: $($ApiKey.Length) characters" -ForegroundColor Gray
Write-Host ""

# Prepare the request body
$body = @{
    apiKey = $ApiKey
} | ConvertTo-Json

# Make the API call
try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/crm/diagnose-key" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    # Display results
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor White
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Message: $($response.message)" -ForegroundColor Green
        
        if ($response.locationCount) {
            Write-Host "Locations Found: $($response.locationCount)" -ForegroundColor Green
        }
        
        if ($response.locations) {
            Write-Host ""
            Write-Host "Sample Locations:" -ForegroundColor Cyan
            foreach ($loc in $response.locations) {
                Write-Host "  • $($loc.name) ($($loc.id))" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error: $($response.error)" -ForegroundColor Red
        
        if ($response.errorAnalysis) {
            Write-Host ""
            Write-Host "Error Analysis:" -ForegroundColor Yellow
            Write-Host "  Status: $($response.errorAnalysis.status) - $($response.errorAnalysis.statusText)" -ForegroundColor White
            
            if ($response.errorAnalysis.possibleIssues) {
                Write-Host ""
                Write-Host "Possible Issues:" -ForegroundColor Yellow
                foreach ($issue in $response.errorAnalysis.possibleIssues) {
                    Write-Host "  • $issue" -ForegroundColor White
                }
            }
        }
        
        if ($response.recommendations) {
            Write-Host ""
            Write-Host "Recommendations:" -ForegroundColor Cyan
            $i = 1
            foreach ($rec in $response.recommendations) {
                Write-Host "  $i. $rec" -ForegroundColor White
                $i++
            }
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor White
    
    # Display diagnostics
    if ($response.diagnostics) {
        Write-Host ""
        Write-Host "Diagnostics:" -ForegroundColor Cyan
        Write-Host "  Key Provided: $($response.diagnostics.keyProvided)" -ForegroundColor White
        Write-Host "  Key Length: $($response.diagnostics.keyLength) characters" -ForegroundColor White
        Write-Host "  First Chars: $($response.diagnostics.keyFirstChars)" -ForegroundColor White
        Write-Host "  Last Chars: $($response.diagnostics.keyLastChars)" -ForegroundColor White
        
        if ($response.diagnostics.hasSpaces) {
            Write-Host "  Has Spaces: ⚠️  YES (Problem!)" -ForegroundColor Yellow
        } else {
            Write-Host "  Has Spaces: ✅ No" -ForegroundColor Green
        }
        
        if ($response.diagnostics.hasNewlines) {
            Write-Host "  Has Newlines: ⚠️  YES (Problem!)" -ForegroundColor Yellow
        } else {
            Write-Host "  Has Newlines: ✅ No" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    
    # Return the full response as JSON for further processing if needed
    return $response
    
} catch {
    Write-Host "❌ ERROR: Failed to connect to diagnostic endpoint" -ForegroundColor Red
    Write-Host ""
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the dev server is running:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    exit 1
}
