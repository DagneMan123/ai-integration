# Setup Guide: Saved Jobs & Job Alerts

## Issue
The Saved Jobs and Job Alerts features require database migration to create the necessary tables.

## Solution

### Step 1: Run the Database Migration

Open a terminal in the server directory and run:

```bash
cd server
npx prisma migrate dev --name add_saved_jobs_and_alerts
```

This will:
1. Create the `saved_jobs` table
2. Create the `job_alerts` table
3. Set up all necessary indexes and foreign keys
4. Generate Prisma client types

### Step 2: Verify Migration

After the migration completes, you should see:
- ✅ Migration created successfully
- ✅ Prisma client generated

### Step 3: Restart the Server

The server will automatically restart with nodemon. If not, manually restart:

```bash
npm run dev
```

### Step 4: Test the Features

1. **Test Saved Jobs:**
   - Navigate to Candidate Dashboard → Saved Jobs
   - Try to save a job
   - Verify it appears in the Saved Jobs list

2. **Test Job Alerts:**
   - Navigate to Candidate Dashboard → Job Alerts
   - Click "Create Alert"
   - Fill in the form and create an alert
   - Verify it appears in the alerts list

## Database Tables Created

### saved_jobs
```sql
CREATE TABLE "saved_jobs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "job_id" INTEGER NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
    "saved_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "job_id")
);
```

### job_alerts
```sql
CREATE TABLE "job_alerts" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "job_id" INTEGER REFERENCES "jobs"("id") ON DELETE SET NULL,
    "keyword" TEXT NOT NULL,
    "location" TEXT,
    "experience_level" TEXT,
    "job_type" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "last_triggered" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP
);
```

## Troubleshooting

### Issue: "prisma.jobAlert is undefined"
**Solution:** Run the migration command above. The tables don't exist yet.

### Issue: Migration fails with "database already exists"
**Solution:** This is normal. Prisma will update the schema. Continue with Step 3.

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Run `npm install` in the server directory first.

### Issue: Port 5432 connection error
**Solution:** Ensure PostgreSQL is running:
- Windows: `Start-Service -Name "postgresql-x64-15"`
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

## API Endpoints (After Migration)

### Saved Jobs
```
GET    /api/saved-jobs              - Get all saved jobs
POST   /api/saved-jobs              - Save a job
GET    /api/saved-jobs/check/:jobId - Check if saved
DELETE /api/saved-jobs/:jobId       - Remove saved job
```

### Job Alerts
```
GET    /api/job-alerts              - Get all alerts
POST   /api/job-alerts              - Create alert
PUT    /api/job-alerts/:id          - Update alert
DELETE /api/job-alerts/:id          - Delete alert
GET    /api/job-alerts/:id/matching-jobs - Get matching jobs
```

## Next Steps

1. ✅ Run the migration
2. ✅ Restart the server
3. ✅ Test the features
4. ✅ Integrate save buttons on Jobs page (optional)
5. ✅ Set up email notifications (optional)

## Support

If you encounter any issues:
1. Check the server logs for error messages
2. Verify PostgreSQL is running
3. Ensure the migration ran successfully
4. Check that the tables were created: `\dt` in psql

---

**Status**: Ready for Migration
**Last Updated**: 2026-04-13
