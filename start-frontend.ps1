# Start Frontend Development Server
Write-Host "Starting LC Management Frontend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run dev -- --port 5174
