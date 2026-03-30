# PostgreSQL Connection Error - Fix Guide

## The Problem

```
error: Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

**Cause:** PostgreSQL service is not running on your Windows machine.

---

## Quick Fix (30 seconds)

### Option 1: Run Batch File (Easiest)
```bash
START_POSTGRESQL_NOW.bat
```
- Right-click the file
- Select "Run as administrator"
- Wait for success message

### Option 2: PowerShell (As Administrator)
```powershell
Start-Service postgresql-x64-15
```

### Option 3: Command Prompt (As Administrator)
```cmd
net start postgresql-x64-15
```

---

## Verify PostgreSQL is Running

### PowerShell
```powershell
Get-Service postgresql-x64-15
```

**Expected output:**
```
Status   Name
------   ----
Running  postgresql-x64-15
```

### Command Prompt
```cmd
sc query postgresql-x64-15
```

**Expected output:**
```
SERVICE_NAME: postgresql-x64-15
        TYPE               : 10  SHARE_PROCESS
        STATE              : 4  RUNNING
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
```

---

## What Happens After Starting PostgreSQL

1. **PostgreSQL starts** ✅
2. **Backend detects connection** ✅
3. **Backend shows:** "Database connection established successfully via Prisma." ✅
4. **System is ready** ✅

---

## Troubleshooting

### PostgreSQL Won't Start

**Check if already running:**
```powershell
Get-Service postgresql-x64-15
```

**If status is "Running":**
- PostgreSQL is already running
- Restart it:
```powershell
Restart-Service postgresql-x64-15
```

**If status is "Stopped":**
- Try starting again:
```powershell
Start-Service postgresql-x64-15
```

**If still fails:**
1. Open Windows Services: `services.msc`
2. Find "postgresql-x64-15"
3. Right-click → Start
4. Check for error messages

### Check PostgreSQL Logs

If PostgreSQL won't start, check the logs:
```
C:\Program Files\PostgreSQL\15\data\pg_log\
```

Look for recent error files and check the error messages.

---

## After PostgreSQL Starts

### Backend Will Automatically Reconnect

The backend has auto-reconnection logic that will:
1. Detect PostgreSQL is now running
2. Attempt to reconnect
3. Show: "Database connection established successfully via Prisma."

### You Should See

In the backend terminal:
```
warn: Database connection failed (attempt 1/5). Retrying in 1000ms...
warn: Database connection failed (attempt 2/5). Retrying in 2000ms...
Database connection established successfully via Prisma.
```

---

## Next Steps

1. **Start PostgreSQL** using one of the options above
2. **Wait for backend to reconnect** (watch the terminal)
3. **Verify connection** - Look for "Database connection established successfully"
4. **Try the payment flow again** - It should work now

---

## System Status After Fix

| Component | Status |
|-----------|--------|
| PostgreSQL | ✅ Running |
| Backend | ✅ Connected |
| Payment System | ✅ Ready |
| Database | ✅ Accessible |

---

## Quick Reference

**Start PostgreSQL:**
```bash
START_POSTGRESQL_NOW.bat
```

**Check if running:**
```powershell
Get-Service postgresql-x64-15
```

**Restart if needed:**
```powershell
Restart-Service postgresql-x64-15
```

---

## Support

If PostgreSQL still won't start after trying all options:
1. Check Windows Services (services.msc)
2. Check PostgreSQL logs (C:\Program Files\PostgreSQL\15\data\pg_log\)
3. Restart your computer
4. Reinstall PostgreSQL if necessary

---

## Summary

**PostgreSQL is not running. Start it using `START_POSTGRESQL_NOW.bat` and the backend will automatically reconnect.**
