@echo off
echo ========================================
echo Updating Database Schema
echo ========================================
echo.

cd server

echo Step 1: Generating Prisma Client...
call npx prisma generate

echo.
echo Step 2: Pushing schema to database...
call npx prisma db push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database schema updated successfully!
    echo.
    echo You can now restart the server:
    echo   npm run dev
) else (
    echo.
    echo ❌ Failed to update database schema
    echo.
    echo Make sure PostgreSQL is running:
    echo   net start postgresql-x64-16
)

echo.
pause
