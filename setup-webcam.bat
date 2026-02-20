@echo off
REM Complete setup for react-webcam installation

echo.
echo ========================================
echo React-Webcam Setup
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "client\package.json" (
    echo Error: client/package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Navigating to client directory...
cd client

echo Step 2: Installing react-webcam with legacy peer deps...
echo.
npm install react-webcam --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Installation failed!
    echo.
    echo Try these steps manually:
    echo 1. cd client
    echo 2. npm cache clean --force
    echo 3. npm install react-webcam --legacy-peer-deps
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Installing TypeScript types...
npm install --save-dev @types/react-webcam

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  TypeScript types installation had issues
    echo But react-webcam should still work
    echo.
)

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your development server: npm start
echo 2. The WebcamVerification component is now ready to use
echo 3. Check browser console for any remaining errors
echo.
echo Documentation: See INSTALL_REACT_WEBCAM.md
echo.

pause
