# PostgreSQL Startup - Quick Fix Guide

## Problem
Backend shows error: `Can't reach database server at localhost:5432`

This means PostgreSQL is not running.

---

## Quick Fix (Choose One)

### Option 1: Using Batch Script (Easiest)
```bash
START_POSTGRESQL_AND_BACKEND.bat
```
This script will:
- ✅ Check if PostgreSQL is running
- ✅ Start PostgreSQL if needed
- ✅ Wait for it to be ready
- ✅ Start the backend automatically

### Option 2: Using PowerShell Script
```powershell
.\START_POSTGRESQL_AND_BACKEND.ps1
```
Same as Option 1, but using PowerShell.

### Option 3: Manual Start (Windows Services)
1. Press `Windows Key + R`
2. Type: `services.msc`
3. Find: `postgresql-x64-15`
4. Right-click → **Start**
5. Wait 5-10 seconds
6. Then run: `npm run dev` (in server folder)

### Option 4: Manual Start (PowerShell)
```powershell
Start-Service -Name "postgresql-x64-15"
```
Then wait 5-10 seconds and run:
```bash
cd server
npm run dev
```

---

## Verify PostgreSQL is Running

### Using PowerShell
```powershell
Get-Service -Name "postgresql-x64-15" | Select-Object Status
```
Should show: `Status : Running`

### Using Services
1. Press `Windows Key + R`
2. Type: `services.msc`
3. Find `postgresql-x64-15`
4. Check the Status column shows "Running"

---

## If PostgreSQL Won't Start

### Check PostgreSQL Installation
```powershell
Get-Service -Name "postgresql-x64-15"
```

If not found, PostgreSQL is not installed. Install from:
https://www.postgresql.org/download/windows/

### Check PostgreSQL Logs
PostgreSQL logs are usually at:
```
C:\Program Files\PostgreSQL\15\data\log\
```

### Restart PostgreSQL Service
```powershell
Restart-Service -Name "postgresql-x64-15"
```

### Force Stop and Start
```powershell
Stop-Service -Name "postgresql-x64-15" -Force
Start-Service -Name "postgresql-x64-15"
```

---

## Database Connection Details

Your database is configured in `server/.env`:
```
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public&connection_limit=10"
```

- **Host**: localhost
- **Port**: 5432
- **Database**: simuai_db
- **User**: postgres
- **Password**: MYlove8

---

## After PostgreSQL Starts

1. Backend will automatically connect
2. You should see: `✅ Database connection established successfully`
3. Then you can test the application

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `Can't reach database server at localhost:5432` | PostgreSQL not running - use Option 1 or 3 above |
| `FATAL: password authentication failed` | Check password in `.env` DATABASE_URL |
| `database "simuai_db" does not exist` | Run: `npx prisma migrate dev` |
| `Connection refused` | PostgreSQL service not started |
| `Port 5432 already in use` | Another PostgreSQL instance is running |

---

## Next Steps

Once PostgreSQL is running and backend connects:

1. **Start Frontend** (in new terminal):
   ```bash
   cd client
   npm start
   ```

2. **Access Application**:
   - Open: http://localhost:3000
   - Login with test credentials

3. **Verify Everything Works**:
   - Check backend logs for errors
   - Check browser console for errors
   - Test payment flow

---

## Automatic Startup (Optional)

To make PostgreSQL start automatically on Windows boot:

1. Press `Windows Key + R`
2. Type: `services.msc`
3. Find: `postgresql-x64-15`
4. Right-click → **Properties**
5. Set **Startup type** to: **Automatic**
6. Click **OK**

Now PostgreSQL will start automatically when Windows boots.

---

## Still Having Issues?

Check these files for more details:
- `DATABASE_DISCONNECT_TROUBLESHOOTING.md` - Comprehensive troubleshooting
- `COMPLETE_STARTUP_PROCEDURE.md` - Full startup guide
- `server/.env` - Database configuration
- `server/lib/prisma.js` - Connection retry logic
