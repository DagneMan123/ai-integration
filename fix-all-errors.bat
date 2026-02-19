@echo off
echo ========================================
echo SimuAI Platform - Complete Fix Script
echo ========================================
echo.

echo This script will:
echo 1. Check PostgreSQL status
echo 2. Update database schema
echo 3. Install missing dependencies
echo 4. Start the application
echo.
pause

echo.
echo ========================================
echo Step 1: Checking PostgreSQL...
echo ========================================
echo.

REM Check if PostgreSQL is running
sc query postgresql-x64-16 | find "RUNNING" > nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is running
) else (
    echo ❌ PostgreSQL is NOT running
    echo.
    echo Starting PostgreSQL service...
    net start postgresql-x64-16
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Failed to start PostgreSQL
        echo.
        echo Please start PostgreSQL manually:
        echo 1. Open Services (services.msc)
        echo 2. Find "postgresql-x64-16" service
        echo 3. Right-click and select "Start"
        echo.
        echo Or run: net start postgresql-x64-16
        echo.
        pause
        exit /b 1
    )
    echo ✅ PostgreSQL started successfully
)

echo.
echo ========================================
echo Step 2: Updating Database Schema...
echo ========================================
echo.

cd server
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo ❌ Database update failed
    echo.
    echo Please check:
    echo 1. PostgreSQL is running
    echo 2. DATABASE_URL in server/.env is correct
    echo 3. Database "simuai" exists
    echo.
    pause
    exit /b 1
)

echo.
echo Regenerating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma generate failed
    pause
    exit /b 1
)

echo ✅ Database schema updated successfully

echo.
echo ========================================
echo Step 3: Installing Dependencies...
echo ========================================
echo.

echo Checking client dependencies...
cd ..\client
if not exist "node_modules\react-webcam" (
    echo Installing react-webcam...
    call npm install react-webcam --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Failed to install react-webcam
        pause
        exit /b 1
    )
    echo ✅ react-webcam installed
) else (
    echo ✅ react-webcam already installed
)

cd ..

echo.
echo ========================================
echo Step 4: Starting Application...
echo ========================================
echo.

echo Starting Backend Server...
start cmd /k "cd server && npm start"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
start cmd /k "cd client && npm start"

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Two terminal windows have been opened:
echo 1. Backend Server (Port 5000)
echo 2. Frontend Server (Port 3000)
echo.
echo The application will open automatically in your browser.
echo.
echo If you see any errors:
echo - Check the terminal windows for error messages
echo - Make sure PostgreSQL is running
echo - Check server/.env configuration
echo.
echo Press any key to close this window...
pause > nul
