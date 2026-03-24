@echo off
echo Fixing Webpack Chunk Loading Error...
echo.

echo Step 1: Clearing client build cache...
cd client
if exist build (
    rmdir /s /q build
    echo ✓ Build cache cleared
) else (
    echo ✓ No build cache found
)

echo.
echo Step 2: Clearing node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Node modules cache cleared
) else (
    echo ✓ No node_modules cache found
)

echo.
echo Step 3: Rebuilding client...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo ✓ Build successful
) else (
    echo ✗ Build failed
    exit /b 1
)

echo.
echo Step 4: Starting development server...
call npm run dev

cd ..
echo.
echo ✓ All done! Client should now load without chunk errors.
