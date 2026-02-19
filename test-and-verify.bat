@echo off
REM Test and verify all job API fixes

echo.
echo ========================================
echo Testing Job API Fixes
echo ========================================
echo.

REM Check if server is running
echo Checking if backend is running on port 5000...
timeout /t 2 /nobreak > nul

REM Run the test script
echo.
echo Running API tests...
echo.
node test-job-api.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ All tests passed!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Start backend: cd server && npm start
    echo 2. Start frontend: cd client && npm start
    echo 3. Navigate to http://localhost:3000/jobs
    echo 4. Click on a job to verify no "undefined" errors
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ Some tests failed
    echo ========================================
    echo.
    echo Make sure backend is running on port 5000
    echo.
)

pause
