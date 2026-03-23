@echo off
REM PostgreSQL Startup Script for Windows
REM This script starts PostgreSQL service and verifies the connection

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         PostgreSQL Startup Script                             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERROR: This script must be run as Administrator
    echo.
    echo Please:
    echo 1. Right-click this file
    echo 2. Select "Run as Administrator"
    pause
    exit /b 1
)

echo ✓ Running as Administrator
echo.

REM Try to start PostgreSQL service
echo Attempting to start PostgreSQL service...
echo.

REM Try version 16 first
echo [1/4] Trying PostgreSQL 16...
net start postgresql-x64-16 >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ PostgreSQL 16 started successfully
    goto :verify
)

REM Try version 15
echo [2/4] Trying PostgreSQL 15...
net start postgresql-x64-15 >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ PostgreSQL 15 started successfully
    goto :verify
)

REM Try version 14
echo [3/4] Trying PostgreSQL 14...
net start postgresql-x64-14 >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ PostgreSQL 14 started successfully
    goto :verify
)

REM Try version 13
echo [4/4] Trying PostgreSQL 13...
net start postgresql-x64-13 >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ PostgreSQL 13 started successfully
    goto :verify
)

echo.
echo ❌ Could not start PostgreSQL service
echo.
echo Possible solutions:
echo 1. PostgreSQL might already be running
echo 2. Check the exact service name:
echo    - Open Services (services.msc)
echo    - Look for "PostgreSQL" service
echo    - Note the exact name
echo.
echo 3. Or try manual start:
echo    - Open Command Prompt as Administrator
echo    - Run: net start [service-name]
echo.
pause
exit /b 1

:verify
echo.
echo Waiting for PostgreSQL to start...
timeout /t 2 /nobreak
echo.

REM Verify connection
echo Verifying database connection...
echo.

cd /d "%~dp0server" 2>nul
if %errorLevel% neq 0 (
    echo ⚠️  Could not navigate to server directory
    echo Please ensure you're running this from the project root
    pause
    exit /b 1
)

REM Test connection using Node.js
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.$connect().then(() => { console.log('✅ Database connection successful!'); console.log(''); console.log('Database Details:'); console.log('  Host: localhost'); console.log('  Port: 5432'); console.log('  Database: simuai_db'); console.log('  User: postgres'); process.exit(0); }).catch(e => { console.log('❌ Connection failed:', e.message); process.exit(1); })" 2>nul

if %errorLevel% neq 0 (
    echo.
    echo ⚠️  Could not verify connection
    echo This might be because:
    echo 1. Node.js is not installed
    echo 2. Prisma dependencies are not installed
    echo 3. Database doesn't exist yet
    echo.
    echo Try running: npm install
    echo Then: npx prisma migrate dev
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ PostgreSQL is running and database is accessible!         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Open a new Command Prompt
echo 2. Navigate to the server folder: cd server
echo 3. Start the server: npm run dev
echo.
echo In another terminal:
echo 1. Navigate to the client folder: cd client
echo 2. Start the client: npm run dev
echo.
pause
