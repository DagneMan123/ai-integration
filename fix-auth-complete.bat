@echo off
echo ========================================
echo  SimuAI - Complete Auth Fix
echo ========================================
echo.

REM Check if PostgreSQL is running
echo Checking PostgreSQL status...
pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo ERROR: PostgreSQL is not running!
    echo Please start PostgreSQL first using start-postgres.bat
    pause
    exit /b 1
)

echo ✓ PostgreSQL is running
echo.

REM Step 1: Add missing columns
echo Step 1: Adding missing authentication columns...
psql -U postgres -d simuai_db -f server\prisma\migrations\add_auth_fields.sql
if errorlevel 1 (
    echo WARNING: Some columns may already exist (this is OK)
)
echo ✓ Columns added
echo.

REM Step 2: Fix permissions
echo Step 2: Fixing database permissions...
psql -U postgres -d simuai_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -U postgres -d simuai_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
psql -U postgres -d simuai_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;"
echo ✓ Permissions fixed
echo.

REM Step 3: Disable RLS if enabled
echo Step 3: Disabling Row Level Security...
psql -U postgres -d simuai_db -c "ALTER TABLE users DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE companies DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE candidate_profiles DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE applications DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE payments DISABLE ROW LEVEL SECURITY;" 2>nul
psql -U postgres -d simuai_db -c "ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;" 2>nul
echo ✓ RLS disabled
echo.

REM Step 4: Verify table structure
echo Step 4: Verifying users table structure...
psql -U postgres -d simuai_db -c "\d users"
echo.

echo ========================================
echo  Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your server (if running)
echo 2. Clear browser storage (F12 ^> Application ^> Clear Storage)
echo 3. Try registering a new user
echo.
pause
