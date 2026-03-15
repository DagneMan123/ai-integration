# Server Connection Error - Fix Guide

## Error: `net::ERR_CONNECTION_REFUSED`

This error means the backend server is **not running**. The frontend is trying to connect to `http://localhost:5000` but nothing is listening on that port.

## Solution: Start the Server

### Step 1: Open Terminal/PowerShell

Navigate to the server directory:
```powershell
cd server
```

### Step 2: Start PostgreSQL (if not running)

```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-15
# or
Start-Service postgresql-x64-14
```

Wait 3-5 seconds for PostgreSQL to start.

### Step 3: Start the Node Server

```powershell
npm run dev
```

You should see output like:
```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
Server running on port 5000
```

### Step 4: Verify Connection

Open browser console and check:
- Frontend should be at `http://localhost:3000`
- Backend should be at `http://localhost:5000`
- API calls should go to `http://localhost:5000/api/*`

## Common Issues

### Issue 1: Port 5000 Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue 2: PostgreSQL Not Running
```powershell
# Check if PostgreSQL is running
Get-Service postgresql-x64-15 | Select-Object Status

# If stopped, start it
Start-Service postgresql-x64-15
```

### Issue 3: Dependencies Not Installed
```powershell
cd server
npm install
npm run dev
```

## Quick Start Script

Use the batch file to start everything:
```powershell
.\start-all.bat
```

This will:
1. Start PostgreSQL service
2. Wait 3 seconds
3. Start the Node server

## Verify Everything Works

1. **Server running**: Check terminal shows "Server running on port 5000"
2. **Frontend loads**: `http://localhost:3000` loads without errors
3. **API calls work**: Browser console shows no 404 or connection errors
4. **Interview Insights loads**: Click "Interview Insights" in sidebar - should show data or empty state (not error)

## Still Having Issues?

Check:
1. Is PostgreSQL running? `Get-Service postgresql-x64-15`
2. Is Node server running? Check terminal for "Server running on port 5000"
3. Are there any error messages in the server terminal?
4. Try restarting both PostgreSQL and Node server
