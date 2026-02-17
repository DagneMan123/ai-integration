# Database Setup Guide - SimuAI Platform

## Current Issue
Registration is failing because PostgreSQL database is not connected.

## Quick Fix (3 Steps)

### 1. Start PostgreSQL Service

**Option A: Use Windows Services**
- Press `Win + R`, type `services.msc`, press Enter
- Find "postgresql-x64-XX" service
- Right-click → Start

**Option B: Use Command Prompt (Run as Administrator)**
```cmd
net start postgresql-x64-16
```

### 2. Create Database

**Option A: Use batch file (Easiest)**
```cmd
create-database.bat
```

**Option B: Manual**
```cmd
psql -U postgres
```
Then in psql:
```sql
CREATE DATABASE simuai_db;
\q
```

### 3. Create Tables
```cmd
cd server
npx prisma db push
```

### 4. Start Server
```cmd
cd server
npm run dev
```

## Verify Everything Works

1. Server should show: `✅ Database connection established successfully`
2. Test registration at: http://localhost:3000/register
3. Check database:
```cmd
psql -U postgres -d simuai_db
\dt
```

## All Controllers Status ✅

All backend controllers are already converted to Prisma:
- ✅ authController.js - Complete with register, login, password reset
- ✅ userController.js - Profile management
- ✅ jobController.js - Job CRUD operations
- ✅ companyController.js - Company profiles
- ✅ applicationController.js - Job applications
- ✅ interviewController.js - AI interviews
- ✅ paymentController.js - Chapa payments
- ✅ analyticsController.js - Dashboard analytics
- ✅ adminController.js - Admin operations

## Database Schema

Your Prisma schema includes:
- User (with roles: admin, employer, candidate)
- CandidateProfile
- Company
- Job
- Application
- Interview
- Payment
- ActivityLog

## Troubleshooting

### "Can't reach database server at localhost:5432"
→ PostgreSQL service is not running. Start it using Step 1 above.

### "database simuai_db does not exist"
→ Run Step 2 to create the database.

### "client password must be a string"
→ Check `server/.env` file, ensure DATABASE_URL has correct password:
```
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
```

### "Port 5432 is already in use"
→ Another PostgreSQL instance is running. Check:
```cmd
netstat -ano | findstr :5432
```

## Optional: Seed Database with Sample Data

```cmd
cd server
npm run db:seed
```

This creates:
- Sample admin user
- Sample employer with company
- Sample candidate
- Sample jobs

## Environment Variables

Make sure `server/.env` has:
```env
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Next Steps After Database Setup

1. Start frontend: `cd client && npm start`
2. Test registration: http://localhost:3000/register
3. Test login: http://localhost:3000/login
4. Access dashboards based on role

## Need Help?

Check these files:
- `START_POSTGRESQL.md` - Detailed PostgreSQL setup
- `PRISMA_SETUP_GUIDE.md` - Prisma configuration details
- `server/prisma/schema.prisma` - Database schema
