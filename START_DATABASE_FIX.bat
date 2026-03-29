@echo off
REM ============================================================================
REM COMPLETE DATABASE FIX - WINDOWS
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo                    STARTING POSTGRESQL DATABASE
echo ============================================================================
echo.

REM Try to start PostgreSQL service
echo [1/5] Checking PostgreSQL service...
sc query postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL 15 found
    echo [2/5] Starting PostgreSQL 15...
    net start postgresql-x64-15 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ PostgreSQL 15 started
        goto :verify
    )
)

REM Try PostgreSQL 14
sc query postgresql-x64-14 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL 14 found
    echo [2/5] Starting PostgreSQL 14...
    net start postgresql-x64-14 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ PostgreSQL 14 started
        goto :verify
    )
)

REM Try PostgreSQL 13
sc query postgresql-x64-13 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL 13 found
    echo [2/5] Starting PostgreSQL 13...
    net start postgresql-x64-13 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ PostgreSQL 13 started
        goto :verify
    )
)

echo ✗ PostgreSQL service not found or failed to start
echo.
echo SOLUTION:
echo 1. Open Services (services.msc)
echo 2. Find "postgresql-x64-XX" service
echo 3. Right-click and select "Start"
echo 4. Wait 30 seconds
echo 5. Run this script again
echo.
pause
exit /b 1

:verify
echo.
echo [3/5] Waiting for PostgreSQL to start...
timeout /t 3 /nobreak

echo [4/5] Verifying connection...
REM Check if port 5432 is listening
netstat -ano | findstr :5432 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL is listening on port 5432
) else (
    echo ✗ PostgreSQL not responding on port 5432
    echo Waiting longer...
    timeout /t 5 /nobreak
)

echo [5/5] Testing database connection...
REM Try to connect
psql -U postgres -h localhost -p 5432 -c "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Successfully connected to PostgreSQL!
    echo.
    echo ============================================================================
    echo                    DATABASE IS READY
    echo ============================================================================
    echo.
    echo You can now start the server:
    echo   cd server
    echo   npm run dev
    echo.
    echo In another terminal, start the client:
    echo   cd client
    echo   npm start
    echo.
    echo ============================================================================
    echo.
    pause
    exit /b 0
) else (
    echo ✗ Could not connect to PostgreSQL
    echo.
    echo TROUBLESHOOTING:
    echo 1. Check if PostgreSQL is running in Services
    echo 2. Verify credentials: postgres / MYlove8
    echo 3. Check port 5432 is not blocked
    echo.
    pause
    exit /b 1
)
