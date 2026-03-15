@echo off
echo ========================================
echo Dashboard Verification Script
echo ========================================
echo.

echo Step 1: Checking if PostgreSQL is running...
tasklist | find /i "postgres" >nul
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL is running
) else (
    echo ✗ PostgreSQL is NOT running
    echo Starting PostgreSQL...
    net start PostgreSQL-x64-15
)

echo.
echo Step 2: Checking if Backend is running...
curl -s http://localhost:5000/health >nul
if %errorlevel% equ 0 (
    echo ✓ Backend is running
) else (
    echo ✗ Backend is NOT running
    echo Please start backend: cd server && npm run dev
)

echo.
echo Step 3: Checking if Frontend is running...
curl -s http://localhost:3000 >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend is running
) else (
    echo ✗ Frontend is NOT running
    echo Please start frontend: cd client && npm start
)

echo.
echo Step 4: Testing Dashboard API Endpoints...
echo.

echo Testing Candidate Dashboard...
curl -s http://localhost:5000/api/analytics/candidate/dashboard -H "Authorization: Bearer test" | find "success" >nul
if %errorlevel% equ 0 (
    echo ✓ Candidate Dashboard endpoint exists
) else (
    echo ✗ Candidate Dashboard endpoint error
)

echo.
echo Testing Employer Dashboard...
curl -s http://localhost:5000/api/analytics/employer/dashboard -H "Authorization: Bearer test" | find "success" >nul
if %errorlevel% equ 0 (
    echo ✓ Employer Dashboard endpoint exists
) else (
    echo ✗ Employer Dashboard endpoint error
)

echo.
echo Testing Admin Dashboard...
curl -s http://localhost:5000/api/analytics/admin/dashboard -H "Authorization: Bearer test" | find "success" >nul
if %errorlevel% equ 0 (
    echo ✓ Admin Dashboard endpoint exists
) else (
    echo ✗ Admin Dashboard endpoint error
)

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Open http://localhost:3000 in browser
echo 2. Login with your credentials
echo 3. Navigate to dashboard
echo 4. Open DevTools (F12) and check Network tab
echo 5. Look for /api/analytics/* requests
echo.
pause
