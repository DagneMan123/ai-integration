# Saved Jobs & Job Alerts - Quick Start Guide

## What's New

The Saved Jobs and Job Alerts features are now fully functional in the candidate dashboard.

## Files Created/Modified

### Backend
- ✅ `server/controllers/savedJobController.js` - Saved jobs logic
- ✅ `server/controllers/jobAlertController.js` - Job alerts logic
- ✅ `server/routes/savedJobs.js` - Saved jobs API routes
- ✅ `server/routes/jobAlerts.js` - Job alerts API routes
- ✅ `server/prisma/schema.prisma` - Added SavedJob and JobAlert models
- ✅ `server/prisma/migrations/add_saved_jobs_and_alerts.sql` - Database migration
- ✅ `server/index.js` - Registered new routes

### Frontend
- ✅ `client/src/pages/candidate/SavedJobs.tsx` - Saved jobs page (fully functional)
- ✅ `client/src/pages/candidate/JobAlerts.tsx` - Job alerts page (fully functional)
- ✅ `client/src/services/savedJobService.ts` - Saved jobs API service
- ✅ `client/src/services/jobAlertService.ts` - Job alerts API service

## Setup Instructions

### 1. Run Database Migration
```bash
cd server
npx prisma migrate dev --name add_saved_jobs_and_alerts
```

### 2. Restart Server
```bash
npm start
```

### 3. Access Features
- **Saved Jobs**: Navigate to Candidate Dashboard → Saved Jobs
- **Job Alerts**: Navigate to Candidate Dashboard → Job Alerts

## Features

### Saved Jobs
- 📌 Save jobs for later viewing
- 🔍 Search saved jobs by title or company
- 🗑️ Remove saved jobs
- 📅 View when each job was saved
- ✨ Clean, intuitive UI

### Job Alerts
- 🔔 Create alerts with keyword search
- 🎯 Filter by location, experience level, job type
- 📊 View all active alerts
- ✏️ Update alert settings
- 🗑️ Delete alerts
- 📈 Track last triggered date

## API Endpoints

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

## Usage Examples

### Save a Job (Frontend)
```typescript
import savedJobService from '../../services/savedJobService';

const handleSaveJob = async (jobId: number) => {
  try {
    await savedJobService.saveJob(jobId);
    toast.success('Job saved!');
  } catch (error) {
    toast.error('Failed to save job');
  }
};
```

### Create Job Alert (Frontend)
```typescript
import jobAlertService from '../../services/jobAlertService';

const handleCreateAlert = async () => {
  try {
    await jobAlertService.createJobAlert({
      keyword: 'React Developer',
      location: 'Addis Ababa',
      experienceLevel: 'Senior'
    });
    toast.success('Alert created!');
  } catch (error) {
    toast.error('Failed to create alert');
  }
};
```

## Testing

### Test Saved Jobs
1. Go to Jobs page
2. Click bookmark icon on a job
3. Navigate to Saved Jobs
4. Verify job appears in the list
5. Test search functionality
6. Test remove functionality

### Test Job Alerts
1. Go to Job Alerts page
2. Click "Create Alert"
3. Fill in keyword (required) and optional filters
4. Click "Create Alert"
5. Verify alert appears in the list
6. Test delete functionality
7. Test update functionality

## Database Schema

### SavedJob Table
```sql
CREATE TABLE saved_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);
```

### JobAlert Table
```sql
CREATE TABLE job_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  keyword TEXT NOT NULL,
  location TEXT,
  experience_level TEXT,
  job_type TEXT,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Issue: "Failed to load saved jobs"
- Check that user is authenticated
- Verify API token is valid
- Check browser console for errors

### Issue: "Job alert creation failed"
- Ensure keyword field is filled
- Check that all required fields are provided
- Verify API is running

### Issue: Migration fails
- Ensure PostgreSQL is running
- Check database connection string
- Run: `npx prisma db push` if needed

## Next Steps

1. ✅ Test all features thoroughly
2. ✅ Integrate save button on Jobs page
3. ✅ Add email notifications for alerts
4. ✅ Create dashboard widgets for saved jobs/alerts
5. ✅ Add analytics for alert performance

## Support

For issues or questions:
1. Check the full documentation: `SAVED_JOBS_AND_ALERTS_IMPLEMENTATION.md`
2. Review API responses in browser DevTools
3. Check server logs for errors
4. Verify database migration ran successfully

---

**Status**: ✅ Fully Implemented and Functional
**Last Updated**: 2024
