@echo off
echo ========================================
echo Starting PostgreSQL Service...
echo ========================================

REM Try to start PostgreSQL service
echo.
echo Attempting to start PostgreSQL...
net start postgresql-x64-16

if %errorlevel% neq 0 (
    echo.
    echo PostgreSQL 16 not found, trying version 15...
    net start postgresql-x64-15
)

if %errorlevel% neq 0 (
    echo.
    echo PostgreSQL 15 not found, trying version 14...
    net start postgresql-x64-14
)

if %errorlevel% neq 0 (
    echo.
    echo PostgreSQL 14 not found, trying version 13...
    net start postgresql-x64-13
)

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not start PostgreSQL service
    echo.
    echo Checking available PostgreSQL services...
    sc query | findstr postgresql
    echo.
    echo Please ensure PostgreSQL is installed and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo PostgreSQL Service Started Successfully!
echo ========================================
echo.
echo Waiting 3 seconds for service to fully start...
timeout /t 3 /nobreak

echo.
echo Testing database connection...
cd server
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.$connect().then(() => console.log('✅ Database connection successful!')).catch(e => console.log('❌ Connection failed:', e.message))"

echo.
echo You can now run: npm run dev
echo.
pause
