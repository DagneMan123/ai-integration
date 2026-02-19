@echo off
echo ========================================
echo Fixing react-webcam Warning
echo ========================================
echo.

echo Installing react-webcam package with legacy peer deps...
cd client
call npm install react-webcam --legacy-peer-deps

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Package installed.
    echo ========================================
    echo.
    echo The warning should be gone now.
    echo Please restart the frontend:
    echo.
    echo   cd client
    echo   npm start
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Installation failed
    echo ========================================
    echo.
    echo Please try manually:
    echo   cd client
    echo   npm install react-webcam --legacy-peer-deps
    echo.
)

pause
