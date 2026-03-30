@echo off
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         STARTING POSTGRESQL DATABASE SERVICE                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if PostgreSQL service exists
sc query postgresql-x64-15 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL service not found!
    echo.
    echo Trying alternative service names...
    sc query postgresql >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ PostgreSQL service not installed or not found
        echo.
        echo Please install PostgreSQL or check the service name
        pause
        exit /b 1
    )
    set SERVICE_NAME=postgresql
) else (
    set SERVICE_NAME=postgresql-x64-15
)

echo Starting service: %SERVICE_NAME%
net start %SERVICE_NAME%

if %errorlevel% equ 0 (
    echo.
    echo ✅ PostgreSQL started successfully!
    echo.
    echo Database is running on: localhost:5432
    echo.
    echo You can now:
    echo 1. Start the backend: npm run dev (in server directory)
    echo 2. Start the frontend: npm run dev (in client directory)
    echo.
) else (
    echo.
    echo ❌ Failed to start PostgreSQL
    echo.
    echo Try these alternatives:
    echo 1. Open Services app (services.msc) and start PostgreSQL manually
    echo 2. Check if PostgreSQL is installed
    echo 3. Check PostgreSQL logs for errors
    echo.
)

pause
