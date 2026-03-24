# PostgreSQL Is Not Running - Fix Now

## The Problem

You're seeing this error:
```
Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

**Why?** PostgreSQL database is not running on your computer.

## The Solution

### Option 1: Using Batch Script (Easiest)

Run this batch file:
```
START_POSTGRESQL_NOW.bat
```

This will:
1. Check if PostgreSQL is running
2. Start it if not running
3. Tell you when it's ready

### Option 2: Using Windows Services (Manual)

1. Press `Win + R`
2. Type `services.msc`
3. Press `Enter`
4. Find `postgresql-x64-15` (or similar version like `postgresql-x64-14`)
5. Right-click on it
6. Select `Start`
7. Wait for status to show `Running`

### Option 3: Using Command Line

```bash
# Start PostgreSQL service
net start postgresql-x64-15

# Verify it's running
tasklist | findstr postgres

# Check if port 5432 is listening
netstat -ano | findstr :5432
```

## Verify PostgreSQL Is Running

After starting, verify with:
```bash
psql -U postgres -c "SELECT version();"
```

You should see the PostgreSQL version number.

## Then Restart Backend Server

Once PostgreSQL is running:

```bash
cd server
npm run dev
```

**Expected output:**
```
Database connection established successfully via Prisma.
✓ AI Service initialized via Mock Mode
Server running on port 5000
```

## Startup Order (CRITICAL)

Always start in this order:

1. **PostgreSQL** (port 5432) - START FIRST
2. **Backend Server** (port 5000) - START SECOND
3. **Frontend Client** (port 3000) - START THIRD

If you start them in wrong order, you'll get connection errors.

## Troubleshooting

### "PostgreSQL service not found"
- PostgreSQL might not be installed
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings

### "Access denied" when starting service
- Run Command Prompt as Administrator
- Then run: `net start postgresql-x64-15`

### "Port 5432 already in use"
- Another PostgreSQL instance is running
- Check: `netstat -ano | findstr :5432`
- Kill the process: `taskkill /PID <PID> /F`

### "Can't connect to database"
- Verify database `simuai_db` exists
- Check `server/.env` has correct DATABASE_URL
- Verify PostgreSQL user is `postgres` with password `MYlove8`

## Quick Checklist

- [ ] PostgreSQL is installed
- [ ] PostgreSQL service is running
- [ ] Port 5432 is listening
- [ ] Database `simuai_db` exists
- [ ] Backend server can connect
- [ ] No "Can't reach database" errors

## Next Steps

1. Start PostgreSQL using one of the methods above
2. Verify it's running with: `psql -U postgres -c "SELECT version();"`
3. Restart backend server: `cd server && npm run dev`
4. Test at http://localhost:3000

**That's it! Once PostgreSQL is running, everything will work.**
