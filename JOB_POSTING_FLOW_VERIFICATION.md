# Job Posting Flow - Verification Guide

## System Overview
The job posting system is fully configured to show employer-posted jobs in the candidate's "Explore Opportunities" section.

## How It Works

### 1. Employer Posts a Job
- Employer navigates to `/employer/jobs` → "Post a New Job"
- Fills in job details (title, description, location, skills, salary, etc.)
- Clicks "Publish Job Posting"
- Job is created with status `ACTIVE` in the database

### 2. Job Appears in Candidate Portal
- Candidate navigates to `/jobs` (Explore Opportunities)
- The page fetches all jobs with status `ACTIVE`
- Jobs are displayed in a searchable, filterable list
- Candidate can click on any job to view details

## API Endpoints

### Create Job (Employer Only)
```
POST /api/jobs
Headers: Authorization: Bearer {token}
Body: {
  title: string,
  description: string,
  location: string,
  requiredSkills: string[],
  experienceLevel: string,
  jobType: string,
  interviewType: string,
  salaryMin?: number,
  salaryMax?: number
}
Response: { success: true, data: { id, title, ... } }
```

### Get All Jobs (Public)
```
GET /api/jobs?search=&experienceLevel=&location=&page=1&limit=10
Response: { success: true, data: [...], pagination: {...} }
```

### Get Single Job (Public)
```
GET /api/jobs/{id}
Response: { success: true, data: { id, title, company, ... } }
```

## Database Schema

### Job Model (Prisma)
```prisma
model Job {
  id              Int       @id @default(autoincrement())
  title           String
  description     String
  location        String
  requiredSkills  String[]
  experienceLevel String
  jobType         String
  interviewType   String
  status          String    @default("ACTIVE")  // ACTIVE, CLOSED, DRAFT
  companyId       Int
  createdById     Int
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  company         Company   @relation(fields: [companyId], references: [id])
  applications    Application[]
  interviews      Interview[]
}
```

## Frontend Components

### Employer Side
- **CreateJob.tsx** - Form to post new jobs
- **Jobs.tsx** (employer) - List of employer's posted jobs

### Candidate Side
- **Jobs.tsx** - "Explore Opportunities" page showing all active jobs
- **JobDetails.tsx** - Single job detail view

## Testing Checklist

- [ ] Employer can create a job
- [ ] Job appears in employer's job list
- [ ] Job appears in candidate's "Explore Opportunities"
- [ ] Search filters work correctly
- [ ] Job details page loads correctly
- [ ] Candidate can apply to job

## Troubleshooting

### Jobs not appearing in candidate portal
1. Check job status is `ACTIVE` in database
2. Verify employer is authenticated when posting
3. Check company profile exists for employer
4. Verify API response includes job data

### Job creation fails
1. Ensure employer has completed company profile
2. Check all required fields are provided
3. Verify authentication token is valid
4. Check server logs for detailed error

## Quick Test Commands

```bash
# Test job creation
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "We are hiring...",
    "location": "Addis Ababa",
    "requiredSkills": ["React", "Node.js"],
    "experienceLevel": "senior",
    "jobType": "full-time",
    "interviewType": "technical"
  }'

# Test get all jobs
curl http://localhost:5000/api/jobs
```
