# PostgreSQL Database Connection Error - Fix

## Problem
```
Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

## Solution: Start PostgreSQL

### Option 1: Using Windows Services (Recommended)
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "PostgreSQL" in the list
4. Right-click → Select "Start"
5. Wait for status to show "Running"

### Option 2: Using Command Line
Open PowerShell as Administrator and run:
```powershell
# Start PostgreSQL service
Start-Service -Name postgresql-x64-15

# Or if you have a different version:
Start-Service -Name postgresql-x64-14
```

### Option 3: Using PostgreSQL Command
If PostgreSQL is installed locally, open Command Prompt and run:
```cmd
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```
(Replace `15` with your PostgreSQL version)

### Option 4: Using pgAdmin
1. Open pgAdmin (usually in Start Menu)
2. Right-click on your server
3. Select "Connect"

## Verify Connection
After starting PostgreSQL, check if it's running:
```powershell
# Test connection
psql -U postgres -h localhost -p 5432 -c "SELECT version();"
```

## Then Start Your Server
Once PostgreSQL is running, start your Node.js server:
```powershell
cd server
npm run dev
```

## Common Issues

### PostgreSQL Service Not Found
If you get "Service not found", PostgreSQL might not be installed or service name is different.

Check installed services:
```powershell
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```

### Port 5432 Already in Use
If port 5432 is in use by another process:
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Database Doesn't Exist
If you get "database does not exist" error after PostgreSQL starts:
```powershell
cd server
npx prisma migrate dev --name init
```

## Status
✅ Follow these steps to start PostgreSQL and fix the connection error
