# Login Error Fix Guide

## Problem
You're getting "Invalid credentials" error when trying to login.

## Root Causes
1. **No users exist in the database** - You need to create a user first
2. **Database not connected** - PostgreSQL isn't running
3. **Password mismatch** - Wrong password for the user

## Solution

### Step 1: Ensure PostgreSQL is Running
```powershell
# Check if PostgreSQL is running
net start postgresql-x64-15

# Or use Services (Win + R → services.msc)
```

### Step 2: Create a Test User

**Option A: Using the seed script (Recommended)**
```powershell
node seed-test-user.js
```

This will create a test user with:
- Email: `test@simuai.com`
- Password: `TestPassword123!`

**Option B: Register via API**
```bash
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "candidate"
}
```

### Step 3: Login with the Created User
```bash
POST /api/auth/login
{
  "email": "test@simuai.com",
  "password": "TestPassword123!"
}
```

## Troubleshooting

### Still getting "Invalid credentials"?

1. **Check if user exists:**
   - Open pgAdmin or psql
   - Query: `SELECT email, role FROM users;`
   - If empty, run the seed script

2. **Check database connection:**
   - Look at server logs for connection errors
   - Verify DATABASE_URL in `.env`
   - Make sure PostgreSQL is running

3. **Verify password:**
   - Make sure you're using the exact password you registered with
   - Passwords are case-sensitive
   - No extra spaces

4. **Check email format:**
   - Email must be valid format (user@domain.com)
   - Email is case-insensitive but must match exactly

## Quick Start

```powershell
# 1. Start PostgreSQL
net start postgresql-x64-15

# 2. Create test user
node seed-test-user.js

# 3. Start server (in another terminal)
cd server
npm start

# 4. Login with test credentials
# Email: test@simuai.com
# Password: TestPassword123!
```

## Enhanced Logging

The login endpoint now includes better error logging:
- Logs when user doesn't exist
- Logs when password is wrong
- Logs successful logins
- Logs account lockouts

Check `server/logs/error.log` for detailed information.
