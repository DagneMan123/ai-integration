@echo off
REM Start PostgreSQL Service on Windows

echo Starting PostgreSQL Database Service...
echo.

REM Try to start PostgreSQL service
net start postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service started successfully!
    echo.
    echo Waiting for database to be ready...
    timeout /t 3 /nobreak
    echo.
    echo You can now start your Node.js server with: npm run dev
    pause
    exit /b 0
)

REM If version 15 not found, try version 14
net start postgresql-x64-14 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service started successfully!
    echo.
    echo Waiting for database to be ready...
    timeout /t 3 /nobreak
    echo.
    echo You can now start your Node.js server with: npm run dev
    pause
    exit /b 0
)

REM If version 14 not found, try version 13
net start postgresql-x64-13 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service started successfully!
    echo.
    echo Waiting for database to be ready...
    timeout /t 3 /nobreak
    echo.
    echo You can now start your Node.js server with: npm run dev
    pause
    exit /b 0
)

REM If all versions failed
echo.
echo ✗ ERROR: Could not start PostgreSQL service
echo.
echo Possible solutions:
echo 1. PostgreSQL might not be installed
echo 2. Service name might be different
echo 3. You might need to run this as Administrator
echo.
echo To check installed PostgreSQL services, run:
echo   Get-Service ^| Where-Object {$_.Name -like "*postgres*"}
echo.
pause
exit /b 1
