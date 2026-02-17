@echo off
echo ========================================
echo Creating SimuAI Database
echo ========================================
echo.
echo This will create the 'simuai_db' database
echo Password: MYlove8
echo.

psql -U postgres -c "CREATE DATABASE simuai_db;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database created successfully
) else (
    echo.
    echo ⚠️  Database might already exist or PostgreSQL is not running
)

echo.
echo ========================================
echo Setting up Database Tables
echo ========================================
echo.

cd server
call npx prisma db push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database tables created successfully
    echo.
    echo You can now start the server with: npm run dev
) else (
    echo.
    echo ❌ Failed to create tables
    echo Make sure PostgreSQL is running
)

echo.
pause
