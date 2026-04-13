# How to Populate Dashboard with Test Data

## Problem
The candidate dashboard appears empty because there's no test data in the database.

## Solution

### Option 1: Run Prisma Seed (Recommended)

The database seed script has been updated to create test data for all dashboards.

**Steps:**

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Run the Prisma seed command:**
   ```bash
   npx prisma db seed
   ```

3. **Or run the seed script directly:**
   ```bash
   node prisma/seed.js
   ```

### Option 2: Manual Database Reset and Seed

If you want to start fresh:

```bash
cd server

# Reset the database (WARNING: This deletes all data)
npx prisma migrate reset

# This will automatically run the seed script
```

## Test Credentials

After seeding, use these credentials to test the dashboards:

### Admin Dashboard
- **Email:** admin@simuai.com
- **Password:** admin123
- **Role:** Admin

### Employer Dashboard
- **Email:** employer@techcorp.com
- **Password:** employer123
- **Role:** Employer

### Candidate Dashboard
- **Email:** candidate@example.com
- **Password:** candidate123
- **Role:** Candidate

## What Gets Created

### Users
- 1 Admin user
- 1 Employer user
- 1 Candidate user

### Company
- 1 Company: "TechCorp Ethiopia"

### Jobs
- 3 Job postings:
  1. Senior Full Stack Developer
  2. Frontend Developer
  3. Backend Developer

### Applications
- 3 Applications (one for each job)
- Different statuses: PENDING, ACCEPTED, REJECTED

### Interviews
- 3 Interviews (one for each job)
- Different statuses: SCHEDULED, COMPLETED, IN_PROGRESS
- Completed interviews have scores (75-95)

### Additional Data
- Candidate profile with skills and experience
- Activity logs
- Credit bundles
- Wallet with 5 credits for candidate

## Expected Dashboard Display

### Candidate Dashboard Should Show:
- ✅ 3 Applications (with different statuses)
- ✅ 3 Interviews (with different statuses)
- ✅ Average interview score (calculated from completed interviews)
- ✅ Recent interview history
- ✅ Application statistics

### Employer Dashboard Should Show:
- ✅ 3 Jobs posted
- ✅ 3 Applications received
- ✅ 3 Interviews scheduled
- ✅ Recent candidates
- ✅ Job statistics

### Admin Dashboard Should Show:
- ✅ 3 Total users
- ✅ 3 Jobs in system
- ✅ 3 Applications
- ✅ 3 Interviews
- ✅ 1 Company
- ✅ System health status

## Troubleshooting

### Dashboard Still Empty?

1. **Check if seed ran successfully:**
   - Look for log messages indicating data creation
   - Check database directly using a database client

2. **Verify authentication:**
   - Make sure you're logged in with the correct credentials
   - Check browser console for API errors

3. **Check API responses:**
   - Open browser DevTools → Network tab
   - Look for `/dashboard/candidate` request
   - Check the response data

4. **Verify database connection:**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in .env file

### If Data Still Doesn't Appear

Try the manual reset:

```bash
cd server
npx prisma migrate reset
```

This will:
1. Drop the database
2. Recreate it
3. Run all migrations
4. Run the seed script

## Manual Data Creation (Alternative)

If you prefer to create data manually through the UI:

1. **Create a job:**
   - Login as employer
   - Go to Jobs section
   - Create a new job posting

2. **Apply for a job:**
   - Login as candidate
   - Browse jobs
   - Apply for the job you created

3. **Schedule an interview:**
   - Login as employer
   - Go to applications
   - Schedule an interview with the candidate

4. **Complete an interview:**
   - Login as candidate
   - Go to interviews
   - Complete the interview

This will populate the dashboards with real data.

## Database Schema

The seed creates data in this order:

```
Users (Admin, Employer, Candidate)
    ↓
Company (created by Employer)
    ↓
Jobs (created by Employer for Company)
    ↓
Applications (Candidate applies for Jobs)
    ↓
Interviews (created for Applications)
    ↓
Activity Logs (track all actions)
    ↓
Credit Bundles (for payments)
    ↓
Wallet (for Candidate)
```

## Next Steps

After populating the data:

1. **Test Candidate Dashboard:**
   - Login with candidate@example.com
   - Verify applications, interviews, and scores display

2. **Test Employer Dashboard:**
   - Login with employer@techcorp.com
   - Verify jobs, applications, and interviews display

3. **Test Admin Dashboard:**
   - Login with admin@simuai.com
   - Verify all platform metrics display

4. **Test Cross-Dashboard Communication:**
   - Make changes in one dashboard
   - Verify updates appear in other dashboards

## Notes

- The seed script is idempotent (safe to run multiple times)
- Existing data won't be duplicated
- You can modify the seed script to create different test data
- The seed file is located at: `server/prisma/seed.js`
