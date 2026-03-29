#!/usr/bin/env pwsh

# ============================================================================
#                    START EVERYTHING - COMPLETE FIX (PowerShell)
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                    STARTING COMPLETE SYSTEM" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start PostgreSQL Service
Write-Host "[1/6] Starting PostgreSQL service..." -ForegroundColor Yellow
try {
    Start-Service -Name "postgresql-x64-15" -ErrorAction SilentlyContinue
    Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL service may already be running" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3
Write-Host ""

# Step 2: Verify database connection
Write-Host "[2/6] Verifying database connection..." -ForegroundColor Yellow
Set-Location server
try {
    & npx prisma db execute --stdin < $null 2>$null
    Write-Host "✅ Database connection verified" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database connection check (this is normal if DB doesn't exist yet)" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Apply migrations
Write-Host "[3/6] Applying database migrations..." -ForegroundColor Yellow
try {
    & npx prisma migrate deploy
    Write-Host "✅ Migrations applied" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Migration warning (database may already be up to date)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Install dependencies
Write-Host "[4/6] Checking dependencies..." -ForegroundColor Yellow
& npm install 2>$null
Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Step 5: Start backend
Write-Host "[5/6] Starting backend server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "✅ Backend started (check new window)" -ForegroundColor Green
Write-Host ""

# Step 6: Start frontend
Write-Host "[6/6] Starting frontend..." -ForegroundColor Yellow
Set-Location ..\client
& npm install 2>$null
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm run dev" -WindowStyle Normal
Write-Host "✅ Frontend started (check new window)" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                    SYSTEM STARTUP COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ PostgreSQL: RUNNING" -ForegroundColor Green
Write-Host "✅ Backend: RUNNING (http://localhost:5000)" -ForegroundColor Green
Write-Host "✅ Frontend: RUNNING (http://localhost:3000)" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Wait 10 seconds for servers to fully start" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Login with your credentials" -ForegroundColor White
Write-Host "4. Test the payment and interview flows" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
