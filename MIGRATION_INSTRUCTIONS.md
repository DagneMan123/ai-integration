# 🚀 Saved Jobs & Job Alerts - Migration Instructions

## Current Status
✅ Code is ready
❌ Database tables need to be created

## What's Happening
The error `Cannot read properties of undefined (reading 'create')` means the `jobAlert` table doesn't exist in the database yet. We need to run a Prisma migration to create it.

## Quick Fix (Choose One)

### Option 1: Using npm script (Recommended)
```bash
cd server
npm run db:migrate
```

When prompted, enter a name for the migration (or just press Enter to use the default).

### Option 2: Using Prisma CLI directly
```bash
cd server
npx prisma migrate dev --name add_saved_jobs_and_alerts
```

### Option 3: Using the helper script
```bash
cd server
node scripts/runMigration.js
```

## What the Migration Does

Creates two new database tables:

1. **saved_jobs** - Stores bookmarked jobs
   - Columns: id, user_id, job_id, saved_at
   - Unique constraint on (user_id, job_id)

2. **job_alerts** - Stores job search alerts
   - Columns: id, user_id, job_id, keyword, location, experience_level, job_type, is_active, last_triggered, created_at, updated_at

## Step-by-Step Instructions

### Step 1: Open Terminal
Open a terminal/command prompt in your project directory.

### Step 2: Navigate to Server
```bash
cd server
```

### Step 3: Run Migration
```bash
npm run db:migrate
```

### Step 4: Confirm
When prompted, you should see:
```
✔ Enter a name for the new migration: › add_saved_jobs_and_alerts
✔ Your database is now in sync with your schema. Prisma has created the following migration:

migrations/
  └─ 20260413_add_saved_jobs_and_alerts/
    └─ migration.sql

✔ Generated Prisma Client (v5.7.1) to ./node_modules/@prisma/client in 234ms
```

### Step 5: Server Restarts
The server will automatically restart with nodemon. You should see:
```
[nodemon] restarting due to changes...
[nodemon] starting `node index.js`
info: 🚀 Server running on port 5000
```

### Step 6: Test
Navigate to:
- **Saved Jobs**: http://localhost:3000/candidate/saved-jobs
- **Job Alerts**: http://localhost:3000/candidate/job-alerts

## Troubleshooting

### Issue: "Can't reach database server at localhost:5432"
**Solution:**
- Ensure PostgreSQL is running
- Windows: `Start-Service -Name "postgresql-x64-15"`
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```bash
cd server
npm install
npm run db:migrate
```

### Issue: "Migration already exists"
**Solution:** This is fine. Just run:
```bash
npm run db:migrate
```
Prisma will detect the existing migration and apply it.

### Issue: "Permission denied"
**Solution:** Try with sudo (Mac/Linux):
```bash
sudo npm run db:migrate
```

### Issue: Still getting "Cannot read properties of undefined"
**Solution:**
1. Verify migration ran: `npx prisma migrate status`
2. Check tables exist: `npx prisma studio` (opens UI to view database)
3. Restart server: Stop and run `npm run dev` again

## Verify Migration Success

### Method 1: Check Prisma Studio
```bash
cd server
npx prisma studio
```
Look for `saved_jobs` and `job_alerts` tables in the UI.

### Method 2: Check with psql
```bash
psql -U postgres -d simuai_db
\dt
```
You should see both tables listed.

### Method 3: Check logs
The server logs should show:
```
✅ Database tables initialized successfully
```

## After Migration

1. ✅ Server should be running without errors
2. ✅ Navigate to Saved Jobs page - should load
3. ✅ Navigate to Job Alerts page - should load
4. ✅ Try creating a job alert - should work
5. ✅ Try saving a job - should work

## API Endpoints Now Available

```
GET    /api/saved-jobs              - Get all saved jobs
POST   /api/saved-jobs              - Save a job
GET    /api/saved-jobs/check/:jobId - Check if saved
DELETE /api/saved-jobs/:jobId       - Remove saved job

GET    /api/job-alerts              - Get all alerts
POST   /api/job-alerts              - Create alert
PUT    /api/job-alerts/:id          - Update alert
DELETE /api/job-alerts/:id          - Delete alert
GET    /api/job-alerts/:id/matching-jobs - Get matching jobs
```

## Need Help?

1. Check the full documentation: `SAVED_JOBS_AND_ALERTS_IMPLEMENTATION.md`
2. Review the setup guide: `SAVED_JOBS_ALERTS_QUICK_START.md`
3. Check server logs for specific errors
4. Verify PostgreSQL is running and accessible

---

**Next Step**: Run `npm run db:migrate` in the server directory

**Time to Complete**: ~2 minutes
