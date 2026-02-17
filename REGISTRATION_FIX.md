# Registration Fix - Complete Guide

## Problem Summary
Registration was failing because:
1. PostgreSQL database service is not running
2. Database `simuai_db` doesn't exist
3. Database tables haven't been created

## ✅ What Has Been Fixed

### 1. All Controllers Converted to Prisma
All 8 backend controllers now use Prisma ORM (not Sequelize):
- ✅ `authController.js` - Registration, login, password reset, email verification
- ✅ `userController.js` - User profile management
- ✅ `jobController.js` - Job CRUD operations
- ✅ `companyController.js` - Company profile management
- ✅ `applicationController.js` - Job application handling
- ✅ `interviewController.js` - AI interview system
- ✅ `paymentController.js` - Chapa payment integration
- ✅ `analyticsController.js` - Dashboard analytics
- ✅ `adminController.js` - Admin operations

### 2. Prisma Client Optimization
All controllers now use shared Prisma client instance from `lib/prisma.js` to prevent multiple connections.

### 3. Database Connection Error Handling
Server no longer crashes if database is not connected - shows helpful error message instead.

### 4. Helper Scripts Created
- `start-postgres.bat` - Starts PostgreSQL and sets up everything
- `create-database.bat` - Creates database and tables
- `DATABASE_SETUP.md` - Complete setup guide
- `START_POSTGRESQL.md` - PostgreSQL troubleshooting

## 🚀 Quick Start (3 Commands)

### Step 1: Start PostgreSQL
```cmd
net start postgresql-x64-16
```
(Run Command Prompt as Administrator)

### Step 2: Create Database & Tables
```cmd
create-database.bat
```

### Step 3: Start Server
```cmd
cd server
npm run dev
```

## 📋 Detailed Setup

### Option A: Automated (Recommended)
```cmd
start-postgres.bat
```
This will:
1. Start PostgreSQL service
2. Create database
3. Create all tables
4. Start the server

### Option B: Manual Steps

#### 1. Start PostgreSQL Service
**Windows Services:**
- Press `Win + R`
- Type `services.msc`
- Find "postgresql-x64-XX"
- Right-click → Start

**Command Line (as Admin):**
```cmd
net start postgresql-x64-16
```

#### 2. Create Database
```cmd
psql -U postgres
```
Password: `MYlove8`

Then:
```sql
CREATE DATABASE simuai_db;
\q
```

#### 3. Create Tables
```cmd
cd server
npx prisma db push
```

#### 4. (Optional) Seed Sample Data
```cmd
npm run db:seed
```

#### 5. Start Server
```cmd
npm run dev
```

## ✅ Verify Setup

### 1. Check Server Logs
You should see:
```
✅ Database connection established successfully via Prisma.
info: 🚀 Server running on port 5000
```

### 2. Test Registration
1. Start frontend: `cd client && npm start`
2. Go to: http://localhost:3000/register
3. Fill in registration form
4. Submit

### 3. Check Database
```cmd
psql -U postgres -d simuai_db
\dt
```
You should see tables: User, CandidateProfile, Company, Job, Application, Interview, Payment, ActivityLog

## 🔧 Troubleshooting

### Error: "Can't reach database server at localhost:5432"
**Solution:** PostgreSQL is not running
```cmd
net start postgresql-x64-16
```

### Error: "database simuai_db does not exist"
**Solution:** Create the database
```cmd
psql -U postgres -c "CREATE DATABASE simuai_db;"
```

### Error: "client password must be a string"
**Solution:** Check `server/.env` file:
```env
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
```

### Error: "relation User does not exist"
**Solution:** Tables not created
```cmd
cd server
npx prisma db push
```

### Error: "Port 5432 already in use"
**Solution:** Another PostgreSQL instance is running
```cmd
netstat -ano | findstr :5432
taskkill /PID <PID_NUMBER> /F
```

## 📊 Database Schema

Your database includes these tables:

### User
- id, email, password, role (admin/employer/candidate)
- firstName, lastName, phone, avatar
- Email verification fields
- Password reset fields
- Login tracking

### CandidateProfile
- userId, firstName, lastName
- resume, skills, experience
- education, certifications

### Company
- userId, name, logo, industry
- description, website, size
- location, isVerified
- subscription details

### Job
- companyId, title, description
- category, experienceLevel
- salary, location, type
- requirements, benefits
- status, views, applicants

### Application
- jobId, candidateId
- status, coverLetter, resume
- interviewScore, isShortlisted

### Interview
- jobId, candidateId, applicationId
- questions, responses
- status, scores, aiEvaluation
- antiCheatData

### Payment
- userId, amount, type
- status, transactionRef
- chapaReference, metadata

### ActivityLog
- userId, action, resourceType
- resourceId, metadata
- ipAddress, userAgent

## 🎯 Next Steps

1. ✅ Start PostgreSQL
2. ✅ Create database
3. ✅ Create tables
4. ✅ Start server
5. ✅ Start frontend
6. ✅ Test registration
7. ✅ Test login
8. ✅ Access dashboards

## 📝 Environment Variables

Ensure `server/.env` has:
```env
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎉 Success Indicators

When everything is working:
1. ✅ Server starts without errors
2. ✅ Database connection message appears
3. ✅ Registration creates user successfully
4. ✅ Login works
5. ✅ Dashboard loads based on role
6. ✅ No console errors

## 📚 Additional Resources

- `DATABASE_SETUP.md` - Detailed database setup
- `START_POSTGRESQL.md` - PostgreSQL troubleshooting
- `PRISMA_SETUP_GUIDE.md` - Prisma configuration
- `server/prisma/schema.prisma` - Database schema
- `server/lib/prisma.js` - Prisma client configuration

## 🆘 Still Having Issues?

1. Check PostgreSQL is installed: `psql --version`
2. Check PostgreSQL is running: `sc query | findstr postgresql`
3. Check database exists: `psql -U postgres -l`
4. Check tables exist: `psql -U postgres -d simuai_db -c "\dt"`
5. Check server logs for specific errors
6. Verify `.env` file has correct DATABASE_URL

## 🔐 Default Credentials (After Seeding)

If you run `npm run db:seed`, you get:

**Admin:**
- Email: admin@simuai.com
- Password: Admin@123

**Employer:**
- Email: employer@example.com
- Password: Employer@123

**Candidate:**
- Email: candidate@example.com
- Password: Candidate@123
