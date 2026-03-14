# AI System Architecture - Visual Guide

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │   AI Demo Page       │  │  Interview Session   │  │ Interview    │  │
│  │  (/ai-demo)          │  │  (/candidate/        │  │ Report       │  │
│  │                      │  │   interview/:id)     │  │ (/candidate/ │  │
│  │ • Generate Questions │  │                      │  │  interview/  │  │
│  │ • Evaluate Responses │  │ • Display AI         │  │  :id/report) │  │
│  │ • Analyze Resume     │  │   Questions          │  │              │  │
│  │ • Generate Cover     │  │ • Submit Answers     │  │ • Show Scores│  │
│  │   Letter             │  │ • Real-time          │  │ • Show       │  │
│  │ • Test All Features  │  │   Evaluation         │  │   Feedback   │  │
│  │                      │  │                      │  │ • Show       │  │
│  │ No Auth Required     │  │ Auth Required        │  │   Strengths/ │  │
│  │ for Status Check     │  │                      │  │   Weaknesses │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Express.js)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AI Routes (/api/ai/*)                        │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  GET  /status                    → Check AI availability       │   │
│  │  POST /generate-questions        → Generate interview Q's      │   │
│  │  POST /evaluate-responses        → Evaluate answers            │   │
│  │  POST /analyze-resume            → Analyze resume              │   │
│  │  POST /generate-cover-letter     → Generate cover letter       │   │
│  │  POST /job-recommendations       → Recommend jobs              │   │
│  │  POST /generate-feedback         → Generate feedback           │   │
│  │  POST /analyze-performance       → Analyze performance         │   │
│  │  POST /skill-development-plan    → Create learning plan        │   │
│  │                                                                 │   │
│  │  Middleware:                                                    │   │
│  │  • Authentication (JWT)                                        │   │
│  │  • Error Handling                                              │   │
│  │  • Request Validation                                          │   │
│  │  • Response Formatting                                         │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Business Logic)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐    │
│  │   AI Service                 │  │  Enhanced AI Service         │    │
│  │  (aiService.js)              │  │  (enhancedAIService.js)      │    │
│  ├──────────────────────────────┤  ├──────────────────────────────┤    │
│  │                              │  │                              │    │
│  │ • Generate Questions         │  │ • Advanced Question Gen      │    │
│  │ • Evaluate Responses         │  │ • Intelligent Evaluation     │    │
│  │ • Analyze Resume             │  │ • AI Content Detection       │    │
│  │ • Generate Cover Letter      │  │ • Sentiment Analysis         │    │
│  │ • Generate Feedback          │  │ • Speech Analysis            │    │
│  │ • Analyze Performance        │  │ • Follow-up Generation       │    │
│  │ • Generate Skill Plan        │  │ • Comprehensive Reports      │    │
│  │ • Job Recommendations        │  │ • Behavioral Metrics         │    │
│  │                              │  │ • Confidence Metrics         │    │
│  │ Prompt Engineering:          │  │ • Plagiarism Detection       │    │
│  │ • Structured prompts         │  │ • Integrity Scoring          │    │
│  │ • Context optimization       │  │                              │    │
│  │ • Response parsing           │  │ Fallback Mechanisms:         │    │
│  │ • Error handling             │  │ • Default questions          │    │
│  │                              │  │ • Cached responses           │    │
│  │                              │  │ • Graceful degradation       │    │
│  │                              │  │                              │    │
│  └──────────────────────────────┘  └──────────────────────────────┘    │
│                                                                           │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐    │
│  │  Interview Controller        │  │  Anti-Cheat Service          │    │
│  │  (interviewController.js)    │  │  (antiCheatService.js)       │    │
│  ├──────────────────────────────┤  ├──────────────────────────────┤    │
│  │                              │  │                              │    │
│  │ • Start Interview            │  │ • Tab Switch Detection       │    │
│  │ • Submit Answer              │  │ • Copy-Paste Detection       │    │
│  │ • Complete Interview         │  │ • Window Blur Detection      │    │
│  │ • Record Anti-Cheat Events   │  │ • Browser Fingerprinting     │    │
│  │ • Record Identity Snapshot   │  │ • Identity Verification      │    │
│  │ • Get Integrity Report       │  │ • Integrity Scoring          │    │
│  │ • Get Interview Report       │  │ • Session Management         │    │
│  │                              │  │                              │    │
│  └──────────────────────────────┘  └──────────────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL AI SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    OpenAI API                                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  Model: GPT-3.5-turbo (with GPT-4 fallback)                    │   │
│  │                                                                 │   │
│  │  Capabilities:                                                  │   │
│  │  • Natural Language Understanding                              │   │
│  │  • Text Generation                                             │   │
│  │  • Content Analysis                                            │   │
│  │  • Sentiment Analysis                                          │   │
│  │  • Structured Output (JSON)                                    │   │
│  │                                                                 │   │
│  │  Configuration:                                                │   │
│  │  • Temperature: 0.3-0.7 (varies by feature)                    │   │
│  │  • Max Tokens: 1500-3000 (varies by feature)                   │   │
│  │  • Response Format: JSON                                       │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL Database                          │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  Tables:                                                        │   │
│  │  • interviews                                                   │   │
│  │    - id, jobId, candidateId, applicationId                     │   │
│  │    - questions (AI-generated)                                  │   │
│  │    - responses (candidate answers)                             │   │
│  │    - evaluation (AI evaluation)                                │   │
│  │    - scores (technical, communication, etc.)                   │   │
│  │    - antiCheatData (integrity metrics)                         │   │
│  │    - identityVerification (face detection)                     │   │
│  │                                                                 │   │
│  │  • applications                                                 │   │
│  │    - id, candidateId, jobId                                    │   │
│  │    - resume, resumeAnalysis                                    │   │
│  │    - status (APPLIED, INTERVIEWED, etc.)                       │   │
│  │                                                                 │   │
│  │  • jobs                                                         │   │
│  │    - id, title, description                                    │   │
│  │    - requiredSkills, experienceLevel                           │   │
│  │    - createdBy (employer)                                      │   │
│  │                                                                 │   │
│  │  • users                                                        │   │
│  │    - id, email, role (candidate/employer/admin)                │   │
│  │    - profile, skills, experience                               │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Generate Interview Questions Flow

```
┌─────────────┐
│   Employer  │
│  Creates    │
│    Job      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│  POST /api/ai/generate-questions    │
│  (with job details)                 │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  AI Service                         │
│  • Build prompt from job details    │
│  • Call OpenAI API                  │
│  • Parse JSON response              │
│  • Validate questions               │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  OpenAI GPT-3.5-turbo               │
│  • Analyze job requirements         │
│  • Generate relevant questions      │
│  • Vary difficulty levels           │
│  • Return JSON format               │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Response                           │
│  [                                  │
│    {                                │
│      "question": "...",             │
│      "type": "technical",           │
│      "difficulty": "medium"         │
│    }                                │
│  ]                                  │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────┐
│  Candidate  │
│  Receives   │
│  Questions  │
└─────────────┘
```

### 2. Evaluate Interview Responses Flow

```
┌─────────────┐
│  Candidate  │
│  Submits    │
│  Answers    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│  POST /api/ai/evaluate-responses    │
│  (with questions & answers)         │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Enhanced AI Service                │
│  • Analyze each answer              │
│  • Detect key concepts              │
│  • Score multiple dimensions        │
│  • Generate feedback                │
│  • Detect plagiarism                │
│  • Analyze sentiment                │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  OpenAI API (Multiple Calls)        │
│  • Evaluate answer quality          │
│  • Assess technical knowledge       │
│  • Evaluate communication           │
│  • Assess problem-solving           │
│  • Generate follow-up questions     │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Response                           │
│  {                                  │
│    "overall_score": 85,             │
│    "technical_score": 88,           │
│    "communication_score": 82,       │
│    "strengths": [...],              │
│    "weaknesses": [...],             │
│    "feedback": "..."                │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────┐
│  Employer   │
│  Reviews    │
│  Evaluation │
└─────────────┘
```

### 3. Complete Interview Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    INTERVIEW LIFECYCLE                        │
└──────────────────────────────────────────────────────────────┘

1. INTERVIEW CREATION
   ┌─────────────────────────────────────┐
   │ Candidate starts interview          │
   │ POST /interviews/start              │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ AI generates questions              │
   │ enhancedAI.generateInterviewQuestions│
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ Interview created with questions    │
   │ Status: IN_PROGRESS                 │
   └──────────────────────────────────────┘

2. INTERVIEW EXECUTION
   ┌─────────────────────────────────────┐
   │ Candidate answers questions         │
   │ POST /interviews/:id/answer         │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ AI evaluates each answer            │
   │ • Score calculation                 │
   │ • Feedback generation               │
   │ • Plagiarism detection              │
   │ • Sentiment analysis                │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ Response stored in database         │
   │ Next question provided              │
   └──────────────────────────────────────┘

3. INTERVIEW COMPLETION
   ┌─────────────────────────────────────┐
   │ Candidate completes interview       │
   │ POST /interviews/:id/complete       │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ AI generates comprehensive report   │
   │ enhancedAI.generateComprehensiveReport
   │ • Calculate overall score           │
   │ • Analyze all responses             │
   │ • Generate recommendations          │
   │ • Assess integrity                  │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ Interview marked COMPLETED          │
   │ Report stored in database           │
   │ Application status updated          │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │ Candidate views report              │
   │ GET /interviews/:id/report          │
   │ • Overall score                     │
   │ • Dimension scores                  │
   │ • Strengths/weaknesses              │
   │ • Recommendations                   │
   └──────────────────────────────────────┘
```

---

## 📊 Data Models

### Interview Model
```javascript
{
  id: String,
  jobId: String,
  candidateId: String,
  applicationId: String,
  
  // AI Generated Content
  questions: [
    {
      id: Number,
      question: String,
      type: String,        // technical, behavioral, problem-solving
      difficulty: String,  // easy, medium, hard
      expectedKeywords: [String],
      followUpTriggers: [String]
    }
  ],
  
  // Candidate Responses
  responses: [
    {
      questionIndex: Number,
      question: String,
      answer: String,
      timeTaken: Number,
      score: Number,
      feedback: String,
      plagiarismCheck: Object,
      speechAnalysis: Object,
      sentimentAnalysis: Object,
      followUp: String
    }
  ],
  
  // AI Evaluation
  evaluation: {
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    confidenceScore: Number,
    problemSolvingScore: Number,
    softSkillsScore: Number,
    fluencyScore: Number,
    professionalismScore: Number,
    strengths: [String],
    weaknesses: [String],
    recommendation: String,
    hiringDecision: String
  },
  
  // Integrity Metrics
  antiCheatData: {
    tabSwitches: Number,
    copyPasteAttempts: Number,
    suspiciousActivities: [Object],
    browserFingerprint: Object,
    events: [Object]
  },
  
  // Identity Verification
  identityVerification: {
    snapshots: [Object],
    verified: Boolean,
    lastVerified: Date
  },
  
  // Metadata
  status: String,        // IN_PROGRESS, COMPLETED
  startedAt: Date,
  completedAt: Date,
  interviewMode: String, // text, audio, video
  strictnessLevel: String // easy, moderate, strict
}
```

### Application Model
```javascript
{
  id: String,
  candidateId: String,
  jobId: String,
  
  // Resume Analysis
  resume: String,
  resumeAnalysis: {
    matchScore: Number,
    matchingSkills: [String],
    missingSkills: [String],
    experienceRelevance: String,
    recommendations: [String],
    redFlags: [String]
  },
  
  // Status
  status: String,  // APPLIED, INTERVIEWED, ACCEPTED, REJECTED
  
  // Metadata
  appliedAt: Date,
  interviewedAt: Date,
  decidedAt: Date
}
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. AUTHENTICATION                                            │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ JWT Token Validation                                │  │
│     │ • Token issued on login                             │  │
│     │ • Verified on every request                         │  │
│     │ • Expires after 7 days                              │  │
│     │ • Refresh token mechanism                           │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                               │
│  2. AUTHORIZATION                                             │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ Role-Based Access Control                           │  │
│     │ • Candidate: Can only access own interviews         │  │
│     │ • Employer: Can access own job interviews           │  │
│     │ • Admin: Can access all data                        │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                               │
│  3. API KEY PROTECTION                                        │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ OpenAI API Key                                      │  │
│     │ • Stored in .env file                               │  │
│     │ • Never exposed to frontend                         │  │
│     │ • Used only on backend                              │  │
│     │ • Environment-specific                              │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                               │
│  4. DATA ENCRYPTION                                           │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ Sensitive Data Protection                           │  │
│     │ • Passwords hashed with bcrypt                      │  │
│     │ • User data encrypted at rest                       │  │
│     │ • HTTPS for data in transit                         │  │
│     │ • Database connection encrypted                     │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                               │
│  5. AUDIT LOGGING                                             │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ Activity Tracking                                   │  │
│     │ • All API calls logged                              │  │
│     │ • User actions tracked                              │  │
│     │ • Errors recorded                                   │  │
│     │ • Integrity events monitored                        │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Client Layer (React)                                  │  │
│  │  • Hosted on Vercel / Netlify / AWS S3                 │  │
│  │  • CDN for static assets                               │  │
│  │  • Environment-specific configs                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Gateway / Load Balancer                           │  │
│  │  • Route requests to backend                           │  │
│  │  • SSL/TLS termination                                 │  │
│  │  • Rate limiting                                       │  │
│  │  • CORS handling                                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Backend Servers (Node.js)                             │  │
│  │  • Multiple instances for scalability                  │  │
│  │  • Auto-scaling based on load                          │  │
│  │  • Health checks enabled                               │  │
│  │  • Graceful shutdown handling                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database Layer (PostgreSQL)                           │  │
│  │  • Primary-replica setup                               │  │
│  │  • Automated backups                                   │  │
│  │  • Connection pooling                                  │  │
│  │  • Encryption at rest                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  External Services                                     │  │
│  │  • OpenAI API (GPT-3.5-turbo)                          │  │
│  │  • Email Service (Gmail SMTP)                          │  │
│  │  • Cloud Storage (S3 / Cloudinary)                     │  │
│  │  • Monitoring (Sentry / DataDog)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📈 Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│                  PERFORMANCE STRATEGIES                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. CACHING                                                    │
│     • Redis for session caching                              │
│     • Database query caching                                 │
│     • API response caching                                   │
│     • Client-side caching                                    │
│                                                                │
│  2. DATABASE OPTIMIZATION                                     │
│     • Indexed queries                                        │
│     • Connection pooling                                     │
│     • Query optimization                                     │
│     • Lazy loading                                           │
│                                                                │
│  3. API OPTIMIZATION                                          │
│     • Pagination for large datasets                          │
│     • Selective field retrieval                              │
│     • Compression (gzip)                                     │
│     • Request batching                                       │
│                                                                │
│  4. FRONTEND OPTIMIZATION                                     │
│     • Code splitting                                         │
│     • Lazy loading components                                │
│     • Image optimization                                     │
│     • Minification and bundling                              │
│                                                                │
│  5. AI SERVICE OPTIMIZATION                                   │
│     • Prompt caching                                         │
│     • Batch processing                                       │
│     • Response streaming                                     │
│     • Fallback mechanisms                                    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│                  SYSTEM INTEGRATIONS                          │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  OpenAI Integration                                            │
│  ├─ API Key: Stored in .env                                  │
│  ├─ Model: GPT-3.5-turbo                                     │
│  ├─ Rate Limiting: Handled by OpenAI                         │
│  └─ Error Handling: Fallback to defaults                     │
│                                                                │
│  PostgreSQL Integration                                       │
│  ├─ Connection: Via Prisma ORM                               │
│  ├─ Migrations: Automated with Prisma                        │
│  ├─ Transactions: For data consistency                       │
│  └─ Backups: Automated daily                                 │
│                                                                │
│  Email Integration                                            │
│  ├─ Provider: Gmail SMTP                                     │
│  ├─ Templates: HTML formatted                                │
│  ├─ Queue: For async sending                                 │
│  └─ Tracking: Delivery status                                │
│                                                                │
│  Cloud Storage Integration                                    │
│  ├─ Provider: AWS S3 / Cloudinary                            │
│  ├─ Files: Resumes, documents, images                        │
│  ├─ Security: Signed URLs                                    │
│  └─ CDN: For fast delivery                                   │
│                                                                │
│  Payment Integration                                          │
│  ├─ Provider: Chapa (Ethiopian payment)                      │
│  ├─ Webhooks: For payment confirmation                       │
│  ├─ Security: Signature verification                         │
│  └─ Reconciliation: Automated                                │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0
**Last Updated**: March 12, 2026
**Status**: ✅ Production Ready
