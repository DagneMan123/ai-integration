@echo off
echo ========================================
echo Starting PostgreSQL and Application
echo ========================================

REM Start PostgreSQL
echo.
echo [1/3] Starting PostgreSQL...
call start-postgres-now.bat

REM Wait for PostgreSQL to start
timeout /t 3 /nobreak

REM Start Server
echo.
echo [2/3] Starting Server (port 5000)...
start cmd /k "cd server && npm run dev"

REM Wait for server to start
timeout /t 5 /nobreak

REM Start Client
echo.
echo [3/3] Starting Client (port 3000)...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo ========================================
pause
