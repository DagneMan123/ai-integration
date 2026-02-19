@echo off
echo ========================================
echo Enhanced AI Features Setup
echo ========================================
echo.

echo Step 1: Installing frontend dependencies...
cd client
call npm install react-webcam
if %errorlevel% neq 0 (
    echo ERROR: Failed to install react-webcam
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo Step 2: Updating database schema...
cd ..\server
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to update database schema
    pause
    exit /b 1
)
echo.

echo Step 3: Regenerating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

cd ..
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Enhanced AI features are now ready:
echo - Anti-cheat monitoring
echo - Identity verification
echo - AI plagiarism detection
echo - Behavioral analysis
echo - Enhanced scoring system
echo.
echo Next steps:
echo 1. Make sure your OpenAI API key is set in server/.env
echo 2. Start the backend: cd server ^&^& npm start
echo 3. Start the frontend: cd client ^&^& npm start
echo 4. Test the enhanced interview features
echo.
pause
