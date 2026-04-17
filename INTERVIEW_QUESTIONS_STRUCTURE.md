# Interview Questions Structure (10 Questions Total)

## Overview
The interview system now includes **10 comprehensive questions** structured in 3 phases:
- **Phase 1 (Turn 1)**: Introduction - 1 question
- **Phase 2 (Turns 2-9)**: Technical - 8 job-specific questions
- **Phase 3 (Turn 10)**: Closing - 1 question

---

## Phase 1: Introduction (Turn 1)

**Question 1: Professional Introduction**
```
ሰላም! (Selam - Hello!) Welcome to our professional interview. 

Please provide a professional introduction about yourself in English. Include:
1. Your name and current role
2. Your professional background (2-3 years of experience)
3. Your key skills relevant to this position
4. Why you're interested in this opportunity

Take your time and speak clearly.
```
- **Type**: Intro
- **Time Limit**: 5 minutes
- **Purpose**: Warm-up, assess communication skills, understand candidate background

---

## Phase 2: Technical Questions (Turns 2-9)

### For Senior Full Stack Developer:

**Question 2**: React & Node.js Experience
- Differences between class and functional components with hooks

**Question 3**: Database Design & Optimization
- SQL query optimization with multiple joins

**Question 4**: Debugging & Problem-Solving
- Challenging bug fix and debugging process

**Question 5**: API Design & REST Principles
- API design approach and REST principles

**Question 6**: Deployment & DevOps
- Code quality assurance before production

**Question 7**: Scalability Challenges
- System design for high traffic scenarios

**Question 8**: Microservices Architecture
- Benefits and challenges of microservices

**Question 9**: Testing & CI/CD Pipelines
- Code reliability and testing strategies

---

### For Frontend Developer:

**Question 2**: React Component Lifecycle & Hooks
- State management and side effects with hooks

**Question 3**: Frontend Performance Optimization
- Tools and techniques for performance measurement

**Question 4**: CSS & Responsive Design
- Responsive design and cross-browser compatibility

**Question 5**: State Management Solutions
- Redux vs Context API vs other solutions

**Question 6**: Frontend Testing
- Testing frameworks and strategies

**Question 7**: Accessibility (a11y)
- Ensuring applications are accessible to all users

**Question 8**: Browser Compatibility
- Tools and techniques for handling compatibility issues

**Question 9**: Complex UI Components
- Design and implementation of complex components

---

### For Backend Developer:

**Question 2**: Backend Frameworks & API Structure
- Scalable API architecture

**Question 3**: Database Experience & Data Modeling
- Data modeling and relationships

**Question 4**: Authentication & Authorization
- Security best practices

**Question 5**: Caching & Performance Optimization
- Performance optimization at scale

**Question 6**: Error Handling & Logging
- Production system reliability

**Question 7**: Message Queues & Asynchronous Processing
- When and how to use message queues

**Question 8**: Database Migrations
- Schema changes in production

**Question 9**: Monitoring & Alerting
- System reliability and monitoring

---

## Phase 3: Closing (Turn 10)

**Question 10: Final Questions**
```
Thank you for your comprehensive responses! Before we conclude, do you have any 
questions for us about the role, team, company culture, or career growth opportunities?
```
- **Type**: Closing
- **Time Limit**: 5 minutes
- **Purpose**: Allow candidate to ask questions, assess interest level
- **Marks Interview as Finished**: Yes

---

## Question Characteristics

| Aspect | Details |
|--------|---------|
| **Total Questions** | 10 |
| **Introduction Questions** | 1 |
| **Technical Questions** | 8 |
| **Closing Questions** | 1 |
| **Time per Question** | 5 minutes (300 seconds) |
| **Total Interview Time** | ~50 minutes |
| **Language** | Amharic greeting + English technical questions |
| **Minimum Response Length** | 50 characters (except closing) |

---

## Implementation Details

### Question Generation Flow:
1. Interview starts with `startInterview` endpoint
2. `InterviewPhaseManager.getQuestionForTurn()` generates questions for turns 1-10
3. All 10 questions are stored in the interview record
4. Questions are served sequentially as candidate submits responses
5. Interview completes after turn 10

### Question Structure:
```javascript
{
  text: "Question text",
  type: "intro|technical|closing",
  phase: "INTRO|TECHNICAL|FINISH",
  turn: 1-10,
  timeLimit: 300,
  minLength: 50,
  isFinished: false|true
}
```

### Job-Specific Customization:
- Questions are tailored based on job title
- Supported roles: Senior Full Stack Developer, Frontend Developer, Backend Developer
- Default to Senior Full Stack Developer if role not recognized

---

## Scoring & Evaluation

Each response is scored on:
- **Relevance** (0-30 points): Content relevance to question
- **Clarity** (0-25 points): Communication clarity and structure
- **Completeness** (0-25 points): Depth and examples provided
- **Confidence** (0-20 points): Professional language and assertiveness

**Overall Score**: Average of all 10 responses (0-100)

---

## Security & Proctoring

All interviews include:
- ✅ Copy-paste prevention
- ✅ Tab-switching detection
- ✅ AI-generated content detection
- ✅ Real-time integrity monitoring
- ✅ Violation tracking and auto-termination

---

## Files Modified

1. **server/services/aiService.js**
   - Updated `InterviewPhaseManager` class
   - Changed from 7 questions to 10 questions
   - Added 8 technical questions per role

2. **server/controllers/interviewController.js**
   - Updated `startInterview` endpoint
   - Uses `InterviewPhaseManager.getQuestionForTurn()` for all 10 questions
   - Stores all questions in interview record

3. **client/src/pages/candidate/InterviewSession.tsx**
   - Already handles dynamic question loading
   - Supports any number of questions

---

## Testing the Interview

### Start Interview:
```bash
POST /api/interviews/start
{
  "jobId": 1,
  "applicationId": 1,
  "interviewMode": "text",
  "strictnessLevel": "moderate"
}
```

### Response:
```json
{
  "success": true,
  "data": {
    "interviewId": 1,
    "firstQuestion": "ሰላም! (Selam - Hello!)...",
    "totalSteps": 10,
    "allQuestions": [...]
  }
}
```

### Submit Answer:
```bash
POST /api/interviews/submit-answer
{
  "interviewId": 1,
  "response": "My answer here..."
}
```

---

## Next Steps

1. ✅ 10-question system implemented
2. ✅ Job-specific technical questions
3. ✅ Intro + Technical + Closing structure
4. ✅ Bilingual support (Amharic + English)
5. ⏳ Test with actual candidates
6. ⏳ Gather feedback and refine questions
7. ⏳ Add more job roles as needed
