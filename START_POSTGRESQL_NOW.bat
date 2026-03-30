@echo off
REM Start PostgreSQL Service
REM This script starts the PostgreSQL database service on Windows

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo                    Starting PostgreSQL Service...
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Please:
    echo 1. Right-click on this file
    echo 2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Start PostgreSQL service
echo Starting PostgreSQL service (postgresql-x64-15)...
net start postgresql-x64-15

if %errorLevel% equ 0 (
    echo.
    echo ✅ PostgreSQL started successfully!
    echo.
    echo The backend will automatically reconnect to the database.
    echo.
    echo Wait for: "Database connection established successfully via Prisma."
    echo.
) else (
    echo.
    echo ⚠️ PostgreSQL may already be running or there was an error.
    echo.
    echo Checking service status...
    sc query postgresql-x64-15
    echo.
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo                    Done!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

pause
