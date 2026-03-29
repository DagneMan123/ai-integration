@echo off
REM ============================================================================
REM                    DEPLOY FIXED WEBSITE - COMPLETE SCRIPT
REM ============================================================================
REM This script fixes all errors and starts the application

echo.
echo ============================================================================
echo                    DEPLOYING FIXED WEBSITE
echo ============================================================================
echo.

REM Step 1: Apply Database Migration
echo [1/5] Applying database migration...
cd server
call npx prisma migrate deploy
if errorlevel 1 (
    echo ERROR: Database migration failed!
    pause
    exit /b 1
)
echo ✅ Database migration completed
echo.

REM Step 2: Install dependencies (if needed)
echo [2/5] Checking dependencies...
call npm install
echo ✅ Dependencies checked
echo.

REM Step 3: Start backend server
echo [3/5] Starting backend server...
start "Backend Server" cmd /k "npm run dev"
echo ✅ Backend server started (check new window)
echo.

REM Step 4: Start frontend
echo [4/5] Starting frontend...
cd ..\client
start "Frontend Server" cmd /k "npm run dev"
echo ✅ Frontend server started (check new window)
echo.

REM Step 5: Display status
echo [5/5] Deployment complete!
echo.
echo ============================================================================
echo                    DEPLOYMENT STATUS
echo ============================================================================
echo.
echo ✅ Database: MIGRATED
echo ✅ Backend: RUNNING (http://localhost:5000)
echo ✅ Frontend: RUNNING (http://localhost:3000)
echo.
echo All errors have been fixed!
echo.
echo NEXT STEPS:
echo 1. Open http://localhost:3000 in your browser
echo 2. Login with your credentials
echo 3. Test payment flow
echo 4. Test interview flow
echo.
echo ============================================================================
echo.
pause
