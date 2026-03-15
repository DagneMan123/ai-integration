# Interview Quick Start - 5 Minutes Setup

## Prerequisites
- PostgreSQL running
- Node.js installed
- Both server and client running

## Quick Setup Steps

### 1. Start PostgreSQL
```bash
# Windows
net start PostgreSQL-x64-15

# Or use pgAdmin to start
```

### 2. Start Server
```bash
cd server
npm run dev
```
Wait for: `Database connection established successfully via Prisma`

### 3. Start Client
```bash
cd client
npm start
```
Wait for: `Compiled successfully!`

---

## Quick Test Flow (10 minutes)

### Employer Side (Browser 1)
```
1. Go to http://localhost:3000
2. Register as Employer
   - Email: employer@test.com
   - Password: Test123!
   - Company: Tech Corp

3. Complete Profile
   - Add company details
   - Save

4. Create Job
   - Title: Senior Developer
   - Description: 5+ years experience
   - Post Job

5. Wait for application
```

### Candidate Side (Browser 2 - Incognito)
```
1. Go to http://localhost:3000
2. Register as Candidate
   - Email: candidate@test.com
   - Password: Test123!
   - Name: John Developer

3. Browse Jobs
   - Find "Senior Developer"
   - Click Apply
   - Add cover letter
   - Submit

4. Wait for interview invite
```

### Employer Schedules Interview
```
1. Go to Applicant Tracking
2. See new application
3. Change status to "Reviewing"
4. Go to Interview Calendar
5. Click "Schedule Interview"
6. Select candidate, date, time
7. Click Schedule
```

### Candidate Takes Interview
```
1. Go to Interviews
2. Click "Start Interview"
3. Allow camera/microphone
4. Verify identity
5. Answer 5 AI questions
6. Complete interview
```

### View Results
**Candidate**:
- Go to Interview Insights
- See score: 75-85%
- View strengths/improvements

**Employer**:
- Go to Applicant Tracking
- Click applicant
- See interview score
- View AI summary
- Make hiring decision

---

## Key URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Register | http://localhost:3000/register |
| Employer Dashboard | http://localhost:3000/employer/dashboard |
| Candidate Dashboard | http://localhost:3000/candidate/dashboard |
| Jobs | http://localhost:3000/jobs |
| Interviews | http://localhost:3000/candidate/interviews |
| Interview Insights | http://localhost:3000/candidate/results |
| Applicant Tracking | http://localhost:3000/employer/applicants |
| Interview Calendar | http://localhost:3000/employer/calendar |

---

## Test Credentials (If Using Seed Data)

```
Employer:
Email: employer@test.com
Password: password123

Candidate:
Email: candidate@test.com
Password: password123
```

---

## Common Commands

```bash
# Clear cache and restart
cd client
Remove-Item -Recurse -Force node_modules/.cache
npm start

# Restart server
cd server
npm run dev

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## What Happens During Interview

1. **AI asks 5 questions** (technical, problem-solving, behavioral)
2. **Real-time evaluation** (accuracy, communication, confidence)
3. **Anti-cheat monitoring** (webcam, tab switching, identity)
4. **Automatic scoring** (0-100 scale)
5. **Feedback generation** (strengths, improvements)
6. **Results saved** (database, viewable by both parties)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database error | Restart PostgreSQL, check connection |
| Webcam not working | Allow browser permissions, restart browser |
| Interview not starting | Wait 15 min before start time, refresh page |
| No questions appearing | Check OpenAI API key in .env |
| Scores not showing | Refresh page, check server logs |

---

## Next Steps

1. ✅ Complete interview workflow
2. ✅ View results and feedback
3. ✅ Test employer hiring decision
4. ✅ Check anti-cheat reports
5. ✅ Review AI-generated insights

**Total Time**: ~15-20 minutes for complete workflow
