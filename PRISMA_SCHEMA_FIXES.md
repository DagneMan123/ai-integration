# Enhanced Dashboards - Prisma Schema Fixes

## Issue
The enhanced dashboard controller was trying to include `interview` relationship on the `Application` model, but this relationship doesn't exist in the Prisma schema.

**Error**:
```
Unknown field `interview` for include statement on model `Application`. 
Available options are listed in green.
```

## Root Cause
The `Application` model in the Prisma schema has these relationships:
- `job` (Job)
- `candidate` (User)

But NOT `interview`. The `Interview` model is a separate entity with its own relationships to `Job` and `User` (candidate).

## Solution
Refactored the enhanced dashboard controller to:
1. Query `Application` with only its available relationships (`job`, `candidate`)
2. Query `Interview` separately
3. Map interviews to applications using `jobId` and `candidateId`

## Changes Made

### File: `server/controllers/enhancedDashboardController.js`

#### Candidate Dashboard Function
**Before**:
```javascript
const applications = await prisma.application.findMany({
  where: { candidateId: userId },
  include: {
    job: { include: { company: true } },
    interview: {  // ❌ WRONG - doesn't exist
      select: { overallScore: true, ... }
    }
  }
});
```

**After**:
```javascript
// Get applications
const applications = await prisma.application.findMany({
  where: { candidateId: userId },
  include: {
    job: { include: { company: true } }
  }
});

// Get interviews separately
const interviews = await prisma.interview.findMany({
  where: { candidateId: userId },
  select: { id: true, jobId: true, overallScore: true, ... }
});

// Map interviews to applications
const interviewMap = new Map();
interviews.forEach(interview => {
  interviewMap.set(interview.jobId, interview);
});

// Use in response
applications.map(app => ({
  ...app,
  aiScore: interviewMap.get(app.jobId)?.overallScore || null
}))
```

#### Employer Dashboard Function
**Before**:
```javascript
const applicants = await prisma.application.findMany({
  include: {
    candidate: { ... },
    interview: {  // ❌ WRONG
      select: { overallScore: true, ... }
    }
  },
  orderBy: { interview: { overallScore: 'desc' } }  // ❌ WRONG
});
```

**After**:
```javascript
// Get applications
const applications = await prisma.application.findMany({
  where: { job: { createdById: userId } },
  include: {
    candidate: { ... },
    job: { select: { id: true, title: true } }
  }
});

// Get interviews separately
const interviews = await prisma.interview.findMany({
  where: { job: { createdById: userId } },
  select: { candidateId: true, jobId: true, overallScore: true, ... }
});

// Map and sort by AI score
const interviewMap = new Map();
interviews.forEach(interview => {
  const key = `${interview.candidateId}-${interview.jobId}`;
  interviewMap.set(key, interview);
});

// Sort applicants by AI score
applicants.sort((a, b) => 
  (interviewMap.get(`${a.candidateId}-${a.jobId}`)?.overallScore || 0) -
  (interviewMap.get(`${b.candidateId}-${b.jobId}`)?.overallScore || 0)
);
```

## Prisma Schema Relationships

### Application Model
```prisma
model Application {
  id          Int
  jobId       Int
  candidateId Int
  status      ApplicationStatus
  
  job       Job  @relation(fields: [jobId], references: [id])
  candidate User @relation(fields: [candidateId], references: [id])
}
```

### Interview Model
```prisma
model Interview {
  id          Int
  jobId       Int
  candidateId Int
  applicationId Int?
  overallScore Int?
  
  job       Job  @relation(fields: [jobId], references: [id])
  candidate User @relation(fields: [candidateId], references: [id])
}
```

## Key Points

1. **No Direct Relationship**: `Application` doesn't have a direct `interview` field
2. **Separate Queries**: Must query `Interview` separately from `Application`
3. **Manual Mapping**: Use `jobId` and `candidateId` to correlate data
4. **Sorting**: Sort applicants in memory after fetching, not in Prisma query

## Testing

The API endpoints should now work correctly:
- `GET /api/dashboard-enhanced/candidate` - Candidate dashboard
- `GET /api/dashboard-enhanced/employer` - Employer dashboard  
- `GET /api/dashboard-enhanced/admin` - Admin dashboard

## Status

✅ **FIXED** - All Prisma schema relationship errors resolved

---

**Fix Date**: April 18, 2026
**Status**: Complete
**Ready for**: Testing & Deployment
