# Interview Flow Diagram - 10 Question System

## Complete Interview Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERVIEW START                              │
│                                                                  │
│  POST /api/interviews/start                                     │
│  {jobId, applicationId, interviewMode, strictnessLevel}         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              GENERATE 10 QUESTIONS                              │
│                                                                  │
│  InterviewPhaseManager.getQuestionForTurn(1-10, jobTitle)       │
│                                                                  │
│  ✓ Turn 1: Intro Question                                       │
│  ✓ Turns 2-9: 8 Technical Questions (job-specific)             │
│  ✓ Turn 10: Closing Question                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              STORE IN DATABASE                                  │
│                                                                  │
│  Interview Record:                                              │
│  - id: 1                                                        │
│  - status: IN_PROGRESS                                          │
│  - questions: [10 questions]                                    │
│  - responses: []                                                │
│  - antiCheatData: {...}                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              RETURN TO CLIENT                                   │
│                                                                  │
│  {                                                              │
│    interviewId: 1,                                              │
│    firstQuestion: "ሰላም! (Selam - Hello!)...",                 │
│    totalSteps: 10,                                              │
│    allQuestions: [...]                                          │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   TURN 1: INTRODUCTION             │
        │                                    │
        │   "ሰላም! Welcome to our           │
        │    professional interview..."      │
        │                                    │
        │   Type: INTRO                      │
        │   Time: 5 minutes                  │
        │   Min Length: 50 chars             │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   CANDIDATE RESPONDS               │
        │                                    │
        │   "My name is... I have..."        │
        │                                    │
        │   POST /api/interviews/submit-answer
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   SCORE RESPONSE                   │
        │                                    │
        │   Relevance:    25/30              │
        │   Clarity:      20/25              │
        │   Completeness: 20/25              │
        │   Confidence:   10/20              │
        │   ─────────────────────            │
        │   Total Score:  75/100             │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   LOAD NEXT QUESTION               │
        │                                    │
        │   Turn 2: Technical Question       │
        │   "Describe your experience..."    │
        │                                    │
        │   Type: TECHNICAL                  │
        │   Time: 5 minutes                  │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   TURNS 2-9: TECHNICAL QUESTIONS   │
        │                                    │
        │   [Repeat scoring & loading        │
        │    for each technical question]    │
        │                                    │
        │   Turn 2: React & Node.js          │
        │   Turn 3: Database Design          │
        │   Turn 4: Debugging                │
        │   Turn 5: API Design               │
        │   Turn 6: DevOps                   │
        │   Turn 7: Scalability              │
        │   Turn 8: Microservices            │
        │   Turn 9: Testing & CI/CD          │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   TURN 10: CLOSING QUESTION        │
        │                                    │
        │   "Do you have any questions       │
        │    for us about the role...?"      │
        │                                    │
        │   Type: CLOSING                    │
        │   Time: 5 minutes                  │
        │   isFinished: true                 │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   CANDIDATE SUBMITS FINAL ANSWER   │
        │                                    │
        │   POST /api/interviews/submit-answer
        │   (isFinished: true)               │
        └────────────┬───────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              CALCULATE OVERALL SCORE                            │
│                                                                  │
│  Average of all 10 responses:                                   │
│  (75 + 82 + 78 + 85 + 80 + 88 + 76 + 79 + 81 + 70) / 10 = 79   │
│                                                                  │
│  Overall Score: 79/100                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              UPDATE INTERVIEW STATUS                            │
│                                                                  │
│  Interview Record:                                              │
│  - status: COMPLETED                                            │
│  - completedAt: 2026-04-17T18:30:00Z                           │
│  - overallScore: 79                                             │
│  - responses: [10 responses with scores]                        │
│  - evaluation: {...}                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              GENERATE REPORT                                    │
│                                                                  │
│  Interview Report:                                              │
│  - Overall Score: 79/100                                        │
│  - Technical Score: 82/100                                      │
│  - Communication Score: 76/100                                  │
│  - Strengths: [...]                                             │
│  - Weaknesses: [...]                                            │
│  - Recommendation: Recommend                                    │
│  - Feedback: [...]                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              REDIRECT TO REPORT PAGE                            │
│                                                                  │
│  /candidate/interview/{interviewId}/report                      │
│                                                                  │
│  Display:                                                       │
│  ✓ Overall Score                                                │
│  ✓ Score Breakdown                                              │
│  ✓ Strengths & Weaknesses                                       │
│  ✓ Detailed Feedback                                            │
│  ✓ Recommendation                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Question Distribution Timeline

```
Timeline (50 minutes total)

0:00 - 5:00   │ Turn 1: Introduction
              │ "ሰላም! Welcome to our professional interview..."
              │ [Candidate introduces themselves]
              │
5:00 - 10:00  │ Turn 2: Technical Question 1
              │ "Describe your experience with React and Node.js..."
              │ [Candidate responds]
              │
10:00 - 15:00 │ Turn 3: Technical Question 2
              │ "Explain your approach to database design..."
              │ [Candidate responds]
              │
15:00 - 20:00 │ Turn 4: Technical Question 3
              │ "Tell us about a challenging bug you fixed..."
              │ [Candidate responds]
              │
20:00 - 25:00 │ Turn 5: Technical Question 4
              │ "How do you approach API design..."
              │ [Candidate responds]
              │
25:00 - 30:00 │ Turn 6: Technical Question 5
              │ "Describe your experience with deployment..."
              │ [Candidate responds]
              │
30:00 - 35:00 │ Turn 7: Technical Question 6
              │ "How do you handle scalability challenges..."
              │ [Candidate responds]
              │
35:00 - 40:00 │ Turn 8: Technical Question 7
              │ "What is your experience with microservices..."
              │ [Candidate responds]
              │
40:00 - 45:00 │ Turn 9: Technical Question 8
              │ "Tell us about your experience with testing..."
              │ [Candidate responds]
              │
45:00 - 50:00 │ Turn 10: Closing Question
              │ "Do you have any questions for us..."
              │ [Candidate responds]
              │
50:00+        │ Interview Complete
              │ Report Generated
              │ Score Calculated
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                            │
│                                                                  │
│  InterviewSession.tsx                                            │
│  - Displays questions                                            │
│  - Captures responses                                            │
│  - Submits answers                                               │
│  - Shows progress (1/10, 2/10, etc.)                            │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API LAYER (Express)                           │
│                                                                  │
│  POST /api/interviews/start                                      │
│  POST /api/interviews/submit-answer                              │
│  GET /api/interviews/{id}/report                                 │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ Business Logic
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                                │
│                                                                  │
│  interviewController.js                                          │
│  - startInterview()                                              │
│  - submitAnswer()                                                │
│  - getInterviewReport()                                          │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ Question Generation
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                                   │
│                                                                  │
│  aiService.js                                                    │
│  - InterviewPhaseManager                                         │
│    - generateIntroQuestion()                                     │
│    - generateTechnicalQuestions()                                │
│    - generateFinishQuestion()                                    │
│    - getQuestionForTurn()                                        │
│    - scoreResponse()                                             │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ Data Persistence
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                                  │
│                                                                  │
│  Prisma ORM                                                      │
│  - Interview Model                                               │
│    - questions: Json[]                                           │
│    - responses: Json[]                                           │
│    - status: InterviewStatus                                     │
│    - overallScore: Int                                           │
│    - evaluation: Json                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Security & Proctoring Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERVIEW SESSION                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SECURITY MONITORING (Real-time)                         │   │
│  │                                                          │   │
│  │  ✓ Copy-Paste Prevention                                │   │
│  │    - onPaste handler: blocked                           │   │
│  │    - onContextMenu handler: blocked                     │   │
│  │    - onDrop handler: blocked                            │   │
│  │    - Global Ctrl+V/Cmd+V: blocked                       │   │
│  │                                                          │   │
│  │  ✓ Tab-Switching Detection                              │   │
│  │    - Window blur event: +1 violation                    │   │
│  │    - 3 violations: auto-terminate                       │   │
│  │                                                          │   │
│  │  ✓ AI Content Detection                                 │   │
│  │    - Sudden text increase >50 chars: clear & alert      │   │
│  │    - AI pattern detection: flag response                │   │
│  │                                                          │   │
│  │  ✓ Real-time Monitoring                                 │   │
│  │    - Integrity score calculation                        │   │
│  │    - Violation counter display                          │   │
│  │    - Security badge: "🔒 SECURE PROCTORING ACTIVE"     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RESPONSE SUBMISSION                                     │   │
│  │                                                          │   │
│  │  1. Validate response length (min 50 chars)             │   │
│  │  2. Check for security violations                       │   │
│  │  3. Detect AI-generated content                         │   │
│  │  4. Submit to backend                                   │   │
│  │  5. Receive score & next question                       │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scoring Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE SCORING                             │
│                                                                  │
│  Input: Candidate Response Text                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. RELEVANCE SCORING (0-30 points)                      │   │
│  │                                                          │   │
│  │  Character Length Analysis:                             │   │
│  │  - < 50 chars:   8 points                               │   │
│  │  - 50-150 chars: 15 points                              │   │
│  │  - 150-300 chars: 20 points                             │   │
│  │  - 300-500 chars: 25 points                             │   │
│  │  - > 500 chars:  30 points                              │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  2. CLARITY SCORING (0-25 points)                        │   │
│  │                                                          │   │
│  │  Structure Analysis:                                    │   │
│  │  - Sentence count & average length                      │   │
│  │  - Optimal: 8-20 words per sentence                     │   │
│  │  - Good structure: +20 points                           │   │
│  │  - Fair structure: +12 points                           │   │
│  │  - Poor structure: +5 points                            │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  3. COMPLETENESS SCORING (0-25 points)                   │   │
│  │                                                          │   │
│  │  Content Analysis:                                      │   │
│  │  - Has examples/projects: +15 points                    │   │
│  │  - Has specific details: +10 points                     │   │
│  │  - Both examples & details: +25 points                  │   │
│  │  - Neither: +10 points                                  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  4. CONFIDENCE SCORING (0-20 points)                     │   │
│  │                                                          │   │
│  │  Language Analysis:                                     │   │
│  │  - Professional language: +10 points                    │   │
│  │  - Assertive tone: +10 points                           │   │
│  │  - Both: +20 points                                     │   │
│  │  - Neither: +8 points                                   │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FINAL SCORE CALCULATION                                 │   │
│  │                                                          │   │
│  │  Total = Relevance + Clarity + Completeness + Confidence│   │
│  │  Normalized = min(100, max(0, Total))                   │   │
│  │                                                          │   │
│  │  Output: Score (0-100)                                  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Overall Score Calculation

```
Interview Complete (10 Responses)

Response 1 (Intro):      75 points
Response 2 (Technical):  82 points
Response 3 (Technical):  78 points
Response 4 (Technical):  85 points
Response 5 (Technical):  80 points
Response 6 (Technical):  88 points
Response 7 (Technical):  76 points
Response 8 (Technical):  79 points
Response 9 (Technical):  81 points
Response 10 (Closing):   70 points
                         ──────────
Total:                   794 points

Overall Score = 794 / 10 = 79.4 ≈ 79/100

Recommendation:
- 90-100: Strongly Recommend
- 80-89:  Recommend
- 70-79:  Consider (79 = Consider)
- 60-69:  Marginal
- < 60:   Reject
```

---

**Last Updated**: April 17, 2026
**Version**: 2.0 (10-Question System)
**Status**: Production Ready ✅
