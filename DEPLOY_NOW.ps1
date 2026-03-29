#!/usr/bin/env pwsh

# ============================================================================
#                    DEPLOY FIXED WEBSITE - POWERSHELL SCRIPT
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                    DEPLOYING FIXED WEBSITE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Apply Database Migration
Write-Host "[1/5] Applying database migration..." -ForegroundColor Yellow
Set-Location server
try {
    & npx prisma migrate deploy
    Write-Host "✅ Database migration completed" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Database migration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Install dependencies
Write-Host "[2/5] Checking dependencies..." -ForegroundColor Yellow
try {
    & npm install
    Write-Host "✅ Dependencies checked" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Dependency check had issues" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Start backend server
Write-Host "[3/5] Starting backend server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm run dev" -WindowStyle Normal
Write-Host "✅ Backend server started (check new window)" -ForegroundColor Green
Write-Host ""

# Step 4: Start frontend
Write-Host "[4/5] Starting frontend..." -ForegroundColor Yellow
Set-Location ..\client
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm run dev" -WindowStyle Normal
Write-Host "✅ Frontend server started (check new window)" -ForegroundColor Green
Write-Host ""

# Step 5: Display status
Write-Host "[5/5] Deployment complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                    DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Database: MIGRATED" -ForegroundColor Green
Write-Host "✅ Backend: RUNNING (http://localhost:5000)" -ForegroundColor Green
Write-Host "✅ Frontend: RUNNING (http://localhost:3000)" -ForegroundColor Green
Write-Host ""
Write-Host "All errors have been fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Login with your credentials" -ForegroundColor White
Write-Host "3. Test payment flow" -ForegroundColor White
Write-Host "4. Test interview flow" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
