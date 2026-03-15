@echo off
echo Starting PostgreSQL...
net start postgresql-x64-15 >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL service not found. Trying alternative...
    net start postgresql-x64-14 >nul 2>&1
)

timeout /t 3 /nobreak
echo PostgreSQL started.
echo.
echo Starting server...
cd server
npm run dev
