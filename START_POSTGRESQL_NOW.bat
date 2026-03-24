@echo off
REM Start PostgreSQL Service on Windows

echo.
echo ========================================
echo   Starting PostgreSQL Database
echo ========================================
echo.

REM Check if PostgreSQL is already running
tasklist /FI "IMAGENAME eq postgres.exe" 2>NUL | find /I /N "postgres.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ PostgreSQL is already running
    echo.
    pause
    exit /b 0
)

REM Try to start PostgreSQL service
echo Starting PostgreSQL service...
net start postgresql-x64-15 >nul 2>&1

if "%ERRORLEVEL%"=="0" (
    echo ✓ PostgreSQL service started successfully
    echo.
    echo Waiting for database to be ready...
    timeout /t 3 /nobreak
    echo.
    echo ✓ PostgreSQL is now running on port 5432
    echo.
    echo Next steps:
    echo 1. Open a new terminal
    echo 2. Run: cd server
    echo 3. Run: npm run dev
    echo.
    pause
) else (
    echo ✗ Failed to start PostgreSQL service
    echo.
    echo Try these alternatives:
    echo 1. Open Services (services.msc)
    echo 2. Find "postgresql-x64-15" or similar
    echo 3. Right-click and select "Start"
    echo.
    echo Or use pgAdmin to start the service
    echo.
    pause
)
