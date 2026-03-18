@echo off
echo.
echo ========================================
echo Setting up Message System
echo ========================================
echo.

echo Step 1: Regenerating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to regenerate Prisma Client
    pause
    exit /b 1
)
echo ✅ Prisma Client regenerated

echo.
echo Step 2: Running database migration...
call npx prisma migrate dev --name add_messages
if errorlevel 1 (
    echo ❌ Failed to run migration
    pause
    exit /b 1
)
echo ✅ Database migration completed

echo.
echo ========================================
echo ✅ Message system setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your server (npm run dev)
echo 2. Navigate to /employer/messages
echo 3. Messages should now work!
echo.
pause
