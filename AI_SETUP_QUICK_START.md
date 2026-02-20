# 🚀 AI Integration - Quick Start

**Status**: ✅ Ready to Use  
**Time to Setup**: 5 minutes

---

## ⚡ QUICK SETUP

### Step 1: Get OpenAI API Key (2 minutes)
1. Go to https://platform.openai.com/api-keys
2. Sign up or login
3. Click "Create new secret key"
4. Copy the key

### Step 2: Add to .env (1 minute)
Edit `server/.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Restart Backend (1 minute)
```bash
cd server
npm start
```

### Step 4: Test AI (1 minute)
```bash
curl http://localhost:5000/api/ai/status
```

Expected response:
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

---

## 🎯 AVAILABLE AI FEATURES

### 1. Generate Interview Questions
```javascript
POST /api/ai/generate-questions
{
  "jobDetails": { "title": "Developer", "description": "..." },
  "questionCount": 10
}
```

### 2. Evaluate Responses
```javascript
POST /api/ai/evaluate-responses
{
  "questions": [...],
  "responses": [...],
  "jobDetails": {...}
}
```

### 3. Generate Feedback
```javascript
POST /api/ai/generate-feedback
{
  "evaluation": {...},
  "candidateProfile": {...}
}
```

### 4. Analyze Resume
```javascript
POST /api/ai/analyze-resume
{
  "resumeText": "...",
  "jobRequirements": {...}
}
```

### 5. Job Recommendations
```javascript
POST /api/ai/job-recommendations
{
  "candidateProfile": {...},
  "availableJobs": [...]
}
```

### 6. Generate Cover Letter
```javascript
POST /api/ai/generate-cover-letter
{
  "candidateProfile": {...},
  "jobDetails": {...}
}
```

### 7. Analyze Performance
```javascript
POST /api/ai/analyze-performance
{
  "interviewData": {...}
}
```

### 8. Skill Development Plan
```javascript
POST /api/ai/skill-development-plan
{
  "candidateProfile": {...},
  "targetSkills": ["TypeScript", "GraphQL"]
}
```

---

## 💻 FRONTEND USAGE

### Import
```typescript
import { aiAPI } from '../../utils/api';
```

### Use in Component
```typescript
// Generate questions
const questions = await aiAPI.generateQuestions(jobDetails, 10);

// Evaluate responses
const evaluation = await aiAPI.evaluateResponses(questions, responses, jobDetails);

// Generate feedback
const feedback = await aiAPI.generateFeedback(evaluation, candidateProfile);

// Analyze resume
const analysis = await aiAPI.analyzeResume(resumeText, jobRequirements);

// Get recommendations
const recommendations = await aiAPI.generateJobRecommendations(candidateProfile, jobs);

// Generate cover letter
const coverLetter = await aiAPI.generateCoverLetter(candidateProfile, jobDetails);

// Analyze performance
const analysis = await aiAPI.analyzePerformance(interviewData);

// Generate skill plan
const plan = await aiAPI.generateSkillPlan(candidateProfile, targetSkills);
```

---

## 🔍 VERIFY SETUP

### Check Backend
```bash
curl http://localhost:5000/api/ai/status
```

### Check Frontend
Open browser console and run:
```javascript
import { aiAPI } from './utils/api';
aiAPI.checkStatus().then(res => console.log(res.data));
```

---

## 📊 PRICING ESTIMATE

| Feature | Cost |
|---------|------|
| Generate 10 questions | ~$0.01 |
| Evaluate responses | ~$0.02 |
| Generate feedback | ~$0.01 |
| Analyze resume | ~$0.01 |
| Job recommendations | ~$0.01 |
| Cover letter | ~$0.01 |
| Performance analysis | ~$0.01 |
| Skill plan | ~$0.02 |

**Total per interview**: ~$0.10

---

## ⚠️ TROUBLESHOOTING

### "AI service is disabled"
- Check `OPENAI_API_KEY` in `.env`
- Restart backend: `npm start`

### "Invalid API key"
- Verify key at https://platform.openai.com/api-keys
- Make sure key starts with `sk-`

### "Rate limit exceeded"
- Wait a few minutes
- Upgrade OpenAI plan if needed

### "Timeout error"
- Check internet connection
- Increase timeout in code if needed

---

## 📚 FULL DOCUMENTATION

See `AI_INTEGRATION_GUIDE.md` for complete documentation

---

## ✅ CHECKLIST

- [ ] OpenAI API key obtained
- [ ] `.env` file updated
- [ ] Backend restarted
- [ ] AI status endpoint tested
- [ ] Frontend API client working
- [ ] All 8 features available

---

**Status**: ✅ Ready to Use  
**Setup Time**: 5 minutes  
**Difficulty**: Easy

---

*AI Setup Quick Start - February 19, 2026*
