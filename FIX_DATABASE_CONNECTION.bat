@echo off
REM ============================================================================
REM PostgreSQL Connection Fix - Windows
REM ============================================================================

echo.
echo ============================================================================
echo                    FIXING DATABASE CONNECTION
echo ============================================================================
echo.

REM Check if PostgreSQL service exists
echo Checking PostgreSQL service status...
sc query postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service found
    echo.
    echo Starting PostgreSQL service...
    net start postgresql-x64-15
    if %errorlevel% equ 0 (
        echo ✓ PostgreSQL started successfully
    ) else (
        echo ✗ Failed to start PostgreSQL
        echo.
        echo Trying alternative service name...
        net start postgresql-x64-14
        if %errorlevel% equ 0 (
            echo ✓ PostgreSQL (v14) started successfully
        ) else (
            echo ✗ Could not start PostgreSQL
            echo.
            echo SOLUTION: Start PostgreSQL manually
            echo 1. Open Services (services.msc)
            echo 2. Find "postgresql-x64-XX" service
            echo 3. Right-click and select "Start"
            echo.
            pause
            exit /b 1
        )
    )
) else (
    echo ✗ PostgreSQL service not found
    echo.
    echo SOLUTION: Install PostgreSQL or start it manually
    echo 1. Download PostgreSQL from https://www.postgresql.org/download/windows/
    echo 2. Install with default settings
    echo 3. Or start PostgreSQL manually if already installed
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo                    VERIFYING CONNECTION
echo ============================================================================
echo.

REM Wait for service to start
timeout /t 3 /nobreak

REM Try to connect to PostgreSQL
echo Attempting to connect to PostgreSQL at localhost:5432...
echo.

REM Create a test connection script
(
    echo SELECT 1;
) > test_connection.sql

REM Try psql connection (if available)
psql -U postgres -h localhost -p 5432 -f test_connection.sql >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Successfully connected to PostgreSQL!
    echo.
    echo Database connection is working.
    echo You can now start the server with: npm run dev
) else (
    echo ✗ Could not connect to PostgreSQL
    echo.
    echo TROUBLESHOOTING:
    echo 1. Verify PostgreSQL is running (check Services)
    echo 2. Verify port 5432 is not blocked
    echo 3. Check DATABASE_URL in .env file
    echo 4. Verify database credentials
    echo.
    echo Current DATABASE_URL in .env:
    findstr "DATABASE_URL" server\.env
    echo.
)

REM Cleanup
del test_connection.sql >nul 2>&1

echo.
echo ============================================================================
echo                    NEXT STEPS
echo ============================================================================
echo.
echo 1. If connection successful:
echo    - Open new terminal
echo    - Run: cd server
echo    - Run: npm run dev
echo.
echo 2. If connection failed:
echo    - Check PostgreSQL is running in Services
echo    - Verify database credentials in .env
echo    - Check port 5432 is available
echo.
echo ============================================================================
echo.

pause
