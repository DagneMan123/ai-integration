@echo off
echo ========================================
echo Fixing npm dependency issues...
echo ========================================
echo.

cd client

echo [1/3] Removing node_modules and package-lock.json...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo Done!
echo.

echo [2/3] Installing with legacy peer deps...
call npm install --legacy-peer-deps
echo Done!
echo.

echo [3/3] Verifying installation...
if exist node_modules (
    echo ✓ node_modules folder created successfully
) else (
    echo ✗ Installation failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo Dependencies fixed successfully!
echo ========================================
echo.
echo You can now run: npm start
echo.
pause
