@echo off
echo ========================================
echo SimuAI Server Fix Script
echo ========================================

cd /d "%~dp0\server"

echo.
echo Step 1: Cleaning node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo Node modules removed.
) else (
    echo No node_modules found.
)

echo.
echo Step 2: Cleaning package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo Package lock removed.
) else (
    echo No package-lock.json found.
)

echo.
echo Step 3: Installing dependencies...
call npm install

echo.
echo Step 4: Verifying installation...
call npm list --depth=0

echo.
echo ========================================
echo Server Fix Complete!
echo ========================================
echo.
echo You can now run:
echo   cd server
echo   npm run dev
echo.
pause
