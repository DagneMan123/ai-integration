@echo off
echo ========================================
echo Fixing Prisma Cache Permission Error
echo ========================================
echo.

cd server

echo Clearing Prisma cache...
rmdir /s /q node_modules\.prisma 2>nul

echo Regenerating Prisma client...
npx prisma generate

echo.
echo Cache cleared and regenerated!
echo You can now run: npm run dev
echo.
pause
