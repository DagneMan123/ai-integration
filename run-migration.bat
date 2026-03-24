@echo off
echo ========================================
echo Running Prisma Migration
echo ========================================
cd server
echo.
echo Creating migration...
npx prisma migrate dev --name add_subscription_wallet_practice
echo.
echo Migration complete!
pause
