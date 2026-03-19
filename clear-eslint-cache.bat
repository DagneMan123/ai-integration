@echo off
echo Clearing ESLint cache and node_modules cache...
cd client
del /s /q node_modules\.cache 2>nul
echo Cache cleared!
echo.
echo Restarting development server...
npm start
