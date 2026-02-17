@echo off
echo ========================================
echo Starting PostgreSQL Service
echo ========================================
echo.

REM Try different PostgreSQL service names
net start postgresql-x64-16 2>nul
if %errorlevel% equ 0 goto success

net start postgresql-x64-15 2>nul
if %errorlevel% equ 0 goto success

net start postgresql-x64-14 2>nul
if %errorlevel% equ 0 goto success

net start postgresql-x64-13 2>nul
if %errorlevel% equ 0 goto success

echo.
echo ❌ Could not start PostgreSQL service
echo Please run this as Administrator or check service name
echo.
echo To check service name, run: sc query ^| findstr postgresql
echo.
pause
exit /b 1

:success
echo.
echo ✅ PostgreSQL service started successfully
echo.
echo ========================================
echo Setting up Database
echo ========================================
echo.

cd server

echo Creating database tables...
call npx prisma db push

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to create database tables
    echo Make sure database 'simuai_db' exists
    echo.
    echo To create database, run: psql -U postgres -c "CREATE DATABASE simuai_db;"
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database setup complete
echo.
echo ========================================
echo Starting Server
echo ========================================
echo.

call npm run dev
