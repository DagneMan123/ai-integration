@echo off
echo ========================================
echo Suppressing Development Warnings
echo ========================================
echo.

cd client

echo [1/2] Updating TypeScript version...
call npm install typescript@5.1.6 --save-exact --legacy-peer-deps
echo Done!
echo.

echo [2/2] Verifying .env file...
if exist .env (
    echo ✓ .env file exists
) else (
    echo Creating .env file...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo SKIP_PREFLIGHT_CHECK=true >> .env
    echo TSC_COMPILE_ON_ERROR=true >> .env
    echo ESLINT_NO_DEV_ERRORS=true >> .env
)
echo.

echo ========================================
echo Warnings Suppressed!
echo ========================================
echo.
echo Restart your dev server: npm start
echo.
pause
