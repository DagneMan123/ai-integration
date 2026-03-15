@echo off
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              DATABASE RESET - CLEAR ALL DATA                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo WARNING: This will DELETE all data from the database!
echo.
echo This includes:
echo   - All users (candidates, employers, admins)
echo   - All jobs
echo   - All applications
echo   - All interviews
echo   - All payments
echo   - All companies
echo.
set /p confirm="Are you sure? Type 'yes' to continue: "

if /i not "%confirm%"=="yes" (
    echo.
    echo ❌ Database reset cancelled.
    echo.
    pause
    exit /b 0
)

echo.
echo 🔄 Resetting database...
echo.

cd server
node ..\reset-database.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database reset complete!
    echo.
    echo You can now:
    echo 1. Register new accounts
    echo 2. Create jobs
    echo 3. Apply for positions
    echo.
) else (
    echo.
    echo ❌ Database reset failed!
    echo.
)

pause
