@echo off
echo ========================================
echo SimuAI - Automated Installation Script
echo ========================================
echo.

echo [1/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Root installation failed
    pause
    exit /b %errorlevel%
)
echo ✓ Root dependencies installed
echo.

echo [2/4] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server installation failed
    pause
    exit /b %errorlevel%
)
cd ..
echo ✓ Server dependencies installed
echo.

echo [3/4] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Client installation failed
    pause
    exit /b %errorlevel%
)
cd ..
echo ✓ Client dependencies installed
echo.

echo [4/4] Checking environment files...
if not exist "server\.env" (
    echo ⚠ WARNING: server\.env not found
    echo Please create server\.env file with required variables
    echo See server\.env.example for reference
) else (
    echo ✓ server\.env found
)

if not exist "client\.env" (
    echo ⚠ WARNING: client\.env not found
    echo Please create client\.env with: REACT_APP_API_URL=http://localhost:5000/api
) else (
    echo ✓ client\.env found
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running: net start MongoDB
echo 2. Create .env files if not exists (see INSTALL_AND_FIX.md)
echo 3. Run: npm run dev
echo.
pause
