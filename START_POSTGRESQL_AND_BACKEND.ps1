# ============================================================================
# PostgreSQL and Backend Startup Script for Windows (PowerShell)
# ============================================================================
# This script will:
# 1. Check if PostgreSQL service is running
# 2. Start PostgreSQL if not running
# 3. Wait for PostgreSQL to be ready
# 4. Start the backend server
# ============================================================================

Write-Host ""
Write-Host "============================================================================"
Write-Host " PostgreSQL and Backend Startup Script (PowerShell)"
Write-Host "============================================================================"
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  This script should be run as Administrator for best results."
    Write-Host "   Attempting to continue anyway..."
    Write-Host ""
}

# Check if PostgreSQL service exists
Write-Host "[1/4] Checking PostgreSQL service..."
$pgService = Get-Service -Name "postgresql-x64-15" -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "❌ PostgreSQL service not found."
    Write-Host ""
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if PostgreSQL is running
Write-Host "[2/4] Checking if PostgreSQL is running..."
if ($pgService.Status -eq "Running") {
    Write-Host "✅ PostgreSQL is already running."
} else {
    Write-Host "⏳ PostgreSQL is not running. Starting service..."
    try {
        Start-Service -Name "postgresql-x64-15" -ErrorAction Stop
        Write-Host "✅ PostgreSQL service started."
        
        # Wait for PostgreSQL to be ready
        Write-Host "⏳ Waiting for PostgreSQL to be ready (10 seconds)..."
        Start-Sleep -Seconds 10
    } catch {
        Write-Host "❌ Failed to start PostgreSQL service: $_"
        Write-Host ""
        Write-Host "Please start it manually:"
        Write-Host "  1. Press Windows Key + R"
        Write-Host "  2. Type: services.msc"
        Write-Host "  3. Find: postgresql-x64-15"
        Write-Host "  4. Right-click and select: Start"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Verify database connection
Write-Host "[3/4] Verifying database connection..."
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    Write-Host "✅ psql found. Connection will be verified by backend."
} else {
    Write-Host "⚠️  psql not found in PATH."
    Write-Host "   (This is OK - the backend will verify the connection)"
}

# Start the backend
Write-Host "[4/4] Starting backend server..."
Write-Host ""
Write-Host "============================================================================"

$serverPath = Join-Path $PSScriptRoot "server"
if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server directory not found at: $serverPath"
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $serverPath
Write-Host "Starting: npm run dev"
Write-Host "============================================================================"
Write-Host ""

npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Backend failed to start."
    Write-Host ""
    Write-Host "Troubleshooting:"
    Write-Host "1. Ensure PostgreSQL is running:"
    Write-Host "   Get-Service -Name 'postgresql-x64-15' | Select-Object Status"
    Write-Host ""
    Write-Host "2. Check .env file has correct DATABASE_URL"
    Write-Host ""
    Write-Host "3. Check server/package.json has all dependencies installed"
    Write-Host ""
    Write-Host "4. Run: npm install (in server directory)"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Read-Host "Press Enter to exit"
