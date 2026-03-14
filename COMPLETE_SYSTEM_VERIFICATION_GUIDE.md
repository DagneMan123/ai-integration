# 🔍 Complete System Verification Guide

## Overview
This guide provides step-by-step verification that all dashboards communicate with the database and AI integration works end-to-end.

---

## ✅ STEP 1: Verify System Prerequisites

### 1.1 PostgreSQL Running
```bash
# Check if PostgreSQL is running
net start postgresql-x64-16

# Expected output: The PostgreSQL-x64-16 service is already running.
```

### 1.2 Database Exists
```bash
# Connect to PostgreSQL
psql -U postgres -d simuai_db

# Expected: Connected to simuai_db database
# Type: \dt (to list tables)
# Type: \q (to quit)
```

### 1.3 Environment Variables Configured
Check `server/.env`:
- ✅ `DATABASE_URL` = `postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public&connection_limit=10`
- ✅ `OPENAI_API_KEY` = Configured (for AI features)
- ✅ `JWT_SECRET` = Configured
- ✅ `PORT` = 5000

---

## ✅ STEP 2: Start Backend Server

```bash
cd server
npm run dev
```

**Expected Output:**
```
✅ Database connection established successfully via Prisma.
Server running on port 5000
```

**Verify Server is Running:**
```bash
curl http://localhost:5000/health
# Expected: { "status": "OK", "timestamp": "..." }
```

---

## ✅ STEP 3: Start Frontend Application

```bash
cd client
npm start
```

**Expected:** Application opens at `http://localhost:3000`

---

## ✅ STEP 4: Verify Database Connections

### 4.1 Check Prisma Connection
```bash
cd server
npx prisma studio
```

**Expected:** Prisma Studio opens at `http://localhost:5555`
- You should see all database tables
- Tables include: User, Job, Interview, Application, Payment, etc.

### 4.2 Verify Database Tables
In Prisma Studio, check these tables exist:
- [ ] `User` - Stores user data (candidates, employers, admins)
- [ ] `Job` - Stores job postings
- [ ] `Interview` - Stores interview sessions with AI data
- [ ] `Application` - Stores job applications
- [ ] `Payment` - Stores payment records
- [ ] `Company` - Stores company profiles

---

## ✅ STEP 5: Test Candidate Dashboard ↔ Database

### 5.1 Register as Candidate
1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill form:
   - Email: `candidate@test.com`
   - Password: `Test@123`
   - Role: Candidate
4. Click "Register"

**Expected:** Redirected to login page

### 5.2 Login as Candidate
1. Email: `candidate@test.com`
2. Password: `Test@123`
3. Click "Login"

**Expected:** Redirected to Candidate Dashboard

### 5.3 Verify Dashboard Data Loads
**Check in Browser DevTools (F12):**
1. Go to Network tab
2. Look for API calls:
   - `GET /api/interviews` - Should return empty array `[]`
   - `GET /api/applications` - Should return empty array `[]`
   - `GET /api/users/:id` - Should return candidate profile

**Expected:** All API calls return 200 status with data

### 5.4 Verify Data in Database
```bash
# In Prisma Studio, check User table
# You should see: candidate@test.com with role: CANDIDATE
```

---

## ✅ STEP 6: Test Employer Dashboard ↔ Database

### 6.1 Register as Employer
1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill form:
   - Email: `employer@test.com`
   - Password: `Test@123`
   - Role: Employer
4. Click "Register"

### 6.2 Login as Employer
1. Email: `employer@test.com`
2. Password: `Test@123`
3. Click "Login"

**Expected:** Redirected to Employer Dashboard

### 6.3 Create a Job
1. Click "Create Job" button
2. Fill form:
   - Title: "Senior Developer"
   - Description: "Looking for experienced developer"
   - Required Skills: "JavaScript, React, Node.js"
   - Experience Level: "Senior"
3. Click "Create"

**Expected:** Job created successfully

### 6.4 Verify Job in Database
**Check in Browser DevTools:**
1. Network tab should show: `POST /api/jobs` with 201 status

**Check in Prisma Studio:**
1. Go to Job table
2. You should see the job you just created

---

## ✅ STEP 7: Test AI Integration - Interview Flow

### 7.1 Candidate Applies for Job
1. Logout from employer account
2. Login as candidate (`candidate@test.com`)
3. Go to "Jobs" page
4. Find the job created by employer
5. Click "Apply"

**Expected:** Application created successfully

**Verify in Database:**
- Check Application table in Prisma Studio
- Should show application with status: `APPLIED`

### 7.2 Start Interview (AI Generates Questions)
1. Go to "My Interviews" or "Interviews" page
2. Find the interview for the job
3. Click "Start Interview"

**Expected Output:**
- Interview starts
- AI generates 10 interview questions
- Questions displayed on screen

**Check in Browser DevTools:**
1. Network tab should show: `POST /api/interviews/start`
2. Response should include `questions` array with AI-generated questions

**Check in Database:**
- Interview table should have new record
- Interview should have `questions` field populated
- Status should be: `IN_PROGRESS`

### 7.3 Answer Questions (AI Evaluates)
1. Read first question
2. Type answer
3. Click "Submit Answer"

**Expected Output:**
- AI evaluates answer
- Shows score and feedback
- Displays next question

**Check in Browser DevTools:**
1. Network tab should show: `POST /api/interviews/:id/submit-answer`
2. Response should include:
   - `score` - AI evaluation score
   - `feedback` - AI feedback on answer
   - `nextQuestion` - Next question to answer

**Check in Database:**
- Interview record should have `responses` array
- Each response should have:
  - `answer` - Candidate's answer
  - `score` - AI evaluation score
  - `feedback` - AI feedback

### 7.4 Complete Interview (AI Generates Report)
1. Answer all questions
2. Click "Complete Interview"

**Expected Output:**
- Interview completes
- AI generates comprehensive report
- Redirected to report page

**Check in Browser DevTools:**
1. Network tab should show: `POST /api/interviews/:id/complete`
2. Response should include:
   - `overallScore` - Overall performance score
   - `integrityScore` - Integrity/anti-cheat score
   - `reportAvailable` - true

**Check in Database:**
- Interview status should be: `COMPLETED`
- Interview should have `evaluation` field with AI report
- Interview should have scores:
  - `overallScore`
  - `technicalScore`
  - `communicationScore`
  - `problemSolvingScore`
  - `softSkillsScore`

### 7.5 View Interview Report
1. Go to "My Interviews"
2. Click on completed interview
3. Click "View Report"

**Expected Output:**
- Report displays with:
  - Overall score
  - Technical score
  - Communication score
  - Problem-solving score
  - Soft skills score
  - AI feedback and recommendations

**Check in Database:**
- All scores should be stored in Interview record
- Report data should be in `evaluation` field

---

## ✅ STEP 8: Test Admin Dashboard ↔ Database

### 8.1 Register as Admin
```bash
# Use Prisma Studio to create admin user
# Or use this script:
cd server
node create-admin.js
```

### 8.2 Login as Admin
1. Email: `admin@test.com`
2. Password: `Test@123`
3. Click "Login"

**Expected:** Redirected to Admin Dashboard

### 8.3 Verify Admin Dashboard Data
**Check in Browser DevTools:**
1. Network tab should show:
   - `GET /api/admin/users` - Returns all users
   - `GET /api/admin/jobs` - Returns all jobs
   - `GET /api/admin/payments` - Returns all payments
   - `GET /api/admin/analytics` - Returns analytics

**Expected:** All API calls return 200 status with data

### 8.4 Verify Data in Admin Dashboard
Admin dashboard should display:
- [ ] Total users count
- [ ] Total jobs count
- [ ] Total applications count
- [ ] Total payments
- [ ] Analytics charts

---

## ✅ STEP 9: Test AI Service Status

### 9.1 Check AI Service Availability
```bash
curl http://localhost:5000/api/ai/status
```

**Expected Response (Live Mode):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "gpt-3.5-turbo",
    "message": "AI service is operational",
    "mode": "live"
  }
}
```

**Expected Response (Fallback Mode - if quota exceeded):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "mode": "fallback",
    "message": "AI service is operational (fallback mode - using cached responses)",
    "warning": "OpenAI API quota exceeded. Using fallback responses."
  }
}
```

---

## ✅ STEP 10: Complete End-to-End Test

### Test Scenario: Full Interview Process

**Step 1: Employer Creates Job**
- [ ] Login as employer
- [ ] Create job
- [ ] Verify job in database

**Step 2: Candidate Applies**
- [ ] Logout and login as candidate
- [ ] Apply for job
- [ ] Verify application in database

**Step 3: Candidate Takes Interview**
- [ ] Start interview (AI generates questions)
- [ ] Verify questions in database
- [ ] Answer all questions (AI evaluates each)
- [ ] Verify responses in database
- [ ] Complete interview (AI generates report)
- [ ] Verify report in database

**Step 4: View Results**
- [ ] View interview report
- [ ] Verify all scores displayed
- [ ] Verify AI feedback shown

**Step 5: Employer Reviews**
- [ ] Logout and login as employer
- [ ] Go to job candidates
- [ ] View candidate interview results
- [ ] Verify AI scores displayed

**Step 6: Admin Oversight**
- [ ] Logout and login as admin
- [ ] View all interviews
- [ ] View analytics
- [ ] Verify all data accessible

---

## 🔧 Troubleshooting

### Issue: Database Connection Failed
**Solution:**
1. Check PostgreSQL running: `net start postgresql-x64-16`
2. Check DATABASE_URL in `server/.env`
3. Verify database exists: `psql -U postgres -d simuai_db`
4. Check Prisma connection: `npx prisma db push`

### Issue: API Returns 401 Unauthorized
**Solution:**
1. Check JWT token in browser localStorage
2. Verify token not expired
3. Check Authorization header in API calls
4. Verify JWT_SECRET in `server/.env`

### Issue: AI Features Not Working
**Solution:**
1. Check OPENAI_API_KEY in `server/.env`
2. Check OpenAI account has credits
3. Check API quota: https://platform.openai.com/account/billing/overview
4. Check AI status: `curl http://localhost:5000/api/ai/status`
5. If quota exceeded, system uses fallback mode automatically

### Issue: Dashboard Shows Empty Data
**Solution:**
1. Check API calls in Network tab (F12)
2. Verify API returns 200 status
3. Check database has data: `npx prisma studio`
4. Check authentication token valid
5. Check user role has permission

### Issue: Interview Questions Not Generated
**Solution:**
1. Check AI status: `curl http://localhost:5000/api/ai/status`
2. Check OpenAI API key configured
3. Check OpenAI quota not exceeded
4. Check server logs for errors
5. System will use fallback questions if AI unavailable

---

## 📊 Verification Checklist

### Database Connections
- [ ] PostgreSQL running
- [ ] Database `simuai_db` exists
- [ ] Prisma connected successfully
- [ ] All tables created

### Backend Server
- [ ] Server running on port 5000
- [ ] Health check endpoint working
- [ ] All routes mounted correctly
- [ ] Database connection established

### Frontend Application
- [ ] Application running on port 3000
- [ ] Can register users
- [ ] Can login users
- [ ] Dashboards load correctly

### Candidate Dashboard
- [ ] Can view interviews
- [ ] Can view applications
- [ ] Can view profile
- [ ] Can update profile
- [ ] API calls working

### Employer Dashboard
- [ ] Can create jobs
- [ ] Can view jobs
- [ ] Can view job candidates
- [ ] Can view analytics
- [ ] API calls working

### Admin Dashboard
- [ ] Can view all users
- [ ] Can view all jobs
- [ ] Can view all payments
- [ ] Can view analytics
- [ ] API calls working

### AI Integration
- [ ] AI service available
- [ ] Interview questions generated
- [ ] Responses evaluated
- [ ] Reports generated
- [ ] Scores stored in database

### Data Flow
- [ ] Frontend → Backend: API calls working
- [ ] Backend → Database: Data stored correctly
- [ ] Backend → AI: Questions generated
- [ ] AI → Database: Evaluations stored
- [ ] Database → Frontend: Data displayed

---

## 🎯 Success Criteria

✅ **System is working correctly when:**

1. **Database**: All dashboards can read/write data to PostgreSQL
2. **Backend**: All API endpoints return correct data
3. **Frontend**: All dashboards display data from database
4. **AI Integration**: Interview flow generates questions, evaluates responses, and creates reports
5. **Data Persistence**: All data stored in database and persists across sessions
6. **End-to-End**: Complete interview process works from start to finish

---

## 📞 Quick Commands

```bash
# Start PostgreSQL
net start postgresql-x64-16

# Start Backend
cd server && npm run dev

# Start Frontend
cd client && npm start

# Check Database
npx prisma studio

# Check AI Status
curl http://localhost:5000/api/ai/status

# Check Server Health
curl http://localhost:5000/health

# View Server Logs
# Check terminal where npm run dev is running
```

---

**Status**: ✅ Ready for Verification
**Last Updated**: March 13, 2026
**Version**: 1.0.0

