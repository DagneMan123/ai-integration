@echo off
REM Start PostgreSQL Service
echo Starting PostgreSQL Service...
net start postgresql-x64-15

REM Wait for PostgreSQL to start
timeout /t 3 /nobreak

REM Navigate to server directory
cd server

REM Start backend
echo Starting Backend Server...
npm run dev

pause
