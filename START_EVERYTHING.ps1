# ============================================================================
# COMPLETE SYSTEM STARTUP - POWERSHELL
# ============================================================================

Write-Host ""
Write-Host "============================================================================"
Write-Host "                    STARTING COMPLETE SYSTEM"
Write-Host "============================================================================"
Write-Host ""

# STEP 1: Start PostgreSQL
Write-Host "[STEP 1/4] Starting PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

$services = @("postgresql-x64-15", "postgresql-x64-14", "postgresql-x64-13")
$started = $false

foreach ($service in $services) {
    $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
    if ($svc) {
        Write-Host "✓ Found $service" -ForegroundColor Green
        if ($svc.Status -eq "Running") {
            Write-Host "✓ $service is already running" -ForegroundColor Green
            $started = $true
            break
        } else {
            Write-Host "  Starting $service..." -ForegroundColor Yellow
            Start-Service -Name $service -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
            $svc.Refresh()
            if ($svc.Status -eq "Running") {
                Write-Host "✓ $service started successfully" -ForegroundColor Green
                $started = $true
                break
            }
        }
    }
}

if (-not $started) {
    Write-Host "✗ PostgreSQL not found or failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL FIX:" -ForegroundColor Yellow
    Write-Host "1. Open Services: Press Windows Key + R, type services.msc" -ForegroundColor Yellow
    Write-Host "2. Find 'postgresql-x64-XX' service" -ForegroundColor Yellow
    Write-Host "3. Right-click and select 'Start'" -ForegroundColor Yellow
    Write-Host "4. Wait 30 seconds" -ForegroundColor Yellow
    Write-Host "5. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# STEP 2: Verify Connection
Write-Host ""
Write-Host "[STEP 2/4] Verifying Database Connection..." -ForegroundColor Cyan
Write-Host ""

$connected = $false
for ($i = 0; $i -lt 5; $i++) {
    try {
        $result = & psql -U postgres -h localhost -p 5432 -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database connection verified" -ForegroundColor Green
            $connected = $true
            break
        }
    } catch {
        # Ignore errors
    }
    
    if ($i -lt 4) {
        Write-Host "  Attempt $($i+1)/5 - Retrying..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $connected) {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "1. Check PostgreSQL is running in Services" -ForegroundColor Yellow
    Write-Host "2. Verify credentials: postgres / MYlove8" -ForegroundColor Yellow
    Write-Host "3. Check port 5432 is available" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# STEP 3: Start Backend
Write-Host "[STEP 3/4] Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening new terminal for backend..." -ForegroundColor Yellow
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

Start-Sleep -Seconds 5

# STEP 4: Start Frontend
Write-Host "[STEP 4/4] Starting Frontend Client..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening new terminal for frontend..." -ForegroundColor Yellow
Write-Host ""

$clientPath = Join-Path $PSScriptRoot "client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm start"

Write-Host ""
Write-Host "============================================================================"
Write-Host "                    SYSTEM STARTED" -ForegroundColor Green
Write-Host "============================================================================"
Write-Host ""
Write-Host "✓ PostgreSQL Database: Running" -ForegroundColor Green
Write-Host "✓ Backend Server: Starting (check terminal)" -ForegroundColor Green
Write-Host "✓ Frontend Client: Starting (check terminal)" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Wait for both terminals to show 'ready' messages" -ForegroundColor Cyan
Write-Host "2. Browser should open to http://localhost:3000" -ForegroundColor Cyan
Write-Host "3. Login to dashboard" -ForegroundColor Cyan
Write-Host "4. Go to 'My Interviews'" -ForegroundColor Cyan
Write-Host "5. Click 'Start AI Interview'" -ForegroundColor Cyan
Write-Host "6. Test payment flow" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================================"
Write-Host ""

Read-Host "Press Enter to exit"
