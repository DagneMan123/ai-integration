@echo off
echo.
echo ========================================
echo Starting PostgreSQL Service...
echo ========================================
echo.

REM Try to start PostgreSQL service
echo Attempting to start PostgreSQL...
net start postgresql-x64-16 >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ PostgreSQL service started successfully
    echo.
    echo Waiting for database to be ready...
    timeout /t 3 /nobreak
    echo.
    echo ✅ PostgreSQL is ready!
    echo.
    echo You can now run: npm run dev
    echo.
) else (
    echo.
    echo ⚠️  Could not start PostgreSQL service automatically
    echo.
    echo Please start PostgreSQL manually:
    echo.
    echo Option 1: Using Services (Recommended)
    echo   1. Press Windows + R
    echo   2. Type: services.msc
    echo   3. Find "postgresql-x64-16"
    echo   4. Right-click and select "Start"
    echo.
    echo Option 2: Using Command Prompt (Admin)
    echo   Run: net start postgresql-x64-16
    echo.
    echo Option 3: Using pgAdmin
    echo   1. Open pgAdmin
    echo   2. Right-click the server
    echo   3. Select "Connect"
    echo.
    pause
    exit /b 1
)

pause
