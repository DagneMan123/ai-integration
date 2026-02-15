@echo off
echo ========================================
echo Complete Fix for SimuAI Client
echo ========================================
echo.

cd client

echo [1/4] Cleaning up old installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
echo Done!
echo.

echo [2/4] Clearing npm cache...
call npm cache clean --force
echo Done!
echo.

echo [3/4] Installing dependencies (this may take 3-5 minutes)...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Installation failed!
    echo Trying alternative method...
    echo.
    call npm install --force
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Both installation methods failed!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
)
echo Done!
echo.

echo [4/4] Verifying installation...
if exist node_modules\react-scripts (
    echo ✓ react-scripts installed successfully
) else (
    echo ✗ react-scripts not found
    echo Trying to install react-scripts separately...
    call npm install react-scripts --legacy-peer-deps
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run: npm start
echo.
pause
