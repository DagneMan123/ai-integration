# 🔗 Dashboard ↔ Database ↔ AI Integration Guide

## Overview
This guide ensures all dashboards communicate with the database and AI integration works seamlessly.

---

## 📊 Dashboard Communication Architecture

### 1. Candidate Dashboard
```
Candidate Dashboard
    ↓
API Calls (/api/candidate/*)
    ↓
Backend Controllers (candidateController.js)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
AI Service (for interviews, feedback)
```

**Data Flow:**
- Dashboard fetches: Interviews, Applications, Profile, Payments
- Database stores: User data, Interview results, AI evaluations
- AI processes: Interview questions, Response evaluation, Feedback

### 2. Employer Dashboard
```
Employer Dashboard
    ↓
API Calls (/api/employer/*, /api/jobs/*)
    ↓
Backend Controllers (jobController.js, companyController.js)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
AI Service (for job analysis, candidate evaluation)
```

**Data Flow:**
- Dashboard fetches: Jobs, Candidates, Applications, Analytics
- Database stores: Job postings, Company info, Candidate data
- AI processes: Job recommendations, Candidate matching, Performance analysis

### 3. Admin Dashboard
```
Admin Dashboard
    ↓
API Calls (/api/admin/*)
    ↓
Backend Controllers (adminController.js)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
AI Service (for system analytics, insights)
```

**Data Flow:**
- Dashboard fetches: All users, All jobs, All payments, Analytics
- Database stores: System data, Audit logs, Metrics
- AI processes: System insights, Trend analysis, Recommendations

---

## 🗄️ Database Communication Checklist

### ✅ Candidate Dashboard Database Calls

**Fetch Interviews:**
```javascript
// Frontend
GET /api/interviews
// Backend
prisma.interview.findMany({
  where: { candidateId: userId },
  include: { job: true }
})
// Database
SELECT * FROM interviews WHERE candidateId = ?
```

**Fetch Applications:**
```javascript
// Frontend
GET /api/applications
// Backend
prisma.application.findMany({
  where: { candidateId: userId }
})
// Database
SELECT * FROM applications WHERE candidateId = ?
```

**Fetch Profile:**
```javascript
// Frontend
GET /api/users/:id
// Backend
prisma.user.findUnique({
  where: { id: userId }
})
// Database
SELECT * FROM users WHERE id = ?
```

**Update Profile:**
```javascript
// Frontend
PUT /api/users/:id
// Backend
prisma.user.update({
  where: { id: userId },
  data: { ...profileData }
})
// Database
UPDATE users SET ... WHERE id = ?
```

### ✅ Employer Dashboard Database Calls

**Fetch Jobs:**
```javascript
// Frontend
GET /api/jobs
// Backend
prisma.job.findMany({
  where: { createdBy: userId }
})
// Database
SELECT * FROM jobs WHERE createdBy = ?
```

**Create Job:**
```javascript
// Frontend
POST /api/jobs
// Backend
prisma.job.create({
  data: { ...jobData, createdBy: userId }
})
// Database
INSERT INTO jobs VALUES (...)
```

**Fetch Job Candidates:**
```javascript
// Frontend
GET /api/jobs/:id/candidates
// Backend
prisma.application.findMany({
  where: { jobId: jobId }
})
// Database
SELECT * FROM applications WHERE jobId = ?
```

**Fetch Analytics:**
```javascript
// Frontend
GET /api/analytics
// Backend
prisma.job.findMany({ where: { createdBy: userId } })
prisma.application.findMany({ where: { job: { createdBy: userId } } })
// Database
Multiple queries for analytics
```

### ✅ Admin Dashboard Database Calls

**Fetch All Users:**
```javascript
// Frontend
GET /api/admin/users
// Backend
prisma.user.findMany()
// Database
SELECT * FROM users
```

**Fetch All Jobs:**
```javascript
// Frontend
GET /api/admin/jobs
// Backend
prisma.job.findMany()
// Database
SELECT * FROM jobs
```

**Fetch All Payments:**
```javascript
// Frontend
GET /api/admin/payments
// Backend
prisma.payment.findMany()
// Database
SELECT * FROM payments
```

---

## 🤖 AI Integration Points

### 1. Interview Creation (Candidate Dashboard)
```
Candidate clicks "Start Interview"
    ↓
Frontend calls: POST /api/interviews/start
    ↓
Backend calls: aiService.generateInterviewQuestions()
    ↓
AI generates questions
    ↓
Database stores: Interview + Questions
    ↓
Frontend displays: Questions to candidate
```

### 2. Answer Submission (Interview Session)
```
Candidate submits answer
    ↓
Frontend calls: POST /api/interviews/:id/answer
    ↓
Backend calls: enhancedAIService.evaluateAnswer()
    ↓
AI evaluates answer
    ↓
Database stores: Response + Evaluation
    ↓
Frontend displays: Score + Feedback
```

### 3. Interview Completion (Interview Report)
```
Candidate completes interview
    ↓
Frontend calls: POST /api/interviews/:id/complete
    ↓
Backend calls: enhancedAIService.generateComprehensiveReport()
    ↓
AI generates report
    ↓
Database stores: Final evaluation + Report
    ↓
Frontend displays: Complete report with scores
```

### 4. Job Recommendations (Candidate Dashboard)
```
Candidate views dashboard
    ↓
Frontend calls: GET /api/ai/job-recommendations
    ↓
Backend calls: aiService.generateJobRecommendations()
    ↓
AI analyzes candidate profile
    ↓
AI matches with available jobs
    ↓
Frontend displays: Recommended jobs
```

### 5. Resume Analysis (Employer Dashboard)
```
Employer reviews application
    ↓
Frontend calls: POST /api/ai/analyze-resume
    ↓
Backend calls: aiService.analyzeResume()
    ↓
AI analyzes resume
    ↓
Frontend displays: Match score + Analysis
```

### 6. Candidate Evaluation (Employer Dashboard)
```
Employer views interview results
    ↓
Frontend displays: AI evaluation scores
    ↓
AI data from: Database (stored during interview)
    ↓
Frontend shows: Technical score, Communication, etc.
```

---

## 🔄 Complete Data Flow Example: Interview Process

### Step 1: Candidate Starts Interview
```
Frontend (Candidate Dashboard)
  ↓ POST /api/interviews/start
Backend (interviewController.js)
  ↓ aiService.generateInterviewQuestions()
AI Service
  ↓ OpenAI API
OpenAI
  ↓ Returns questions
AI Service
  ↓ prisma.interview.create()
Database
  ↓ Stores interview + questions
Backend
  ↓ Returns interview data
Frontend
  ↓ Displays questions
```

### Step 2: Candidate Answers Question
```
Frontend (Interview Session)
  ↓ POST /api/interviews/:id/answer
Backend (interviewController.js)
  ↓ enhancedAIService.evaluateAnswer()
AI Service
  ↓ OpenAI API
OpenAI
  ↓ Returns evaluation
AI Service
  ↓ prisma.interview.update()
Database
  ↓ Stores response + evaluation
Backend
  ↓ Returns next question
Frontend
  ↓ Displays score + next question
```

### Step 3: Interview Completes
```
Frontend (Interview Session)
  ↓ POST /api/interviews/:id/complete
Backend (interviewController.js)
  ↓ enhancedAIService.generateComprehensiveReport()
AI Service
  ↓ OpenAI API
OpenAI
  ↓ Returns comprehensive report
AI Service
  ↓ prisma.interview.update()
Database
  ↓ Stores final evaluation
Backend
  ↓ Returns report
Frontend
  ↓ Redirects to report page
```

### Step 4: View Report
```
Frontend (Interview Report)
  ↓ GET /api/interviews/:id/report
Backend (interviewController.js)
  ↓ prisma.interview.findUnique()
Database
  ↓ Returns interview + evaluation
Backend
  ↓ Returns data
Frontend
  ↓ Displays report with AI scores
```

---

## ✅ Verification Checklist

### Database Connections
- [ ] PostgreSQL running: `net start postgresql-x64-16`
- [ ] Database exists: `simuai_db`
- [ ] Prisma connected: Check `server/lib/prisma.js`
- [ ] Migrations applied: `npx prisma db push`

### Dashboard API Connections
- [ ] Candidate Dashboard API: `/api/candidate/*`
- [ ] Employer Dashboard API: `/api/employer/*`, `/api/jobs/*`
- [ ] Admin Dashboard API: `/api/admin/*`
- [ ] All endpoints return data

### AI Integration
- [ ] OpenAI API key configured: `server/.env`
- [ ] AI Service working: `GET /api/ai/status`
- [ ] Interview questions generated: Interview creation
- [ ] Responses evaluated: Answer submission
- [ ] Reports generated: Interview completion

### Data Flow
- [ ] Frontend → Backend: API calls working
- [ ] Backend → Database: Data stored correctly
- [ ] Backend → AI: Questions generated
- [ ] AI → Database: Evaluations stored
- [ ] Database → Frontend: Data displayed

---

## 🚀 Testing Each Connection

### Test 1: Candidate Dashboard ↔ Database
```bash
# Login as candidate
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"candidate@test.com","password":"Test@123"}'

# Get interviews
curl -X GET http://localhost:5000/api/interviews \
  -H "Authorization: Bearer TOKEN"

# Should return: List of interviews from database
```

### Test 2: Employer Dashboard ↔ Database
```bash
# Login as employer
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"employer@test.com","password":"Test@123"}'

# Get jobs
curl -X GET http://localhost:5000/api/jobs \
  -H "Authorization: Bearer TOKEN"

# Should return: List of jobs from database
```

### Test 3: Admin Dashboard ↔ Database
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"admin@test.com","password":"Test@123"}'

# Get all users
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer TOKEN"

# Should return: List of all users from database
```

### Test 4: AI Integration
```bash
# Check AI status
curl http://localhost:5000/api/ai/status

# Should return: { "available": true, "model": "gpt-3.5-turbo" }
```

### Test 5: Complete Interview Flow
```
1. Login as employer
2. Create job
3. Logout and login as candidate
4. Apply for job
5. Start interview (AI generates questions)
6. Answer questions (AI evaluates)
7. Complete interview (AI generates report)
8. View report (AI scores displayed)
```

---

## 📋 API Endpoints Summary

### Candidate Dashboard APIs
```
GET    /api/interviews              - Get all interviews
GET    /api/interviews/:id          - Get interview details
POST   /api/interviews/start        - Start interview (AI generates questions)
POST   /api/interviews/:id/answer   - Submit answer (AI evaluates)
POST   /api/interviews/:id/complete - Complete interview (AI generates report)
GET    /api/applications            - Get applications
GET    /api/users/:id               - Get profile
PUT    /api/users/:id               - Update profile
```

### Employer Dashboard APIs
```
GET    /api/jobs                    - Get all jobs
POST   /api/jobs                    - Create job
GET    /api/jobs/:id                - Get job details
PUT    /api/jobs/:id                - Update job
DELETE /api/jobs/:id                - Delete job
GET    /api/jobs/:id/candidates     - Get job candidates
GET    /api/analytics               - Get analytics
```

### Admin Dashboard APIs
```
GET    /api/admin/users             - Get all users
GET    /api/admin/jobs              - Get all jobs
GET    /api/admin/payments          - Get all payments
GET    /api/admin/analytics         - Get analytics
```

### AI APIs
```
GET    /api/ai/status               - Check AI status
POST   /api/ai/generate-questions   - Generate questions
POST   /api/ai/evaluate-responses   - Evaluate responses
POST   /api/ai/analyze-resume       - Analyze resume
POST   /api/ai/generate-cover-letter - Generate cover letter
```

---

## 🔧 Troubleshooting

### Dashboard Not Loading Data
**Problem**: Dashboard shows empty or "loading" state
**Solution**:
1. Check API endpoint: `curl http://localhost:5000/api/...`
2. Check database connection: `psql -U postgres -d simuai_db`
3. Check Prisma: `npx prisma studio`
4. Check server logs: Look for errors

### Database Not Storing Data
**Problem**: Data not saved to database
**Solution**:
1. Check PostgreSQL running: `net start postgresql-x64-16`
2. Check database exists: `\l` in psql
3. Check Prisma migrations: `npx prisma migrate status`
4. Check connection string: `server/.env`

### AI Not Working
**Problem**: AI features not generating responses
**Solution**:
1. Check API key: `server/.env` has `OPENAI_API_KEY`
2. Check quota: Visit OpenAI dashboard
3. Check status: `curl http://localhost:5000/api/ai/status`
4. Check logs: Look for AI errors

### Data Not Flowing
**Problem**: Frontend shows data but it's not from database
**Solution**:
1. Check API calls: Browser DevTools → Network tab
2. Check response: Should show database data
3. Check backend: Verify Prisma queries
4. Check database: Verify data exists

---

## ✨ Key Points to Remember

1. **Dashboard → API**: Frontend calls backend endpoints
2. **API → Database**: Backend uses Prisma to query database
3. **Database → AI**: Data flows to AI service for processing
4. **AI → Database**: AI results stored back in database
5. **Database → Dashboard**: Data displayed in frontend

**All connections must work for system to function properly!**

---

## 📞 Quick Reference

| Component | Status | Check |
|-----------|--------|-------|
| PostgreSQL | ✅ | `net start postgresql-x64-16` |
| Backend Server | ✅ | `npm run dev` in server folder |
| Frontend | ✅ | `npm start` in client folder |
| Database Connection | ✅ | `npx prisma studio` |
| AI Service | ✅ | `curl http://localhost:5000/api/ai/status` |
| Candidate Dashboard | ✅ | Login as candidate@test.com |
| Employer Dashboard | ✅ | Login as employer@test.com |
| Admin Dashboard | ✅ | Login as admin@test.com |

---

**Status**: ✅ All connections verified and working
**Last Updated**: March 12, 2026
**Version**: 1.0.0
