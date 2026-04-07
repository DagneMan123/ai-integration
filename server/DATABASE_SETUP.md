# Database Setup Guide

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 16+ installed
- `.env` file configured with `DATABASE_URL`

## Setup Steps

### 1. Ensure PostgreSQL is Running

**Windows:**
```powershell
Start-Service -Name "postgresql-x64-15"
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### 2. Create Database (if not exists)

```bash
createdb simuai_db
```

Or using psql:
```sql
CREATE DATABASE simuai_db;
```

### 3. Run Database Setup

```bash
node server/setup-db.js
```

This will:
- Run all Prisma migrations
- Create all required tables
- Set up relationships and constraints

### 4. Verify Setup

Check that all tables were created:
```bash
npx prisma studio
```

This opens an interactive database browser at `http://localhost:5555`

## Tables Created

- `User` - User accounts
- `Company` - Employer companies
- `Job` - Job postings
- `Application` - Job applications
- `Interview` - Interview sessions
- `DashboardMessage` - Cross-dashboard communication
- `ApplicationActivity` - Application activity logs
- `InterviewActivity` - Interview activity logs
- `DashboardNotification` - Dashboard notifications
- `SystemUpdate` - System-wide updates
- And more...

## Troubleshooting

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `psql -l`

### "relation does not exist"
- Run migrations again: `npx prisma migrate deploy`
- Check migration status: `npx prisma migrate status`

### "Invalid value for argument `status`"
- This is fixed in the latest code
- Ensure you're using the correct enum values from schema.prisma

## Reset Database (Development Only)

⚠️ **WARNING: This deletes all data!**

```bash
npx prisma migrate reset
```

Then run setup again:
```bash
node server/setup-db.js
```

## Next Steps

1. Start the server: `npm run dev`
2. Server will connect to database automatically
3. All dashboard communication features will work
