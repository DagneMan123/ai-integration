@echo off
echo ========================================
echo Fixing 500 Error - Database Migration
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "server\package.json" (
  echo ERROR: Please run this from the root directory
  echo Current directory: %cd%
  pause
  exit /b 1
)

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak

echo.
echo [2/3] Running database migration...
cd server
echo Running: npx prisma migrate dev --name add_subscription_wallet_practice
npx prisma migrate dev --name add_subscription_wallet_practice

if errorlevel 1 (
  echo.
  echo ERROR: Migration failed!
  echo Try running: npx prisma db push
  pause
  exit /b 1
)

echo.
echo [3/3] Starting server...
npm run dev

pause
