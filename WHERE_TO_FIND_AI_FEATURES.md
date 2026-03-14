# 🗺️ Where to Find AI Features - Navigation Guide

## 🌐 Frontend URLs

### AI Demo Page
```
URL: http://localhost:3000/ai-demo
Purpose: Test all AI features interactively
Auth: Not required for status check
Features:
  • Check AI Service Status
  • Generate Interview Questions
  • Evaluate Interview Responses
  • Analyze Resume
  • Generate Cover Letter
```

### Interview Pages
```
Interview Session:
  URL: http://localhost:3000/candidate/interview/:id
  Purpose: Take interview with AI-generated questions
  Auth: Required (candidate)
  Features:
    • Display AI questions
    • Submit answers
    • Real-time evaluation

Interview Report:
  URL: http://localhost:3000/candidate/interview/:id/report
  Purpose: View AI evaluation results
  Auth: Required (candidate/employer/admin)
  Features:
    • Overall score
    • Dimension scores
    • Strengths/weaknesses
    • Recommendations
```

### Dashboard Pages
```
Candidate Dashboard:
  URL: http://localhost:3000/candidate/dashboard
  Purpose: View interviews and applications
  Auth: Required (candidate)

Employer Dashboard:
  URL: http://localhost:3000/employer/dashboard
  Purpose: Manage jobs and interviews
  Auth: Required (employer)

Admin Dashboard:
  URL: http://localhost:3000/admin/dashboard
  Purpose: System administration
  Auth: Required (admin)
```

---

## 🔌 Backend API Endpoints

### AI Service Endpoints
```
Base URL: http://localhost:5000/api/ai

1. Check Status
   GET /status
   Auth: Not required
   Response: { available: true, model: "gpt-3.5-turbo" }

2. Generate Questions
   POST /generate-questions
   Auth: Required (JWT)
   Body: { jobDetails: {...}, questionCount: 10 }
   Response: [{ question: "...", type: "...", difficulty: "..." }]

3. Evaluate Responses
   POST /evaluate-responses
   Auth: Required (JWT)
   Body: { questions: [...], responses: [...], jobDetails: {...} }
   Response: { overall_score: 85, technical_score: 88, ... }

4. Analyze Resume
   POST /analyze-resume
   Auth: Required (JWT)
   Body: { resumeText: "...", jobRequirements: {...} }
   Response: { match_score: 92, matching_skills: [...], ... }

5. Generate Cover Letter
   POST /generate-cover-letter
   Auth: Required (JWT)
   Body: { candidateProfile: {...}, jobDetails: {...} }
   Response: { coverLetter: "...", generated_at: "..." }

6. Job Recommendations
   POST /job-recommendations
   Auth: Required (JWT)
   Body: { candidateProfile: {...}, availableJobs: [...] }
   Response: [{ job_id: 1, match_score: 95, reasons: [...] }]

7. Generate Feedback
   POST /generate-feedback
   Auth: Required (JWT)
   Body: { evaluation: {...}, candidateProfile: {...} }
   Response: { feedback: "...", generated_at: "..." }

8. Analyze Performance
   POST /analyze-performance
   Auth: Required (JWT)
   Body: { interviewData: {...} }
   Response: { analysis: "...", analyzed_at: "..." }

9. Skill Development Plan
   POST /skill-development-plan
   Auth: Required (JWT)
   Body: { candidateProfile: {...}, targetSkills: [...] }
   Response: { developmentPlan: "...", created_at: "..." }
```

### Interview Endpoints
```
Base URL: http://localhost:5000/api/interviews

POST /start
  Purpose: Start interview with AI questions
  Auth: Required (candidate)
  Body: { jobId, applicationId, interviewMode, strictnessLevel }
  Response: { interviewId, questions, currentQuestion }

POST /:id/answer
  Purpose: Submit answer (AI evaluates)
  Auth: Required (candidate)
  Body: { questionIndex, answer, timeTaken }
  Response: { nextQuestion, isLastQuestion, evaluation }

POST /:id/complete
  Purpose: Complete interview (AI generates report)
  Auth: Required (candidate)
  Response: { interviewId, overallScore, reportAvailable }

GET /:id/report
  Purpose: Get interview report with AI evaluation
  Auth: Required
  Response: { interview, report }
```

---

## 📁 Source Code Files

### Backend Services
```
server/services/
├── aiService.js
│   ├── generateInterviewQuestions()
│   ├── evaluateResponses()
│   ├── generateFeedback()
│   ├── analyzeResume()
│   ├── generateJobRecommendations()
│   ├── generateCoverLetter()
│   ├── analyzeInterviewPerformance()
│   ├── generateSkillDevelopmentPlan()
│   └── checkAvailability()
│
├── enhancedAIService.js
│   ├── generateInterviewQuestions()
│   ├── evaluateAnswer()
│   ├── detectAIContent()
│   ├── analyzeSentiment()
│   ├── analyzeSpeechPatterns()
│   ├── generateFollowUpQuestion()
│   ├── generateComprehensiveReport()
│   └── calculateIntegrityScore()
│
└── antiCheatService.js
    ├── initializeSession()
    ├── recordTabSwitch()
    ├── recordCopyPaste()
    ├── recordWindowBlur()
    ├── recordBrowserFingerprint()
    ├── recordIdentitySnapshot()
    ├── calculateIntegrityScore()
    └── endSession()
```

### Backend Routes
```
server/routes/
└── ai.js
    ├── GET /status
    ├── POST /generate-questions
    ├── POST /evaluate-responses
    ├── POST /analyze-resume
    ├── POST /generate-cover-letter
    ├── POST /job-recommendations
    ├── POST /generate-feedback
    ├── POST /analyze-performance
    └── POST /skill-development-plan
```

### Backend Controllers
```
server/controllers/
└── interviewController.js
    ├── startInterview()
    ├── submitAnswer()
    ├── completeInterview()
    ├── recordAntiCheatEvent()
    ├── recordIdentitySnapshot()
    ├── getIntegrityReport()
    ├── getInterviewReport()
    ├── getCandidateInterviews()
    ├── getJobInterviews()
    ├── evaluateInterview()
    └── getAllInterviews()
```

### Frontend Components
```
client/src/
├── pages/
│   ├── AIDemo.tsx
│   │   ├── testGenerateQuestions()
│   │   ├── testEvaluateResponses()
│   │   ├── testAnalyzeResume()
│   │   ├── testGenerateCoverLetter()
│   │   └── testAIStatus()
│   │
│   └── candidate/
│       ├── InterviewSession.tsx
│       │   ├── fetchInterview()
│       │   ├── handleSubmitAnswer()
│       │   └── formatTime()
│       │
│       └── InterviewReport.tsx
│           ├── fetchReport()
│           ├── getScoreColor()
│           └── getScoreBg()
│
└── components/
    └── Navbar.tsx
        └── AI Demo link
```

---

## 📚 Documentation Files

### Main Documentation
```
Root Directory:
├── AI_FEATURES_GUIDE.md
│   └── Detailed API documentation with examples
│
├── AI_FEATURES_WORKING_GUIDE.md
│   └── Complete feature guide with use cases
│
├── TEST_AI_FEATURES_NOW.md
│   └── Quick testing guide with credentials
│
├── AI_INTEGRATION_SUMMARY.md
│   └── Implementation summary and overview
│
├── AI_SYSTEM_ARCHITECTURE.md
│   └── Architecture diagrams and data flows
│
├── AI_QUICK_START_CARD.txt
│   └── Quick reference card
│
├── AI_FEATURES_COMPLETE_STATUS.md
│   └── Status report and checklist
│
└── WHERE_TO_FIND_AI_FEATURES.md
    └── This file - Navigation guide
```

---

## 🔧 Configuration Files

### Environment Configuration
```
server/.env
├── OPENAI_API_KEY=sk-proj-...
├── DATABASE_URL=postgresql://...
├── JWT_SECRET=...
├── PORT=5000
├── NODE_ENV=development
└── LOG_LEVEL=warn
```

### Database Schema
```
server/prisma/
├── schema.prisma
│   ├── Interview model
│   │   ├── questions (AI-generated)
│   │   ├── responses (candidate answers)
│   │   ├── evaluation (AI evaluation)
│   │   ├── scores (technical, communication, etc.)
│   │   ├── antiCheatData
│   │   └── identityVerification
│   │
│   ├── Application model
│   │   ├── resume
│   │   └── resumeAnalysis
│   │
│   ├── Job model
│   │   ├── title
│   │   ├── description
│   │   ├── requiredSkills
│   │   └── experienceLevel
│   │
│   └── User model
│       ├── email
│       ├── role
│       ├── profile
│       └── skills
│
└── migrations/
    └── Database migration files
```

---

## 🧪 Testing Files

### Test Scripts
```
Root Directory:
├── test-ai.js
│   └── Test AI service endpoints
│
├── test-ai-service.js
│   └── Test AI service functions
│
├── test-auth.js
│   └── Test authentication
│
├── test-login-register.js
│   └── Test login/register flow
│
└── test-job-api.js
    └── Test job API endpoints
```

### Test Credentials
```
Employer:
  Email: employer@test.com
  Password: Test@123

Candidate:
  Email: candidate@test.com
  Password: Test@123

Admin:
  Email: admin@test.com
  Password: Test@123
```

---

## 🎯 Quick Navigation

### I want to...

**Test AI Features**
→ Visit: `http://localhost:3000/ai-demo`

**Create an Interview**
→ Login as employer → Create job → Login as candidate → Apply → Start interview

**View Interview Report**
→ Complete interview → Go to `/candidate/interview/:id/report`

**Check API Status**
→ `curl http://localhost:5000/api/ai/status`

**Generate Questions**
→ `POST /api/ai/generate-questions` with job details

**Evaluate Responses**
→ `POST /api/ai/evaluate-responses` with questions and answers

**Analyze Resume**
→ `POST /api/ai/analyze-resume` with resume text

**Generate Cover Letter**
→ `POST /api/ai/generate-cover-letter` with candidate profile

**View Documentation**
→ See "Documentation Files" section above

**Understand Architecture**
→ Read: `AI_SYSTEM_ARCHITECTURE.md`

**Get Started Quickly**
→ Read: `TEST_AI_FEATURES_NOW.md`

**See Complete Status**
→ Read: `AI_FEATURES_COMPLETE_STATUS.md`

---

## 📊 Feature Matrix

| Feature | Frontend | Backend | API | Docs | Status |
|---------|----------|---------|-----|------|--------|
| Generate Questions | ✅ AIDemo | ✅ Service | ✅ POST | ✅ | ✅ |
| Evaluate Responses | ✅ AIDemo | ✅ Service | ✅ POST | ✅ | ✅ |
| Analyze Resume | ✅ AIDemo | ✅ Service | ✅ POST | ✅ | ✅ |
| Generate Cover Letter | ✅ AIDemo | ✅ Service | ✅ POST | ✅ | ✅ |
| Job Recommendations | ✅ AIDemo | ✅ Service | ✅ POST | ✅ | ✅ |
| Generate Feedback | ✅ Report | ✅ Service | ✅ POST | ✅ | ✅ |
| Analyze Performance | ✅ Report | ✅ Service | ✅ POST | ✅ | ✅ |
| Skill Development | ✅ AIDemo | ✅ Service | ✅ POST | ✅ | ✅ |
| Interview Integration | ✅ Session | ✅ Controller | ✅ POST | ✅ | ✅ |

---

## 🚀 Getting Started

### Step 1: Start Services
```bash
# Terminal 1
net start postgresql-x64-16

# Terminal 2
cd server && npm run dev

# Terminal 3
cd client && npm start
```

### Step 2: Access AI Features
```
Option A: Visit http://localhost:3000/ai-demo
Option B: Create interview and see AI in action
Option C: Call API endpoints directly
```

### Step 3: Explore
```
• Test each AI feature
• Create interview
• View report
• Check documentation
• Review code
```

---

## 📞 Quick Help

### Common Questions

**Q: Where do I test AI features?**
A: Visit `http://localhost:3000/ai-demo`

**Q: How do I create an interview with AI?**
A: Login as employer → Create job → Login as candidate → Apply → Start interview

**Q: Where is the API documentation?**
A: See `AI_FEATURES_GUIDE.md`

**Q: How do I check if AI is working?**
A: Visit `/ai-demo` and click "Check AI Service Status"

**Q: What are the test credentials?**
A: See "Test Credentials" section above

**Q: Where is the source code?**
A: See "Source Code Files" section above

**Q: How do I understand the architecture?**
A: Read `AI_SYSTEM_ARCHITECTURE.md`

**Q: What's the quick start?**
A: Read `TEST_AI_FEATURES_NOW.md`

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Can access `/ai-demo` page
- [ ] AI Status shows "available": true
- [ ] Can generate questions
- [ ] Can evaluate responses
- [ ] Can analyze resume
- [ ] Can generate cover letter
- [ ] Can create interview with AI questions
- [ ] Can view interview report with AI evaluation

---

**Navigation Guide Version**: 1.0.0  
**Last Updated**: March 12, 2026  
**Status**: ✅ Complete

---

**Happy exploring! 🚀**
