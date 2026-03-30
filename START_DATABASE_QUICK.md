# Start PostgreSQL Database - Quick Guide

## Problem
```
Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

## Solution: Start PostgreSQL

### Option 1: Using Windows Services (Recommended)

**Step 1: Open Services**
```
Press: Windows Key + R
Type: services.msc
Press: Enter
```

**Step 2: Find PostgreSQL**
```
Look for: "postgresql-x64-15" or similar
(Version number may vary)
```

**Step 3: Start the Service**
```
Right-click on PostgreSQL service
Select: Start
Wait for status to change to "Running"
```

**Step 4: Verify**
```
Status should show: "Running"
Startup Type should show: "Automatic"
```

### Option 2: Using Command Line

**Step 1: Open PowerShell as Administrator**
```
Right-click PowerShell
Select: Run as Administrator
```

**Step 2: Start PostgreSQL Service**
```powershell
Start-Service -Name "postgresql-x64-15"
```

**Step 3: Verify Service Started**
```powershell
Get-Service -Name "postgresql-x64-15"
```

Should show: `Status : Running`

### Option 3: Using Batch File

**Create a file: `start-postgres.bat`**
```batch
@echo off
echo Starting PostgreSQL...
net start postgresql-x64-15
echo PostgreSQL started!
pause
```

**Run the batch file:**
```
Double-click: start-postgres.bat
```

---

## Verify Database Connection

### Test 1: Check if PostgreSQL is Running
```powershell
# Open PowerShell and run:
Get-Service -Name "postgresql-x64-15" | Select-Object Status
```

Expected output: `Status : Running`

### Test 2: Connect to Database
```bash
# Open Command Prompt and run:
psql -U postgres -d simuai -c "SELECT 1"
```

Expected output: `1` (if database exists)

### Test 3: Check Backend Connection
```bash
# In server directory:
npm run dev
```

Expected output: `Database connection established successfully via Prisma.`

---

## Common Issues

### Issue: Service Not Found
**Error**: "The specified service does not exist as an installed service"

**Solution**:
1. PostgreSQL may not be installed
2. Service name might be different
3. Check installed services: `Get-Service | grep -i postgres`

### Issue: Permission Denied
**Error**: "Access Denied"

**Solution**:
1. Run PowerShell as Administrator
2. Right-click → Run as Administrator

### Issue: Service Won't Start
**Error**: "The service did not respond to the start or control request in a timely fashion"

**Solution**:
1. Check if port 5432 is in use: `netstat -ano | findstr :5432`
2. Kill process using port: `taskkill /PID <PID> /F`
3. Try starting service again

### Issue: Database Connection Still Fails
**Error**: "Can't reach database server"

**Solution**:
1. Verify PostgreSQL is running: `Get-Service postgresql-x64-15`
2. Check if port 5432 is listening: `netstat -ano | findstr :5432`
3. Check DATABASE_URL in `.env` file
4. Restart PostgreSQL service

---

## Quick Startup Checklist

- [ ] PostgreSQL service is running
- [ ] Port 5432 is listening
- [ ] Database "simuai" exists
- [ ] Backend can connect to database
- [ ] No errors in server logs

---

## After Starting PostgreSQL

### 1. Start Backend
```bash
cd server
npm run dev
```

Expected: `Database connection established successfully via Prisma.`

### 2. Start Frontend
```bash
cd client
npm run dev
```

Expected: `Compiled successfully!`

### 3. Test Application
```
Open: http://localhost:3000
Login with test credentials
```

---

## Troubleshooting Commands

### Check PostgreSQL Status
```powershell
Get-Service -Name "postgresql-x64-15"
```

### Start PostgreSQL
```powershell
Start-Service -Name "postgresql-x64-15"
```

### Stop PostgreSQL
```powershell
Stop-Service -Name "postgresql-x64-15"
```

### Restart PostgreSQL
```powershell
Restart-Service -Name "postgresql-x64-15"
```

### Check Port 5432
```powershell
netstat -ano | findstr :5432
```

### Connect to Database
```bash
psql -U postgres -d simuai
```

---

## Environment Variables

Make sure `.env` file has correct database URL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/simuai"
```

Replace `password` with your PostgreSQL password.

---

## Status Check

After starting PostgreSQL, you should see:

**Backend Logs:**
```
Database connection established successfully via Prisma.
```

**Frontend Logs:**
```
Compiled successfully!
```

**Browser:**
```
Application loads without errors
```

---

## Need Help?

1. Check PostgreSQL is running: `Get-Service postgresql-x64-15`
2. Check port 5432: `netstat -ano | findstr :5432`
3. Check database exists: `psql -U postgres -l`
4. Check backend logs: `tail -f server/logs/error.log`

---

**Status**: Ready to Start
**Next Step**: Start PostgreSQL service
**Time to Complete**: 2 minutes
