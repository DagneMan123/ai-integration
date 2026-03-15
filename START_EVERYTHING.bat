@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          SIMUAI - COMPLETE STARTUP SCRIPT                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo.
    echo Please:
    echo 1. Right-click this file
    echo 2. Select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo [STEP 1] Starting PostgreSQL Service...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Try PostgreSQL 16
echo Attempting PostgreSQL 16...
net start postgresql-x64-16 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 16 started successfully
    goto :postgres_started
)

REM Try PostgreSQL 15
echo Attempting PostgreSQL 15...
net start postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 15 started successfully
    goto :postgres_started
)

REM Try PostgreSQL 14
echo Attempting PostgreSQL 14...
net start postgresql-x64-14 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 14 started successfully
    goto :postgres_started
)

REM Try PostgreSQL 13
echo Attempting PostgreSQL 13...
net start postgresql-x64-13 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 13 started successfully
    goto :postgres_started
)

echo.
echo ❌ ERROR: Could not start PostgreSQL
echo.
echo Available PostgreSQL services:
sc query | findstr postgresql
echo.
echo Please ensure PostgreSQL is installed and try again.
pause
exit /b 1

:postgres_started
echo.
echo Waiting 3 seconds for PostgreSQL to fully start...
timeout /t 3 /nobreak

echo.
echo [STEP 2] Testing Database Connection...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd server
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.$connect().then(() => {console.log('✅ Database connection successful!'); process.exit(0);}).catch(e => {console.log('❌ Connection failed:', e.message); process.exit(1);})" >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ Database connection failed
    echo.
    echo Troubleshooting:
    echo - Ensure PostgreSQL service is running
    echo - Check if database 'simuai_db' exists
    echo - Verify credentials in server/.env
    echo.
    pause
    exit /b 1
)

echo ✅ Database connection successful!

echo.
echo [STEP 3] Starting Server...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Server starting on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
