# Why Dashboard Shows 0 - Database Communication Working

## ✅ Good News

Your dashboard **IS communicating with the database correctly**. The reason it shows 0 is because:

**There is no data in the database yet.**

---

## 🔄 How Dashboard-Database Communication Works

```
Dashboard (Frontend)
    ↓ API Call: GET /api/analytics/candidate/dashboard
Backend (Node.js)
    ↓ Query Database: SELECT COUNT(*) FROM applications WHERE candidateId = ?
Database (PostgreSQL)
    ↓ Returns: 0 (no applications found)
Backend
    ↓ Response: { applications: 0, interviews: 0, averageScore: 0 }
Dashboard
    ↓ Display: Shows 0 for all metrics
```

---

## 📊 To Populate Dashboard with Data

Follow these steps to create data:

### Step 1: Create a Job (as Employer)
1. Login as employer: `employer@test.com` / `Test@123`
2. Go to "Create Job"
3. Fill in job details
4. Click "Create"
5. Job is now in database

### Step 2: Apply for Job (as Candidate)
1. Logout and login as candidate: `candidate@test.com` / `Test@123`
2. Go to "Jobs"
3. Find the job created by employer
4. Click "Apply"
5. Application is now in database

### Step 3: Start Interview (AI Generates Questions)
1. Go to "My Interviews"
2. Find the interview for the job
3. Click "Start Interview"
4. AI generates questions
5. Interview is now in database

### Step 4: Answer Questions (AI Evaluates)
1. Read each question
2. Type your answer
3. Click "Submit Answer"
4. AI evaluates and stores response
5. Responses are now in database

### Step 5: Complete Interview (AI Generates Report)
1. After all questions, click "Complete Interview"
2. AI generates comprehensive report
3. Interview marked as COMPLETED
4. Report stored in database

### Step 6: View Dashboard
1. Go to Candidate Dashboard
2. Now shows:
   - Applications: 1
   - Interviews: 1
   - Average Score: (AI score)

---

## 🔍 Verify Connection is Working

Run this command to test:
```bash
node test-dashboard-connection.js
```

Expected output:
```
✅ Login successful
✅ Dashboard data fetched:
   Applications: 0
   Interviews: 0
   Average Score: 0
```

This confirms the connection is working. The 0 values are correct because there's no data yet.

---

## 📋 API Endpoints Being Used

**Candidate Dashboard**:
- `GET /api/analytics/candidate/dashboard` - Fetches dashboard data
- `GET /api/interviews/my-interviews` - Fetches interviews
- `GET /api/applications/my-applications` - Fetches applications

**Employer Dashboard**:
- `GET /api/analytics/employer/dashboard` - Fetches dashboard data
- `GET /api/jobs` - Fetches jobs
- `GET /api/applications/job/:jobId` - Fetches job applications

**Admin Dashboard**:
- `GET /api/analytics/admin/dashboard` - Fetches dashboard data
- `GET /api/admin/users` - Fetches all users
- `GET /api/admin/jobs` - Fetches all jobs

---

## ✅ Database Communication Checklist

- ✅ Frontend sends API request
- ✅ Backend receives request
- ✅ Backend queries database
- ✅ Database returns data (0 if no data exists)
- ✅ Backend sends response
- ✅ Frontend displays data

**All steps working correctly!**

---

## 🎯 Next Steps

1. **Create test data** following the steps above
2. **Refresh dashboard** to see updated numbers
3. **Complete interview flow** to populate all metrics
4. **Dashboard will show real data** from database

---

**Status**: ✅ Dashboard-Database Communication Working  
**Issue**: No data in database yet  
**Solution**: Create test data following the steps above

