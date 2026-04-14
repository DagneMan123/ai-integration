# Saved Jobs and Job Alerts Implementation

## Overview
This document outlines the implementation of the Saved Jobs and Job Alerts features for the candidate dashboard.

## Database Schema

### SavedJob Model
```prisma
model SavedJob {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  jobId     Int       @map("job_id")
  savedAt   DateTime  @default(now()) @map("saved_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  Job  @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
  @@index([userId])
  @@index([jobId])
  @@map("saved_jobs")
}
```

### JobAlert Model
```prisma
model JobAlert {
  id            Int       @id @default(autoincrement())
  userId        Int       @map("user_id")
  jobId         Int?      @map("job_id")
  keyword       String
  location      String?
  experienceLevel String? @map("experience_level")
  jobType       String?   @map("job_type")
  isActive      Boolean   @default(true) @map("is_active")
  lastTriggered DateTime? @map("last_triggered")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  Job? @relation(fields: [jobId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([jobId])
  @@map("job_alerts")
}
```

## Backend Implementation

### Controllers

#### SavedJobController (`server/controllers/savedJobController.js`)
- `getSavedJobs()` - Retrieve all saved jobs for a candidate
- `saveJob()` - Save a job
- `removeSavedJob()` - Remove a saved job
- `isJobSaved()` - Check if a job is saved

#### JobAlertController (`server/controllers/jobAlertController.js`)
- `getJobAlerts()` - Retrieve all job alerts for a candidate
- `createJobAlert()` - Create a new job alert
- `updateJobAlert()` - Update an existing job alert
- `deleteJobAlert()` - Delete a job alert
- `getMatchingJobs()` - Get jobs matching an alert's criteria

### Routes

#### Saved Jobs Routes (`server/routes/savedJobs.js`)
```
GET    /api/saved-jobs              - Get all saved jobs
POST   /api/saved-jobs              - Save a job
GET    /api/saved-jobs/check/:jobId - Check if job is saved
DELETE /api/saved-jobs/:jobId       - Remove a saved job
```

#### Job Alerts Routes (`server/routes/jobAlerts.js`)
```
GET    /api/job-alerts              - Get all job alerts
POST   /api/job-alerts              - Create a job alert
GET    /api/job-alerts/:id/matching-jobs - Get matching jobs
PUT    /api/job-alerts/:id          - Update a job alert
DELETE /api/job-alerts/:id          - Delete a job alert
```

## Frontend Implementation

### Pages

#### SavedJobs Page (`client/src/pages/candidate/SavedJobs.tsx`)
- Displays all saved jobs for the candidate
- Search functionality to filter saved jobs
- Remove saved job functionality
- Shows saved date for each job
- Empty state when no saved jobs exist

#### JobAlerts Page (`client/src/pages/candidate/JobAlerts.tsx`)
- Displays all job alerts for the candidate
- Create new job alert form with filters:
  - Keyword (required)
  - Location (optional)
  - Experience Level (optional)
  - Job Type (optional)
- Delete job alert functionality
- Shows alert creation date and last triggered date
- Empty state when no alerts exist

### Services

#### SavedJobService (`client/src/services/savedJobService.ts`)
```typescript
- getSavedJobs(): Promise<SavedJob[]>
- saveJob(jobId: number): Promise<SavedJob>
- removeSavedJob(jobId: number): Promise<void>
- isJobSaved(jobId: number): Promise<{ isSaved: boolean }>
```

#### JobAlertService (`client/src/services/jobAlertService.ts`)
```typescript
- getJobAlerts(): Promise<JobAlert[]>
- createJobAlert(data: CreateJobAlertRequest): Promise<JobAlert>
- updateJobAlert(id: number, data: UpdateJobAlertRequest): Promise<JobAlert>
- deleteJobAlert(id: number): Promise<void>
- getMatchingJobs(alertId: number): Promise<any[]>
```

## API Endpoints

### Saved Jobs API

#### Get All Saved Jobs
```
GET /api/saved-jobs
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "jobId": 5,
      "savedAt": "2024-01-15T10:30:00Z",
      "job": {
        "id": 5,
        "title": "Senior React Developer",
        "location": "Addis Ababa",
        "company": {
          "id": 1,
          "name": "TechCorp"
        }
      }
    }
  ]
}
```

#### Save a Job
```
POST /api/saved-jobs
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "jobId": 5
}

Response:
{
  "success": true,
  "statusCode": 201,
  "data": { ... }
}
```

#### Remove a Saved Job
```
DELETE /api/saved-jobs/:jobId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Job removed from saved"
}
```

#### Check if Job is Saved
```
GET /api/saved-jobs/check/:jobId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statusCode": 200,
  "data": {
    "isSaved": true
  }
}
```

### Job Alerts API

#### Get All Job Alerts
```
GET /api/job-alerts
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "keyword": "React Developer",
      "location": "Addis Ababa",
      "experienceLevel": "Senior",
      "jobType": "full-time",
      "isActive": true,
      "lastTriggered": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

#### Create Job Alert
```
POST /api/job-alerts
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "keyword": "React Developer",
  "location": "Addis Ababa",
  "experienceLevel": "Senior",
  "jobType": "full-time"
}

Response:
{
  "success": true,
  "statusCode": 201,
  "data": { ... }
}
```

#### Update Job Alert
```
PUT /api/job-alerts/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "keyword": "React Developer",
  "isActive": true
}

Response:
{
  "success": true,
  "statusCode": 200,
  "data": { ... }
}
```

#### Delete Job Alert
```
DELETE /api/job-alerts/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Job alert deleted successfully"
}
```

#### Get Matching Jobs for Alert
```
GET /api/job-alerts/:id/matching-jobs
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": 5,
      "title": "Senior React Developer",
      "description": "...",
      "location": "Addis Ababa",
      "company": { ... }
    }
  ]
}
```

## Database Migration

Run the migration to create the new tables:
```bash
npx prisma migrate dev --name add_saved_jobs_and_alerts
```

Or manually run the SQL:
```sql
-- See server/prisma/migrations/add_saved_jobs_and_alerts.sql
```

## Features

### Saved Jobs
- ✅ Save jobs for later viewing
- ✅ View all saved jobs with search
- ✅ Remove saved jobs
- ✅ Check if a job is saved
- ✅ Display save date
- ✅ Cascade delete when user or job is deleted

### Job Alerts
- ✅ Create job alerts with keyword search
- ✅ Filter by location, experience level, and job type
- ✅ View all active alerts
- ✅ Update alert settings
- ✅ Delete alerts
- ✅ Track last triggered date
- ✅ Get matching jobs for an alert
- ✅ Enable/disable alerts

## Usage Examples

### Frontend - Save a Job
```typescript
import savedJobService from '../../services/savedJobService';

const handleSaveJob = async (jobId: number) => {
  try {
    await savedJobService.saveJob(jobId);
    toast.success('Job saved successfully');
  } catch (error) {
    toast.error('Failed to save job');
  }
};
```

### Frontend - Create Job Alert
```typescript
import jobAlertService from '../../services/jobAlertService';

const handleCreateAlert = async () => {
  try {
    const alert = await jobAlertService.createJobAlert({
      keyword: 'React Developer',
      location: 'Addis Ababa',
      experienceLevel: 'Senior',
      jobType: 'full-time'
    });
    toast.success('Alert created successfully');
  } catch (error) {
    toast.error('Failed to create alert');
  }
};
```

## Integration Points

### Jobs Page
The Jobs page can be enhanced to show a "Save" button that uses the `savedJobService.saveJob()` method.

### Job Details Page
The Job Details page can show if a job is saved and allow toggling the saved status.

### Dashboard
The candidate dashboard can show:
- Number of saved jobs
- Number of active alerts
- Recent saved jobs
- Recent alerts

## Future Enhancements

1. **Email Notifications** - Send email when new jobs match an alert
2. **Alert Frequency** - Allow users to set how often they receive notifications
3. **Smart Matching** - Use ML to improve job matching for alerts
4. **Saved Job Collections** - Organize saved jobs into custom collections
5. **Alert Analytics** - Track which alerts generate the most applications
6. **Bulk Operations** - Save/unsave multiple jobs at once
7. **Export** - Export saved jobs and alerts to CSV/PDF

## Testing

### Manual Testing Checklist
- [ ] Create a job alert with all filters
- [ ] Create a job alert with only keyword
- [ ] Update a job alert
- [ ] Delete a job alert
- [ ] Save a job
- [ ] Remove a saved job
- [ ] Search saved jobs
- [ ] Check if job is saved
- [ ] Get matching jobs for alert
- [ ] Verify cascade delete works

### API Testing
```bash
# Get saved jobs
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/saved-jobs

# Save a job
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"jobId": 5}' \
  http://localhost:5000/api/saved-jobs

# Get job alerts
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/job-alerts

# Create job alert
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "React", "location": "Addis Ababa"}' \
  http://localhost:5000/api/job-alerts
```

## Troubleshooting

### Issue: Migration fails
**Solution**: Ensure PostgreSQL is running and the database connection is valid.

### Issue: Saved jobs not loading
**Solution**: Check that the user is authenticated and has the correct token.

### Issue: Job alert creation fails
**Solution**: Ensure the keyword field is provided and is not empty.

## Support
For issues or questions, refer to the main documentation or contact the development team.
