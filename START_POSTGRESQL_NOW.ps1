# Start PostgreSQL Service - Quick Fix

Write-Host "Starting PostgreSQL service..." -ForegroundColor Green

# Start the PostgreSQL service
Start-Service -Name "postgresql-x64-15" -ErrorAction SilentlyContinue

# Wait for service to start
Start-Sleep -Seconds 3

# Check if service is running
$service = Get-Service -Name "postgresql-x64-15" -ErrorAction SilentlyContinue

if ($service.Status -eq "Running") {
    Write-Host "✅ PostgreSQL is now running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "1. Go back to your backend terminal"
    Write-Host "2. Press Ctrl+C to stop the server"
    Write-Host "3. Run: npm run dev"
    Write-Host ""
    Write-Host "The backend will now connect to PostgreSQL successfully."
} else {
    Write-Host "❌ Failed to start PostgreSQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manually:" -ForegroundColor Yellow
    Write-Host "1. Press Windows Key + R"
    Write-Host "2. Type: services.msc"
    Write-Host "3. Find: postgresql-x64-15"
    Write-Host "4. Right-click and select: Start"
}

Read-Host "Press Enter to close"
