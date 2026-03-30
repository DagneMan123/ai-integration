@echo off
REM ============================================================================
REM PostgreSQL and Backend Startup Script for Windows
REM ============================================================================
REM This script will:
REM 1. Check if PostgreSQL service is running
REM 2. Start PostgreSQL if not running
REM 3. Wait for PostgreSQL to be ready
REM 4. Start the backend server
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  PostgreSQL and Backend Startup Script
echo ============================================================================
echo.

REM Check if PostgreSQL service exists
echo [1/4] Checking PostgreSQL service...
sc query "postgresql-x64-15" >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL service not found. Please install PostgreSQL first.
    echo.
    echo Installation guide: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
echo [2/4] Checking if PostgreSQL is running...
sc query "postgresql-x64-15" | find "RUNNING" >nul 2>&1
if errorlevel 1 (
    echo ⏳ PostgreSQL is not running. Starting service...
    net start "postgresql-x64-15"
    if errorlevel 1 (
        echo ❌ Failed to start PostgreSQL service.
        echo Please start it manually: Services (services.msc) ^> postgresql-x64-15 ^> Start
        pause
        exit /b 1
    )
    echo ✅ PostgreSQL service started.
    
    REM Wait for PostgreSQL to be ready
    echo ⏳ Waiting for PostgreSQL to be ready (10 seconds)...
    timeout /t 10 /nobreak
) else (
    echo ✅ PostgreSQL is already running.
)

REM Verify database connection
echo [3/4] Verifying database connection...
REM Try to connect using psql (if available)
where psql >nul 2>&1
if errorlevel 1 (
    echo ⚠️  psql not found in PATH. Skipping connection verification.
    echo    (This is OK - the backend will verify the connection)
) else (
    echo ✅ psql found. Connection will be verified by backend.
)

REM Start the backend
echo [4/4] Starting backend server...
echo.
echo ============================================================================
cd /d "%~dp0server"
if errorlevel 1 (
    echo ❌ Failed to change to server directory.
    pause
    exit /b 1
)

echo Starting: npm run dev
echo ============================================================================
echo.
npm run dev

if errorlevel 1 (
    echo.
    echo ❌ Backend failed to start.
    echo.
    echo Troubleshooting:
    echo 1. Ensure PostgreSQL is running: Get-Service -Name "postgresql-x64-15"
    echo 2. Check .env file has correct DATABASE_URL
    echo 3. Check server/package.json has all dependencies installed
    echo 4. Run: npm install (in server directory)
    echo.
    pause
    exit /b 1
)

pause
