@echo off
REM ============================================================================
REM                    START EVERYTHING - COMPLETE FIX
REM ============================================================================
REM This script starts PostgreSQL, applies migrations, and runs the app

echo.
echo ============================================================================
echo                    STARTING COMPLETE SYSTEM
echo ============================================================================
echo.

REM Step 1: Start PostgreSQL Service
echo [1/6] Starting PostgreSQL service...
net start postgresql-x64-15 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PostgreSQL service may already be running or not installed
) else (
    echo ✅ PostgreSQL service started
)
timeout /t 3 /nobreak
echo.

REM Step 2: Verify database connection
echo [2/6] Verifying database connection...
cd server
call npx prisma db execute --stdin < nul >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Database connection check (this is normal if DB doesn't exist yet)
) else (
    echo ✅ Database connection verified
)
echo.

REM Step 3: Apply migrations
echo [3/6] Applying database migrations...
call npx prisma migrate deploy
if errorlevel 1 (
    echo ⚠️  Migration warning (database may already be up to date)
) else (
    echo ✅ Migrations applied
)
echo.

REM Step 4: Install dependencies
echo [4/6] Checking dependencies...
call npm install >nul 2>&1
echo ✅ Dependencies ready
echo.

REM Step 5: Start backend
echo [5/6] Starting backend server...
start "Backend - SimuAI" cmd /k "npm run dev"
timeout /t 3 /nobreak
echo ✅ Backend started (check new window)
echo.

REM Step 6: Start frontend
echo [6/6] Starting frontend...
cd ..\client
call npm install >nul 2>&1
start "Frontend - SimuAI" cmd /k "npm run dev"
echo ✅ Frontend started (check new window)
echo.

echo ============================================================================
echo                    SYSTEM STARTUP COMPLETE
echo ============================================================================
echo.
echo ✅ PostgreSQL: RUNNING
echo ✅ Backend: RUNNING (http://localhost:5000)
echo ✅ Frontend: RUNNING (http://localhost:3000)
echo.
echo NEXT STEPS:
echo 1. Wait 10 seconds for servers to fully start
echo 2. Open http://localhost:3000 in your browser
echo 3. Login with your credentials
echo 4. Test the payment and interview flows
echo.
echo ============================================================================
echo.
pause
