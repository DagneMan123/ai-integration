@echo off
echo ========================================
echo Installing Server Dependencies
echo ========================================

cd /d "%~dp0"

echo.
echo Installing npm packages...
call npm install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run:
echo   npm run dev    - Start development server
echo   npm start      - Start production server
echo.
pause
