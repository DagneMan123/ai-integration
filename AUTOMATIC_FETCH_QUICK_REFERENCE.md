# Automatic Data Fetching - Quick Reference

## One-Line Fetching

### Interviews
```javascript
const interviews = await fetchInterviewsWithJob({ candidateId: userId });
const interview = await fetchInterviewWithJob(interviewId);
```

### Applications
```javascript
const apps = await fetchApplicationsWithJob({ jobId: jobId });
const app = await fetchApplicationWithJob(appId);
```

### Jobs
```javascript
const jobs = await fetchJobsWithCompany({ companyId: companyId });
const job = await fetchJobWithCompany(jobId);
```

## Import
```javascript
const { 
  fetchInterviewsWithJob,
  fetchInterviewWithJob,
  fetchApplicationsWithJob,
  fetchApplicationWithJob,
  fetchJobsWithCompany,
  fetchJobWithCompany
} = require('../utils/queryHelpers');
```

## What You Get

### Interviews
```javascript
{
  _id, id, job: { title, company: { name } }, 
  status, interviewMode, aiEvaluation, createdAt
}
```

### Applications
```javascript
{
  _id, id, job: { title, company }, 
  candidate: { email }, status, appliedAt
}
```

### Jobs
```javascript
{
  _id, id, title, company: { name }, 
  requiredSkills, status, createdAt
}
```

## Before vs After

### Before ❌
```javascript
const interviews = await prisma.interview.findMany({
  where: { candidateId: userId },
  include: { job: { include: { company: true } } }
});
const formatted = interviews.map(i => ({
  _id: i.id, id: i.id, job: i.job, status: i.status?.toLowerCase(),
  // ... 10+ more fields
}));
res.json({ success: true, data: formatted });
```

### After ✅
```javascript
const interviews = await fetchInterviewsWithJob({ candidateId: userId });
res.json({ success: true, data: interviews });
```

## Usage in Controllers

```javascript
// Interview Controller
exports.getCandidateInterviews = async (req, res, next) => {
  try {
    const interviews = await fetchInterviewsWithJob(
      { candidateId: req.user.id },
      { orderBy: { startedAt: 'desc' } }
    );
    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};
```

## Options Parameter

```javascript
// All Prisma options work
await fetchInterviewsWithJob(where, {
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});
```

## Status

✅ Interview Controller - All functions updated
⏳ Other Controllers - Ready to update

## Benefits

- 🚀 One-line queries
- 📦 Automatic includes
- 🎨 Automatic formatting
- 🔄 Consistent data
- 🛡️ Type-safe
- 📈 Scalable
