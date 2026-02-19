# Fix "Insufficient Permissions" Error

## The Problem
You're getting "Insufficient permissions" when trying to register or login. This is caused by:

1. **Missing database columns**: The `users` table is missing authentication columns
2. **Database permissions**: PostgreSQL user doesn't have full permissions
3. **Row Level Security**: RLS might be enabled on tables

## Quick Fix (Recommended)

Run this command:

```bash
fix-auth-complete.bat
```

This will:
1. Add missing authentication columns to the users table
2. Fix database permissions
3. Disable Row Level Security
4. Verify the table structure

## Manual Fix

If the batch file doesn't work, follow these steps:

### Step 1: Add Missing Columns

```bash
psql -U postgres -d simuai_db
```

Then run:

```sql
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT,
ADD COLUMN IF NOT EXISTS "email_verification_expires" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT,
ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP(3);
```

### Step 2: Fix Permissions

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
```

### Step 3: Disable Row Level Security

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
```

### Step 4: Verify

```sql
\d users
```

You should see all these columns:
- id
- email
- password_hash
- first_name
- last_name
- role
- phone
- profile_picture
- linkedin_url
- github_url
- bio
- is_verified
- is_active
- is_locked ← NEW
- login_attempts ← NEW
- last_login ← NEW
- email_verification_token ← NEW
- email_verification_expires ← NEW
- reset_password_token ← NEW
- reset_password_expires ← NEW
- created_at
- updated_at

## Alternative: Reset Database

If you don't have important data, you can reset the entire database:

```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

This will:
- Drop all tables
- Recreate them with the correct schema
- Seed with sample data

## After Fixing

1. **Restart your server**
2. **Clear browser storage**: F12 → Application → Clear Storage
3. **Try registering**: Go to http://localhost:3000/register
4. **Test login**: Use the credentials you just registered

## Verify It's Fixed

Run this test:

```bash
node test-auth.js
```

If you see:
```
✅ Registration successful!
✅ Login successful!
✅ Token refresh successful!
✅ All tests passed!
```

Then it's fixed!

## Still Having Issues?

Check the server logs for the exact error:

```bash
# In the server terminal, you should see:
# If successful: "HTTP Request { method: 'POST', url: '/api/auth/register', status: 201 }"
# If error: The actual error message
```

Common errors:
- **"column does not exist"**: Run Step 1 again
- **"permission denied"**: Run Step 2 again
- **"insufficient_privilege"**: Run Step 2 again
- **"policy violation"**: Run Step 3 again

## Database Connection Issues

If you can't connect to the database at all:

1. Check if PostgreSQL is running:
   ```bash
   pg_isready -U postgres
   ```

2. Check your DATABASE_URL in `server/.env`:
   ```
   DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
   ```

3. Make sure the database exists:
   ```bash
   psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='simuai_db';"
   ```

If it doesn't exist, create it:
```bash
psql -U postgres -c "CREATE DATABASE simuai_db;"
```

## Success Indicators

After fixing, you should be able to:
- ✅ Register a new user
- ✅ Auto-login after registration
- ✅ Logout
- ✅ Login with the same credentials
- ✅ Access the dashboard

The "Insufficient permissions" error should be gone!
