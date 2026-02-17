@echo off
echo ========================================
echo Cleaning Up Old Dependencies
echo ========================================
echo.
echo Removing Sequelize and unused packages...
echo.

cd server

echo Removing node_modules...
rmdir /s /q node_modules 2>nul

echo Removing package-lock.json...
del package-lock.json 2>nul

echo.
echo Installing clean dependencies...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Dependencies cleaned and reinstalled successfully
    echo.
    echo The deprecation warning should be gone now.
) else (
    echo.
    echo ❌ Failed to install dependencies
)

echo.
pause
