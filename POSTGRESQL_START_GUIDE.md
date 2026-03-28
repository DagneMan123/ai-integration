# PostgreSQL Startup Guide for Windows

## Quick Start

Your server is trying to connect to PostgreSQL at `localhost:5432` but the service isn't running.

### Option 1: Automated (Easiest)
Run the batch file I created:
```
START_POSTGRES_SERVICE.bat
```

---

## Option 2: Manual Start via Services

1. **Open Services Manager**
   - Press `Windows + R`
   - Type: `services.msc`
   - Press Enter

2. **Find PostgreSQL Service**
   - Look for: `postgresql-x64-16` (or similar version)
   - Right-click on it
   - Select **"Start"**

3. **Verify It's Running**
   - Status should show: **"Running"**
   - Startup Type should be: **"Automatic"** (so it starts on reboot)

---

## Option 3: Command Prompt (Admin Required)

1. **Open Command Prompt as Administrator**
   - Press `Windows + R`
   - Type: `cmd`
   - Press `Ctrl + Shift + Enter` (to run as admin)

2. **Start PostgreSQL**
   ```
   net start postgresql-x64-16
   ```

3. **Verify Connection**
   ```
   psql -U postgres -c "SELECT version();"
   ```

---

## Option 4: Using pgAdmin

1. **Open pgAdmin** (if installed)
2. **Right-click the server** in the left panel
3. **Select "Connect"**
4. **Enter password** if prompted

---

## Verify PostgreSQL is Running

After starting, verify the connection:

```bash
# Test connection
psql -U postgres -c "SELECT 1;"

# Should output:
#  ?column?
# ----------
#         1
```

---

## After Starting PostgreSQL

Once PostgreSQL is running, go back to your server terminal and run:

```bash
npm run dev
```

You should see:
```
Database connection established successfully via Prisma.
```

---

## Troubleshooting

### "PostgreSQL service not found"
- PostgreSQL may not be installed
- Install from: https://www.postgresql.org/download/windows/

### "Access denied" error
- Run Command Prompt as Administrator
- Or use pgAdmin instead

### "Port 5432 already in use"
- Another PostgreSQL instance is running
- Or another service is using port 5432
- Check: `netstat -ano | findstr :5432`

### "Connection refused"
- PostgreSQL is not running
- Follow the steps above to start it

### Database doesn't exist
- Run: `npm run db:setup` (if available)
- Or manually create: `createdb -U postgres simuai_db`

---

## Make PostgreSQL Start Automatically

To avoid starting it manually each time:

1. Open Services Manager (`services.msc`)
2. Find `postgresql-x64-16`
3. Right-click → Properties
4. Set **Startup type** to **"Automatic"**
5. Click OK

Now PostgreSQL will start automatically when you restart your computer.

---

## Next Steps

Once PostgreSQL is running:

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

2. **In another terminal, start the client**
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   - Open: http://localhost:3000

---

## Need Help?

If you're still having issues:

1. Check PostgreSQL is running: `services.msc`
2. Verify database exists: `psql -U postgres -l`
3. Check `.env` file has correct `DATABASE_URL`
4. Review error logs in `server/logs/`

