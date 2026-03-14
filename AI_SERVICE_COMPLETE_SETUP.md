# AI Service - Complete Setup & Verification Guide

## Current Status

✅ **AI Service is Configured**
- OpenAI API Key: Present in `server/.env`
- AI Routes: Fully implemented in `server/routes/ai.js`
- AI Service: Complete with all features in `server/services/aiService.js`

---

## What AI Features Are Available

### 1. Generate Interview Questions
**Endpoint**: `POST /api/ai/generate-questions`
```json
{
  "jobDetails": {
    "title": "Senior Software Engineer",
    "job_type": "Full-time",
    "experience_level": "Senior",
    "interview_type": "Technical",
    "required_skills": ["JavaScript", "React", "Node.js"],
    "description": "Job description here"
  },
  "questionCount": 10
}
```

### 2. Evaluate Interview Responses
**Endpoint**: `POST /api/ai/evaluate-responses`
```json
{
  "questions": [...],
  "responses": [...],
  "jobDetails": {...}
}
```

### 3. Generate Personalized Feedback
**Endpoint**: `POST /api/ai/generate-feedback`
```json
{
  "evaluation": {...},
  "candidateProfile": {
    "experience_level": "Senior",
    "skills": ["JavaScript", "React"]
  }
}
```

### 4. Analyze Resume
**Endpoint**: `POST /api/ai/analyze-resume`
```json
{
  "resumeText": "Resume content here",
  "jobRequirements": {...}
}
```

### 5. Generate Job Recommendations
**Endpoint**: `POST /api/ai/job-recommendations`
```json
{
  "candidateProfile": {...},
  "availableJobs": [...]
}
```

### 6. Generate Cover Letter
**Endpoint**: `POST /api/ai/generate-cover-letter`
```json
{
  "candidateProfile": {...},
  "jobDetails": {...}
}
```

### 7. Analyze Interview Performance
**Endpoint**: `POST /api/ai/analyze-performance`
```json
{
  "interviewData": {
    "duration": 45,
    "questionsCount": 5,
    "technicalScore": 85,
    "communicationScore": 80,
    "problemSolvingScore": 75,
    "overallScore": 80
  }
}
```

### 8. Generate Skill Development Plan
**Endpoint**: `POST /api/ai/skill-development-plan`
```json
{
  "candidateProfile": {...},
  "targetSkills": ["Python", "Machine Learning", "Data Analysis"]
}
```

### 9. Check AI Status
**Endpoint**: `GET /api/ai/status`
- Returns: `{ available: true/false, reason: "..." }`

---

## How to Use AI Features

### From Frontend (React)
```typescript
import { aiAPI } from '../utils/api';

// Generate questions
const questions = await aiAPI.generateQuestions(jobDetails, 10);

// Evaluate responses
const evaluation = await aiAPI.evaluateResponses(questions, responses, jobDetails);

// Generate feedback
const feedback = await aiAPI.generateFeedback(evaluation, candidateProfile);

// Analyze resume
const analysis = await aiAPI.analyzeResume(resumeText, jobRequirements);

// Get job recommendations
const recommendations = await aiAPI.generateJobRecommendations(candidateProfile, jobs);

// Generate cover letter
const coverLetter = await aiAPI.generateCoverLetter(candidateProfile, jobDetails);

// Analyze performance
const performance = await aiAPI.analyzePerformance(interviewData);

// Generate skill plan
const skillPlan = await aiAPI.generateSkillPlan(candidateProfile, targetSkills);

// Check status
const status = await aiAPI.checkStatus();
```

### From Backend (Node.js)
```javascript
const aiService = require('./services/aiService');

// Generate questions
const questions = await aiService.generateInterviewQuestions(jobDetails, 10);

// Evaluate responses
const evaluation = await aiService.evaluateResponses(questions, responses, jobDetails);

// Generate feedback
const feedback = await aiService.generateFeedback(evaluation, candidateProfile);

// Check availability
const status = await aiService.checkAvailability();
```

---

## Testing AI Service

### Quick Test (Manual)
1. Start server: `npm start`
2. Check AI status:
   ```bash
   curl http://localhost:5000/api/ai/status
   ```
3. Should return:
   ```json
   {
     "success": true,
     "data": {
       "available": true,
       "model": "gpt-3.5-turbo",
       "message": "AI service is operational"
     }
   }
   ```

### Automated Test
Run the test file:
```bash
node test-ai-service.js
```

This will test:
- ✅ AI service availability
- ✅ Interview question generation
- ✅ Response evaluation
- ✅ Feedback generation

---

## Configuration

### OpenAI API Key
**Location**: `server/.env`
```
OPENAI_API_KEY=sk-proj-...
```

**Current Status**: ✅ Configured

**To Update**:
1. Get API key from: https://platform.openai.com/api-keys
2. Update `server/.env`:
   ```
   OPENAI_API_KEY=your_new_key_here
   ```
3. Restart server: `npm start`

### Model Used
- **Model**: `gpt-3.5-turbo`
- **Cost**: ~$0.0005 per 1K tokens
- **Speed**: Fast (1-2 seconds per request)

### Alternative Models
If you want to use a different model, edit `server/services/aiService.js`:
```javascript
// Change from:
model: "gpt-3.5-turbo"

// To:
model: "gpt-4"  // More powerful but slower and more expensive
```

---

## Features Implemented

### Interview System
✅ Generate interview questions based on job requirements
✅ Evaluate candidate responses
✅ Generate personalized feedback
✅ Analyze interview performance
✅ Provide hiring recommendations

### Resume Analysis
✅ Analyze resume against job requirements
✅ Calculate match score
✅ Identify matching and missing skills
✅ Provide recommendations

### Career Development
✅ Generate job recommendations
✅ Generate cover letters
✅ Create skill development plans
✅ Provide learning resources

### Logging
✅ All AI operations logged with `[AI]` prefix
✅ Tracks API usage and performance
✅ Error logging for debugging

---

## Error Handling

### If AI Service is Not Available
The system has fallback mechanisms:
1. **Default Questions**: If question generation fails, returns default questions
2. **Default Evaluation**: If evaluation fails, returns default scores (70/100)
3. **Graceful Degradation**: All endpoints return meaningful responses even if AI fails

### Common Issues

#### Issue 1: "API key not configured"
**Solution**:
1. Check `server/.env` has `OPENAI_API_KEY`
2. Verify key is valid: https://platform.openai.com/api-keys
3. Restart server

#### Issue 2: "Rate limit exceeded"
**Solution**:
1. Wait a few minutes
2. Check OpenAI usage: https://platform.openai.com/account/usage
3. Consider upgrading plan if needed

#### Issue 3: "Invalid API key"
**Solution**:
1. Generate new key: https://platform.openai.com/api-keys
2. Update `server/.env`
3. Restart server

#### Issue 4: "Model not found"
**Solution**:
1. Verify model name is correct: `gpt-3.5-turbo`
2. Check OpenAI account has access to model
3. Try `gpt-3.5-turbo` instead of `gpt-4`

---

## Performance Optimization

### Caching Recommendations
For frequently used features, consider caching:
```javascript
// Cache interview questions for same job
const cacheKey = `questions-${jobId}`;
const cached = cache.get(cacheKey);
if (cached) return cached;

const questions = await aiService.generateInterviewQuestions(jobDetails);
cache.set(cacheKey, questions, 3600); // Cache for 1 hour
return questions;
```

### Batch Processing
For multiple evaluations:
```javascript
// Process multiple evaluations in parallel
const evaluations = await Promise.all(
  responses.map(r => aiService.evaluateResponses(questions, r, jobDetails))
);
```

---

## Monitoring

### Check AI Usage
1. Go to: https://platform.openai.com/account/usage
2. View API usage and costs
3. Set usage limits if needed

### Server Logs
Look for `[AI]` entries:
```
[AI] info: Generating interview questions
[AI] info: Interview questions generated successfully
[AI] error: Failed to generate interview questions
```

---

## Integration Points

### Interview System
- `server/controllers/interviewController.js` - Uses AI for question generation
- `server/routes/interviews.js` - Interview endpoints

### Job Matching
- `server/controllers/jobController.js` - Uses AI for recommendations
- `server/routes/jobs.js` - Job endpoints

### Resume Analysis
- `server/controllers/applicationController.js` - Uses AI for resume analysis
- `server/routes/applications.js` - Application endpoints

### Frontend Components
- `client/src/pages/candidate/EnhancedInterviewSession.tsx` - Interview UI
- `client/src/pages/candidate/InterviewReport.tsx` - Results display
- `client/src/pages/candidate/Profile.tsx` - Profile and recommendations

---

## Next Steps

### To Enable AI Features
1. ✅ API key is configured
2. ✅ Routes are set up
3. ✅ Service is implemented
4. Start server: `npm start`
5. Test endpoint: `GET /api/ai/status`
6. Use AI features in your application

### To Integrate with Frontend
1. Import `aiAPI` from `client/src/utils/api.ts`
2. Call AI endpoints in your components
3. Display results to users
4. Handle errors gracefully

### To Monitor Usage
1. Check OpenAI dashboard: https://platform.openai.com/account/usage
2. Review server logs for `[AI]` entries
3. Monitor response times
4. Optimize as needed

---

## Support Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Pricing**: https://openai.com/pricing
- **Status Page**: https://status.openai.com

---

## Summary

✅ **AI Service Status**: READY TO USE
- OpenAI API Key: Configured
- All endpoints: Implemented
- Error handling: In place
- Logging: Active
- Frontend integration: Available

**To start using AI features**:
1. Ensure server is running: `npm start`
2. Call AI endpoints from frontend
3. Monitor usage and performance
4. Enjoy AI-powered features!

---

**Last Updated**: March 9, 2026
**Status**: Production Ready
