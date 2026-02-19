@echo off
echo ========================================
echo Installing react-webcam
echo ========================================
echo.

echo Installing with legacy peer deps flag...
cd client
call npm install react-webcam --legacy-peer-deps

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! react-webcam installed.
    echo ========================================
    echo.
    echo The package has been installed successfully.
    echo.
    echo Now restart the frontend:
    echo   cd client
    echo   npm start
    echo.
    echo The webcam warning should be gone!
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
