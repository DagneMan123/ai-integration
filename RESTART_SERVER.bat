@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              Restarting Server                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd server

echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting server...
npm run dev

pause
