@echo off
REM Install react-webcam with legacy peer deps flag

echo.
echo ========================================
echo Installing react-webcam...
echo ========================================
echo.

cd client

echo Running: npm install react-webcam --legacy-peer-deps
npm install react-webcam --legacy-peer-deps

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ react-webcam installed successfully!
    echo ========================================
    echo.
    echo You can now use WebcamVerification component
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ Installation failed
    echo ========================================
    echo.
    echo Try running manually:
    echo cd client
    echo npm install react-webcam --legacy-peer-deps
    echo.
)

pause
