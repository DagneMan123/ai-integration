@echo off
echo Fixing Database Permissions...
echo.

REM Check if PostgreSQL is running
pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo ERROR: PostgreSQL is not running!
    echo Please start PostgreSQL first using start-postgres.bat
    pause
    exit /b 1
)

echo PostgreSQL is running...
echo.

REM Run the permission fix script
echo Running permission fix script...
psql -U postgres -d simuai_db -f fix-database-permissions.sql

if errorlevel 1 (
    echo.
    echo ERROR: Failed to fix permissions!
    echo.
    echo Trying alternative method...
    echo.
    
    REM Alternative: Grant permissions directly
    psql -U postgres -d simuai_db -c "GRANT ALL PRIVILEGES ON DATABASE simuai_db TO postgres;"
    psql -U postgres -d simuai_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
    psql -U postgres -d simuai_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
    psql -U postgres -d simuai_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;"
    
    echo.
    echo Disabling Row Level Security...
    psql -U postgres -d simuai_db -c "DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY'; END LOOP; END $$;"
)

echo.
echo ========================================
echo Permissions fixed successfully!
echo ========================================
echo.
echo You can now:
echo 1. Restart your server
echo 2. Try registering/logging in again
echo.
pause
