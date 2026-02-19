-- Fix Database Permissions for SimuAI

-- Connect to the database
\c simuai_db

-- Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE simuai_db TO postgres;

-- Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

-- Grant all privileges on all sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- Disable Row Level Security if enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Show current permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type 
FROM 
    information_schema.table_privileges 
WHERE 
    table_schema = 'public' 
    AND grantee = 'postgres';
