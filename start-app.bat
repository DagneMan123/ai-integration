@echo off
echo ========================================
echo Starting SimuAI Platform
echo ========================================
echo.

echo Checking if dependencies are installed...
echo.

REM Check if node_modules exists in server
if not exist "server\node_modules\" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
    echo.
)

REM Check if node_modules exists in client
if not exist "client\node_modules\" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
    echo.
)

echo ========================================
echo Starting Backend Server...
echo ========================================
echo.
start cmd /k "cd server && npm start"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo ========================================
echo Starting Frontend...
echo ========================================
echo.
start cmd /k "cd client && npm start"

echo.
echo ========================================
echo Application Starting!
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Two new terminal windows will open:
echo 1. Backend Server (keep this running)
echo 2. Frontend Server (keep this running)
echo.
echo Press any key to close this window...
pause > nul
