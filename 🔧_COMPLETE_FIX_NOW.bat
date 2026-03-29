@echo off
REM ============================================================================
REM COMPLETE SYSTEM FIX - ONE COMMAND
REM ============================================================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================================
echo                    COMPLETE SYSTEM FIX
echo ============================================================================
echo.
echo This script will:
echo   1. Start PostgreSQL database
echo   2. Verify database connection
echo   3. Start backend server
echo   4. Start frontend client
echo.
echo ============================================================================
echo.

REM STEP 1: Start PostgreSQL
echo [STEP 1/4] Starting PostgreSQL Database...
echo.

net start postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL 15 started
    goto :db_started
)

net start postgresql-x64-14 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL 14 started
    goto :db_started
)

net start postgresql-x64-13 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL 13 started
    goto :db_started
)

echo ✗ PostgreSQL not found or failed to start
echo.
echo MANUAL FIX:
echo 1. Open Services: Press Windows Key + R, type services.msc
echo 2. Find "postgresql-x64-XX" service
echo 3. Right-click and select "Start"
echo 4. Wait 30 seconds
echo 5. Run this script again
echo.
pause
exit /b 1

:db_started
echo.
timeout /t 3 /nobreak

REM STEP 2: Verify Connection
echo.
echo [STEP 2/4] Verifying Database Connection...
echo.

psql -U postgres -h localhost -p 5432 -c "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Database connection verified
) else (
    echo ✗ Database connection failed
    echo Waiting longer...
    timeout /t 5 /nobreak
    psql -U postgres -h localhost -p 5432 -c "SELECT 1;" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ✗ Still cannot connect to database
        echo.
        echo TROUBLESHOOTING:
        echo 1. Check PostgreSQL is running in Services
        echo 2. Verify credentials: postgres / MYlove8
        echo 3. Check port 5432 is available
        echo.
        pause
        exit /b 1
    )
)

echo.

REM STEP 3: Start Backend
echo [STEP 3/4] Starting Backend Server...
echo.
echo Opening new terminal for backend...
echo.

start cmd /k "cd /d %cd%\server && npm run dev"

timeout /t 5 /nobreak

REM STEP 4: Start Frontend
echo.
echo [STEP 4/4] Starting Frontend Client...
echo.
echo Opening new terminal for frontend...
echo.

start cmd /k "cd /d %cd%\client && npm start"

echo.
echo ============================================================================
echo                    SYSTEM STARTED
echo ============================================================================
echo.
echo ✓ PostgreSQL Database: Running
echo ✓ Backend Server: Starting (check terminal)
echo ✓ Frontend Client: Starting (check terminal)
echo.
echo NEXT STEPS:
echo 1. Wait for both terminals to show "ready" messages
echo 2. Browser should open to http://localhost:3000
echo 3. Login to dashboard
echo 4. Go to "My Interviews"
echo 5. Click "Start AI Interview"
echo 6. Test payment flow
echo.
echo ============================================================================
echo.

pause
