# ✅ System Verification Checklist

## Dashboard ↔ Database ↔ AI Integration Verification

**Date**: ________________  
**Verified By**: ________________  
**Status**: ☐ PASSED ☐ FAILED

---

## PHASE 1: Prerequisites (5 minutes)

### PostgreSQL Setup
- [ ] PostgreSQL service running: `net start postgresql-x64-16`
- [ ] Database `simuai_db` exists
- [ ] Can connect: `psql -U postgres -d simuai_db`
- [ ] Connection string in `server/.env` is correct

### Environment Configuration
- [ ] `server/.env` has `DATABASE_URL` configured
- [ ] `server/.env` has `OPENAI_API_KEY` configured
- [ ] `server/.env` has `JWT_SECRET` configured
- [ ] `server/.env` has `PORT=5000` configured

### Dependencies Installed
- [ ] Backend dependencies: `cd server && npm install` completed
- [ ] Frontend dependencies: `cd client && npm install` completed
- [ ] No missing packages

---

## PHASE 2: Backend Server (5 minutes)

### Start Backend
- [ ] Run: `cd server && npm run dev`
- [ ] Server starts without errors
- [ ] Output shows: "✅ Database connection established successfully via Prisma."
- [ ] Output shows: "Server running on port 5000"

### Health Check
- [ ] Run: `curl http://localhost:5000/health`
- [ ] Response: `{ "status": "OK", "timestamp": "..." }`
- [ ] Status code: 200

### Database Connection
- [ ] Prisma connected successfully
- [ ] No database connection errors in logs
- [ ] Can query database

### Routes Mounted
- [ ] Auth routes available
- [ ] User routes available
- [ ] Job routes available
- [ ] Interview routes available
- [ ] Application routes available
- [ ] Payment routes available
- [ ] Admin routes available
- [ ] AI routes available

---

## PHASE 3: Frontend Application (5 minutes)

### Start Frontend
- [ ] Run: `cd client && npm start`
- [ ] Application opens at `http://localhost:3000`
- [ ] No compilation errors
- [ ] Page loads without errors

### Navigation
- [ ] Home page loads
- [ ] Login page accessible
- [ ] Register page accessible
- [ ] Navigation menu visible

---

## PHASE 4: Database Verification (5 minutes)

### Prisma Studio
- [ ] Run: `npx prisma studio`
- [ ] Prisma Studio opens at `http://localhost:5555`
- [ ] Can view all tables

### Database Tables
- [ ] `User` table exists
- [ ] `Job` table exists
- [ ] `Interview` table exists
- [ ] `Application` table exists
- [ ] `Payment` table exists
- [ ] `Company` table exists
- [ ] All tables have correct schema

---

## PHASE 5: Candidate Dashboard (10 minutes)

### Registration
- [ ] Go to `http://localhost:3000`
- [ ] Click "Register"
- [ ] Fill form with:
  - Email: `candidate@test.com`
  - Password: `Test@123`
  - Role: Candidate
- [ ] Click "Register"
- [ ] Redirected to login page
- [ ] User created in database (check Prisma Studio)

### Login
- [ ] Email: `candidate@test.com`
- [ ] Password: `Test@123`
- [ ] Click "Login"
- [ ] Redirected to Candidate Dashboard
- [ ] Dashboard loads without errors

### Dashboard Data
- [ ] Interviews section visible
- [ ] Applications section visible
- [ ] Profile section visible
- [ ] Data loads from database

### API Calls (Check Network Tab - F12)
- [ ] `GET /api/interviews` returns 200
- [ ] `GET /api/applications` returns 200
- [ ] `GET /api/users/:id` returns 200
- [ ] All responses contain data

### Profile Update
- [ ] Can view profile
- [ ] Can update profile
- [ ] Changes saved to database
- [ ] Changes persist after refresh

---

## PHASE 6: Employer Dashboard (10 minutes)

### Registration
- [ ] Go to `http://localhost:3000`
- [ ] Click "Register"
- [ ] Fill form with:
  - Email: `employer@test.com`
  - Password: `Test@123`
  - Role: Employer
- [ ] Click "Register"
- [ ] User created in database

### Login
- [ ] Email: `employer@test.com`
- [ ] Password: `Test@123`
- [ ] Click "Login"
- [ ] Redirected to Employer Dashboard

### Create Job
- [ ] Click "Create Job" button
- [ ] Fill form:
  - Title: "Senior Developer"
  - Description: "Looking for experienced developer"
  - Required Skills: "JavaScript, React, Node.js"
  - Experience Level: "Senior"
- [ ] Click "Create"
- [ ] Job created successfully
- [ ] Redirected to jobs list

### Verify Job in Database
- [ ] Check Prisma Studio → Job table
- [ ] Job appears in database
- [ ] Job has correct data
- [ ] Job has correct employer ID

### Dashboard Data
- [ ] Jobs section shows created job
- [ ] Candidates section visible
- [ ] Analytics section visible
- [ ] Data loads from database

### API Calls (Check Network Tab - F12)
- [ ] `GET /api/jobs` returns 200
- [ ] `POST /api/jobs` returns 201
- [ ] `GET /api/analytics` returns 200
- [ ] All responses contain data

---

## PHASE 7: AI Integration - Interview Flow (15 minutes)

### Candidate Applies for Job
- [ ] Logout from employer account
- [ ] Login as candidate (`candidate@test.com`)
- [ ] Go to "Jobs" page
- [ ] Find job created by employer
- [ ] Click "Apply"
- [ ] Application created successfully

### Verify Application in Database
- [ ] Check Prisma Studio → Application table
- [ ] Application appears in database
- [ ] Application has status: `APPLIED`
- [ ] Application linked to correct job and candidate

### Start Interview (AI Generates Questions)
- [ ] Go to "My Interviews" or "Interviews" page
- [ ] Find interview for the job
- [ ] Click "Start Interview"
- [ ] Interview starts successfully

### Verify Questions Generated
- [ ] Questions displayed on screen
- [ ] At least 10 questions visible
- [ ] Questions are relevant to job
- [ ] Questions have different types (technical, behavioral, etc.)

### Check Network Tab
- [ ] `POST /api/interviews/start` returns 201
- [ ] Response includes `questions` array
- [ ] Questions have proper structure

### Check Database
- [ ] Check Prisma Studio → Interview table
- [ ] Interview record created
- [ ] Interview has `questions` field populated
- [ ] Interview status: `IN_PROGRESS`

### Answer Questions (AI Evaluates)
- [ ] Read first question
- [ ] Type answer
- [ ] Click "Submit Answer"
- [ ] Answer submitted successfully

### Verify Answer Evaluation
- [ ] AI score displayed (0-100)
- [ ] AI feedback displayed
- [ ] Next question displayed
- [ ] No errors in console

### Check Network Tab
- [ ] `POST /api/interviews/:id/submit-answer` returns 200
- [ ] Response includes:
  - `score` - AI evaluation score
  - `feedback` - AI feedback
  - `nextQuestion` - Next question

### Check Database
- [ ] Check Prisma Studio → Interview table
- [ ] Interview has `responses` array
- [ ] Response includes:
  - `answer` - Candidate's answer
  - `score` - AI evaluation score
  - `feedback` - AI feedback

### Answer All Questions
- [ ] Continue answering remaining questions
- [ ] Each answer evaluated by AI
- [ ] Scores displayed for each answer
- [ ] No errors during process

### Complete Interview (AI Generates Report)
- [ ] After last question, click "Complete Interview"
- [ ] Interview completes successfully
- [ ] Redirected to report page

### Verify Report Generated
- [ ] Report displays with:
  - Overall score
  - Technical score
  - Communication score
  - Problem-solving score
  - Soft skills score
  - AI feedback and recommendations

### Check Network Tab
- [ ] `POST /api/interviews/:id/complete` returns 200
- [ ] Response includes:
  - `overallScore` - Overall performance score
  - `integrityScore` - Integrity/anti-cheat score
  - `reportAvailable` - true

### Check Database
- [ ] Check Prisma Studio → Interview table
- [ ] Interview status: `COMPLETED`
- [ ] Interview has `evaluation` field with report
- [ ] Interview has all scores:
  - `overallScore`
  - `technicalScore`
  - `communicationScore`
  - `problemSolvingScore`
  - `softSkillsScore`

---

## PHASE 8: Employer Reviews Results (5 minutes)

### Employer Views Candidates
- [ ] Logout and login as employer
- [ ] Go to job created earlier
- [ ] Click "View Candidates"
- [ ] Candidate appears in list

### View Interview Results
- [ ] Click on candidate
- [ ] Interview results displayed
- [ ] AI scores visible:
  - Overall score
  - Technical score
  - Communication score
  - Problem-solving score
  - Soft skills score

### Verify Data from Database
- [ ] All scores match database values
- [ ] Feedback matches database values
- [ ] Data is consistent

---

## PHASE 9: Admin Dashboard (5 minutes)

### Create Admin User
- [ ] Use Prisma Studio to create admin user
- [ ] Or use: `cd server && node create-admin.js`
- [ ] Admin user created with:
  - Email: `admin@test.com`
  - Password: `Test@123`
  - Role: ADMIN

### Login as Admin
- [ ] Email: `admin@test.com`
- [ ] Password: `Test@123`
- [ ] Click "Login"
- [ ] Redirected to Admin Dashboard

### Admin Dashboard Data
- [ ] Users section shows all users
- [ ] Jobs section shows all jobs
- [ ] Payments section visible
- [ ] Analytics section visible
- [ ] Data loads from database

### API Calls (Check Network Tab - F12)
- [ ] `GET /api/admin/users` returns 200
- [ ] `GET /api/admin/jobs` returns 200
- [ ] `GET /api/admin/payments` returns 200
- [ ] `GET /api/admin/analytics` returns 200
- [ ] All responses contain data

### Verify Data Counts
- [ ] Users count includes: candidate, employer, admin
- [ ] Jobs count includes: job created by employer
- [ ] Applications count includes: application from candidate
- [ ] Interviews count includes: interview completed

---

## PHASE 10: AI Service Status (5 minutes)

### Check AI Service
- [ ] Run: `curl http://localhost:5000/api/ai/status`
- [ ] Response status: 200

### Live Mode (If OpenAI quota available)
- [ ] Response includes: `"mode": "live"`
- [ ] Response includes: `"available": true`
- [ ] Response includes: `"model": "gpt-3.5-turbo"`

### Fallback Mode (If OpenAI quota exceeded)
- [ ] Response includes: `"mode": "fallback"`
- [ ] Response includes: `"available": true`
- [ ] Response includes: warning about quota
- [ ] System still works with cached responses

---

## PHASE 11: Data Persistence (5 minutes)

### Refresh Dashboard
- [ ] Candidate dashboard: Refresh page
- [ ] Data still visible
- [ ] Data matches database

### Logout and Login
- [ ] Logout from candidate account
- [ ] Login again as candidate
- [ ] Dashboard loads with same data
- [ ] Data persists across sessions

### Check Database
- [ ] All data still in database
- [ ] No data lost
- [ ] Data integrity maintained

---

## PHASE 12: Error Handling (5 minutes)

### Test Invalid Credentials
- [ ] Try login with wrong password
- [ ] Error message displayed
- [ ] Not logged in

### Test Unauthorized Access
- [ ] Try accessing admin endpoints as candidate
- [ ] 403 Forbidden error returned
- [ ] Access denied

### Test Missing Data
- [ ] Try accessing non-existent interview
- [ ] 404 Not Found error returned
- [ ] Proper error message displayed

### Test Invalid Input
- [ ] Try creating job with missing fields
- [ ] Validation error displayed
- [ ] Job not created

---

## FINAL VERIFICATION

### All Components Working
- [ ] PostgreSQL connected
- [ ] Backend server running
- [ ] Frontend application running
- [ ] All dashboards accessible
- [ ] All API endpoints working
- [ ] Database storing data correctly
- [ ] AI generating questions
- [ ] AI evaluating responses
- [ ] AI generating reports
- [ ] Data persisting across sessions

### End-to-End Flow Complete
- [ ] Employer creates job
- [ ] Candidate applies
- [ ] Candidate takes interview
- [ ] AI generates questions
- [ ] AI evaluates responses
- [ ] AI generates report
- [ ] Employer reviews results
- [ ] Admin views all data

### No Errors
- [ ] No console errors
- [ ] No server errors
- [ ] No database errors
- [ ] No API errors
- [ ] No AI errors

---

## SIGN-OFF

**Verification Status**: ☐ PASSED ☐ FAILED

**Issues Found** (if any):
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

**Notes**:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

**Verified By**: ________________  
**Date**: ________________  
**Time**: ________________  

---

## NEXT STEPS

If all checks passed:
- ✅ System is ready for production
- ✅ All dashboards working correctly
- ✅ Database communication verified
- ✅ AI integration verified
- ✅ Data persistence verified

If any checks failed:
- ❌ Review troubleshooting guide
- ❌ Check error logs
- ❌ Verify configuration
- ❌ Re-run failed tests
- ❌ Contact support if needed

---

**Version**: 1.0.0  
**Last Updated**: March 13, 2026

