# 🚨 Database Connection Error - FIX NOW

## Problem
```
Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

**Root Cause:** PostgreSQL is not running

---

## ✅ Quick Fix (2 Minutes)

### Option 1: Run the Fix Script
```bash
FIX_DATABASE_CONNECTION.bat
```

This will:
1. Check if PostgreSQL service exists
2. Start the PostgreSQL service
3. Verify connection
4. Show next steps

### Option 2: Manual Start (Windows)

**Step 1: Open Services**
```
Press: Windows Key + R
Type: services.msc
Press: Enter
```

**Step 2: Find PostgreSQL**
```
Look for: "postgresql-x64-15" or "postgresql-x64-14"
(Version number may vary)
```

**Step 3: Start Service**
```
Right-click on PostgreSQL service
Select: "Start"
Wait for status to change to "Running"
```

**Step 4: Verify Connection**
```
Open Command Prompt
Run: psql -U postgres -h localhost -p 5432
If successful, you'll see: postgres=#
Type: \q (to exit)
```

---

## 🔍 Verify PostgreSQL is Running

### Check 1: Services
```
1. Open Services (services.msc)
2. Look for "postgresql-x64-XX"
3. Status should be "Running"
```

### Check 2: Command Line
```bash
# Check if port 5432 is listening
netstat -ano | findstr :5432

# If you see a process listening on 5432, PostgreSQL is running
```

### Check 3: Try Connection
```bash
# Try to connect
psql -U postgres -h localhost -p 5432

# If successful, you'll see: postgres=#
# Type: \q to exit
```

---

## 🔧 Troubleshooting

### Issue: Service not found
**Solution:**
1. PostgreSQL may not be installed
2. Download from: https://www.postgresql.org/download/windows/
3. Install with default settings
4. Restart computer
5. Try again

### Issue: Service won't start
**Solution:**
1. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\pg_log\`
2. Look for error messages
3. Common issues:
   - Port 5432 already in use
   - Corrupted data directory
   - Permission issues

### Issue: Connection refused
**Solution:**
1. Verify PostgreSQL is running (check Services)
2. Verify port 5432 is not blocked by firewall
3. Check DATABASE_URL in `.env` file
4. Verify credentials (default: postgres/password)

### Issue: "psql: command not found"
**Solution:**
1. PostgreSQL may not be in PATH
2. Add to PATH: `C:\Program Files\PostgreSQL\15\bin`
3. Or use full path: `"C:\Program Files\PostgreSQL\15\bin\psql.exe"`

---

## 📋 Database Configuration

### Check .env File
```bash
# Open server/.env
# Look for DATABASE_URL

# Should look like:
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public&connection_limit=10"
```

### Verify Credentials
```
Username: postgres
Password: MYlove8 (or your password)
Host: localhost
Port: 5432
Database: simuai_db
```

### Create Database (if needed)
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost -p 5432

# Create database
CREATE DATABASE simuai_db;

# Verify
\l

# Exit
\q
```

---

## 🚀 After Fixing Database

### Step 1: Verify Connection
```bash
# Test connection
psql -U postgres -h localhost -p 5432 -d simuai_db

# If successful, you'll see: simuai_db=#
# Type: \q to exit
```

### Step 2: Start Server
```bash
# Open new terminal
cd server
npm run dev

# Expected output:
# Database connection established successfully via Prisma.
```

### Step 3: Start Client
```bash
# Open another terminal
cd client
npm start

# Browser should open to http://localhost:3000
```

---

## ✅ Success Indicators

### Server Output
```
Database connection established successfully via Prisma.
```

### No Errors
```
✓ No "Can't reach database server" errors
✓ No "PrismaClientKnownRequestError" errors
✓ Server running on port 5000
```

### Client Works
```
✓ Browser opens to http://localhost:3000
✓ Can login
✓ Can navigate pages
✓ No connection errors
```

---

## 📞 Still Having Issues?

### Check These Files
1. `server/.env` - Database URL correct?
2. `server/lib/prisma.js` - Prisma client configured?
3. `server/config/database.js` - Database config correct?

### Common Issues
1. **Port 5432 in use** - Another app using it
   - Solution: Change port or stop other app

2. **Wrong credentials** - Username/password incorrect
   - Solution: Verify in PostgreSQL

3. **Database doesn't exist** - simuai_db not created
   - Solution: Create database manually

4. **Firewall blocking** - Port 5432 blocked
   - Solution: Allow PostgreSQL in firewall

---

## 🎯 Quick Checklist

- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Port 5432 available
- [ ] Database credentials correct
- [ ] Database simuai_db exists
- [ ] .env file has correct DATABASE_URL
- [ ] Can connect with psql
- [ ] Server starts without errors
- [ ] Client loads in browser
- [ ] Can login to dashboard

---

## 📝 Next Steps

1. **Run Fix Script**
   ```bash
   FIX_DATABASE_CONNECTION.bat
   ```

2. **Verify Connection**
   ```bash
   psql -U postgres -h localhost -p 5432
   ```

3. **Start Server**
   ```bash
   cd server && npm run dev
   ```

4. **Start Client**
   ```bash
   cd client && npm start
   ```

5. **Test Payment Flow**
   - Login to dashboard
   - Go to Interviews
   - Click "Start AI Interview"
   - Payment modal should appear

---

## 🆘 Emergency Help

If nothing works:

1. **Restart PostgreSQL**
   - Open Services
   - Right-click PostgreSQL
   - Select "Restart"
   - Wait 30 seconds

2. **Restart Computer**
   - Sometimes fixes permission issues
   - Ensures clean start

3. **Reinstall PostgreSQL**
   - Uninstall: Control Panel → Programs
   - Download: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Restart computer

4. **Check Logs**
   - PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\pg_log\`
   - Server logs: `server/logs/error.log`
   - Look for error messages

---

**Status:** Database connection error detected
**Action:** Start PostgreSQL service
**Time to Fix:** 2-5 minutes

**Run: `FIX_DATABASE_CONNECTION.bat` NOW!**
