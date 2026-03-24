# Fix: net::ERR_CONNECTION_REFUSED Error

## What This Error Means
The browser cannot connect to the server on `http://localhost:5000`. This happens when:
- The server is not running
- The server crashed
- Port 5000 is blocked or in use

## Quick Fix (3 Steps)

### Step 1: Start PostgreSQL
Open PowerShell and run:
```bash
start-postgres-now.bat
```
Wait for the message: "PostgreSQL is running"

### Step 2: Start the Server
Open a NEW PowerShell window and run:
```bash
cd server
npm run dev
```
Wait for the message: "Server running on port 5000"

### Step 3: Refresh Browser
Go back to your browser and refresh the page (F5 or Ctrl+R)

---

## If That Doesn't Work

### Check if Server is Running
Run this in PowerShell:
```bash
node verify-startup.js
```

This will show you which services are running.

### If Server Won't Start

**Error: "Cannot find module"**
```bash
cd server
npm install
npm run dev
```

**Error: "Port 5000 already in use"**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Then try again
npm run dev
```

**Error: "Database connection failed"**
- Make sure PostgreSQL is running (Step 1)
- Check that the database exists
- Verify DATABASE_URL in server/.env

### If Client Won't Connect

**Error: "Cannot GET /api/..."**
- Server is running but API endpoint doesn't exist
- Check server logs for errors
- Restart server: `npm run dev`

**Error: "Network Error"**
- Server is not running (see above)
- Firewall is blocking port 5000
- Check Windows Firewall settings

---

## Complete Startup Sequence

If everything is broken, do this:

1. **Close all terminals and browser tabs**

2. **Start PostgreSQL:**
   ```bash
   start-postgres-now.bat
   ```
   Wait 3 seconds

3. **Open NEW PowerShell, start Server:**
   ```bash
   cd server
   npm run dev
   ```
   Wait for "Server running on port 5000"

4. **Open ANOTHER NEW PowerShell, start Client:**
   ```bash
   cd client
   npm run dev
   ```
   Wait for "Compiled successfully"

5. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## Automated Startup

Run this to start everything at once:
```bash
START_ALL.bat
```

---

## Verify Everything is Working

Run this to check all services:
```bash
node verify-startup.js
```

Expected output:
```
✓ PostgreSQL is running on port 5432
✓ Server is running on port 5000
✓ Server API is responding
✓ Client is running on port 3000
```

---

## Still Having Issues?

Check the server logs:
```bash
cd server
type server/logs/error.log
```

Check if ports are in use:
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :5432
```

If a port is in use, kill it:
```bash
taskkill /PID <PID> /F
```

Then restart the service.
