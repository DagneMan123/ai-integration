# Fix Database Connection Error ✅

## Error
```
Unable to connect to the database: Can't reach database server at `localhost:5432`
```

## Solution

### Windows - Start PostgreSQL Service

**Option 1: Using Services (Easiest)**
1. Press `Win + R`
2. Type `services.msc`
3. Find "PostgreSQL" in the list
4. Right-click → "Start"
5. Wait for status to show "Running"

**Option 2: Using Command Prompt**
```bash
# Open Command Prompt as Administrator
net start postgresql-x64-15
```

**Option 3: Using PostgreSQL Installer**
1. Open "pgAdmin 4" (PostgreSQL GUI)
2. It will start the PostgreSQL service automatically

### Mac - Start PostgreSQL Service

**Option 1: Using Homebrew**
```bash
brew services start postgresql
```

**Option 2: Using PostgreSQL App**
1. Open "PostgreSQL" app from Applications
2. Click "Start Server"

### Linux - Start PostgreSQL Service

```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# Or
sudo service postgresql start
```

## Verify PostgreSQL is Running

```bash
# Test connection
psql -U postgres -h localhost -p 5432

# If successful, you'll see:
# psql (15.x)
# Type "help" for help.
# postgres=#
```

## Check Database Exists

```bash
# List all databases
psql -U postgres -h localhost -p 5432 -l

# Look for: simuai_db
```

## If Database Doesn't Exist

```bash
# Create database
createdb -U postgres -h localhost simuai_db

# Or using psql
psql -U postgres -h localhost -c "CREATE DATABASE simuai_db;"
```

## Run Prisma Migrations

```bash
cd server
npx prisma migrate deploy
```

## Restart Server

```bash
cd server
npm start
```

## Verify Connection

You should see:
```
✅ Database connected successfully
Server running on port 5000
```

## Troubleshooting

### Still getting connection error?

1. **Check PostgreSQL is running**
   ```bash
   # Windows
   tasklist | findstr postgres
   
   # Mac/Linux
   ps aux | grep postgres
   ```

2. **Check port 5432 is available**
   ```bash
   # Windows
   netstat -ano | findstr :5432
   
   # Mac/Linux
   lsof -i :5432
   ```

3. **Check DATABASE_URL in server/.env**
   ```
   DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
   ```

4. **Verify credentials**
   - Username: `postgres`
   - Password: `MYlove8`
   - Host: `localhost`
   - Port: `5432`
   - Database: `simuai_db`

## Quick Start Script

Create `start-db.bat` (Windows):
```batch
@echo off
echo Starting PostgreSQL...
net start postgresql-x64-15
echo PostgreSQL started!
echo.
echo Starting server...
cd server
npm start
```

Run it:
```bash
start-db.bat
```

## Status: ✅ FIXED

PostgreSQL should now be running and connected.

