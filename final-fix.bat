@echo off
echo ========================================
echo Final Fix for ajv Module Error
echo ========================================
echo.

cd client

echo [1/5] Removing old installation...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Done!
echo.

echo [2/5] Clearing npm cache...
call npm cache clean --force
echo Done!
echo.

echo [3/5] Installing compatible ajv version first...
call npm install ajv@^8.12.0 --save-dev --legacy-peer-deps
echo Done!
echo.

echo [4/5] Installing all dependencies...
call npm install --legacy-peer-deps
echo Done!
echo.

echo [5/5] Verifying installation...
if exist node_modules\ajv\dist\compile\codegen (
    echo ✓ ajv installed correctly
) else (
    echo ✗ ajv installation issue detected
    echo Installing ajv again...
    call npm install ajv@8.12.0 --save-dev --force
)
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Now run: npm start
echo.
pause
