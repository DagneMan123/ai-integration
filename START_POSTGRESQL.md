# Start PostgreSQL and Fix Database Connection

## Problem
Server is running but cannot connect to PostgreSQL database at `localhost:5432`

## Solution Steps

### Step 1: Start PostgreSQL Service

Open Command Prompt as Administrator and run:

```cmd
net start postgresql-x64-16
```

If that doesn't work, try these alternatives:
```cmd
net start postgresql-x64-15
net start postgresql-x64-14
net start postgresql-x64-13
```

Or check your PostgreSQL service name:
```cmd
sc query | findstr postgresql
```

### Step 2: Verify PostgreSQL is Running

```cmd
psql -U postgres
```

If prompted for password, enter: `MYlove8`

### Step 3: Create Database

Once in psql, run:
```sql
CREATE DATABASE simuai_db;
\q
```

### Step 4: Run Prisma Migrations

Navigate to server folder and push schema to database:

```cmd
cd server
npx prisma db push
```

This will create all tables based on your Prisma schema.

### Step 5: (Optional) Seed Database

```cmd
npm run db:seed
```

### Step 6: Start Server

```cmd
npm run dev
```

## Troubleshooting

### If PostgreSQL service doesn't start:
1. Check if PostgreSQL is installed: `psql --version`
2. Find PostgreSQL installation folder (usually `C:\Program Files\PostgreSQL\16\bin`)
3. Add to PATH environment variable
4. Restart computer

### If password is wrong:
Update `server/.env` file with correct password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/simuai_db?schema=public"
```

### If port 5432 is in use:
Check what's using the port:
```cmd
netstat -ano | findstr :5432
```

## Quick Test

After starting PostgreSQL, test connection:
```cmd
cd server
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.$connect().then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message))"
```
