@echo off
echo Starting PostgreSQL service...
echo.

REM Try to start PostgreSQL service
net start postgresql-x64-16 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service started successfully
    echo.
    echo Waiting for database to be ready...
    timeout /t 3 /nobreak
    echo.
    echo PostgreSQL is now running on localhost:5432
    echo You can now run: npm run dev
    pause
) else (
    echo.
    echo ✗ Failed to start PostgreSQL service
    echo.
    echo Possible solutions:
    echo 1. PostgreSQL might already be running
    echo 2. PostgreSQL might not be installed
    echo 3. Run this as Administrator
    echo.
    echo To check if PostgreSQL is running:
    echo   - Open Task Manager and look for "postgres.exe"
    echo   - Or run: netstat -ano ^| findstr :5432
    echo.
    pause
)
