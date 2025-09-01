# Firebase CLI Installation Script for Windows

Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow

# Method 1: Try npm installation
try {
    Write-Host "Attempting npm installation..." -ForegroundColor Cyan
    npm install -g firebase-tools
    Write-Host "Firebase CLI installed via npm" -ForegroundColor Green
    firebase --version
} catch {
    Write-Host "npm installation failed, trying alternative..." -ForegroundColor Red
    
    # Method 2: Download standalone installer
    Write-Host "Downloading Firebase CLI standalone installer..." -ForegroundColor Cyan
    $url = "https://firebase.tools/bin/win/instant/latest"
    $output = "$env:TEMP\firebase-tools-instant-win.exe"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
        Write-Host "Running installer..." -ForegroundColor Cyan
        Start-Process -FilePath $output -Wait
        Write-Host "Firebase CLI installed via standalone installer" -ForegroundColor Green
    } catch {
        Write-Host "Standalone installation failed" -ForegroundColor Red
        Write-Host "Please install manually from: https://firebase.google.com/docs/cli" -ForegroundColor Yellow
    }
}

# Test installation
Write-Host "Testing Firebase CLI..." -ForegroundColor Cyan
try {
    firebase --version
    Write-Host "Firebase CLI is working!" -ForegroundColor Green
} catch {
    Write-Host "Firebase CLI test failed" -ForegroundColor Red
    Write-Host "Try using npx firebase instead of firebase" -ForegroundColor Yellow
}
