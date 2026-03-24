@echo off
REM Start all services for SimuAI Platform
REM This script starts: PostgreSQL, Backend Server, and Frontend Client

echo.
echo ========================================
echo   SimuAI Platform - Complete Startup
echo ========================================
echo.

REM Check if PostgreSQL is running
echo [1/3] Checking PostgreSQL...
tasklist /FI "IMAGENAME eq postgres.exe" 2>NUL | find /I /N "postgres.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ PostgreSQL is already running
) else (
    echo ⚠ PostgreSQL is NOT running
    echo Please start PostgreSQL manually:
    echo   - Open Services (services.msc)
    echo   - Find "postgresql-x64-15" or similar
    echo   - Right-click and select "Start"
    echo.
    pause
)

REM Start Backend Server
echo.
echo [2/3] Starting Backend Server (Port 5000)...
echo.
cd server
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak

REM Start Frontend Client
echo.
echo [3/3] Starting Frontend Client (Port 3000)...
echo.
cd ..\client
start "Frontend Client" cmd /k "npm run dev"
timeout /t 3 /nobreak

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause
