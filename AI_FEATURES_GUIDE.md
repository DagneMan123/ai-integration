# AI Features Guide

## Overview
Your application has a fully integrated AI service powered by OpenAI's GPT-3.5-turbo model. The AI features are available through the `/api/ai` endpoints.

## Prerequisites
- ✅ OpenAI API Key is configured in `.env` (already set)
- ✅ PostgreSQL database is running
- ✅ Server is running on port 5000
- ✅ User must be authenticated (JWT token required for most endpoints)

## Available AI Endpoints

### 1. Check AI Service Status
**Endpoint:** `GET /api/ai/status`
**Authentication:** Not required
**Description:** Check if AI service is available and operational

**Response:**
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

### 2. Generate Interview Questions
**Endpoint:** `POST /api/ai/generate-questions`
**Authentication:** Required (Bearer token)
**Description:** Generate interview questions based on job details

**Request Body:**
```json
{
  "jobDetails": {
    "title": "Senior React Developer",
    "job_type": "Full-time",
    "experience_level": "Senior",
    "interview_type": "Technical",
    "required_skills": ["React", "TypeScript", "Node.js"],
    "description": "We are looking for a Senior React Developer..."
  },
  "questionCount": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "question_number": 1,
      "question": "Tell me about your experience with React hooks...",
      "type": "Technical",
      "difficulty": "Medium"
    }
  ],
  "message": "Interview questions generated successfully"
}
```

---

### 3. Evaluate Interview Responses
**Endpoint:** `POST /api/ai/evaluate-responses`
**Authentication:** Required
**Description:** Evaluate candidate responses to interview questions

**Request Body:**
```json
{
  "questions": [
    {
      "question_number": 1,
      "question": "Tell me about your experience with React hooks...",
      "type": "Technical",
      "difficulty": "Medium"
    }
  ],
  "responses": [
    {
      "question_number": 1,
      "answer": "I have 5 years of experience with React hooks..."
    }
  ],
  "jobDetails": {
    "title": "Senior React Developer",
    "description": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": 85,
    "technical_score": 88,
    "communication_score": 82,
    "problem_solving_score": 80,
    "strengths": ["Strong technical knowledge", "Clear communication"],
    "weaknesses": ["Limited system design experience"],
    "recommendation": "Strongly Recommend",
    "detailed_feedback": "..."
  },
  "message": "Responses evaluated successfully"
}
```

---

### 4. Generate Personalized Feedback
**Endpoint:** `POST /api/ai/generate-feedback`
**Authentication:** Required
**Description:** Generate personalized feedback based on evaluation

**Request Body:**
```json
{
  "evaluation": {
    "overall_score": 85,
    "technical_score": 88,
    "communication_score": 82,
    "problem_solving_score": 80
  },
  "candidateProfile": {
    "experience_level": "Senior",
    "skills": ["React", "TypeScript", "Node.js"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": "Overall performance summary...",
    "generated_at": "2026-03-09T17:30:00.000Z"
  },
  "message": "Feedback generated successfully"
}
```

---

### 5. Analyze Resume
**Endpoint:** `POST /api/ai/analyze-resume`
**Authentication:** Required
**Description:** Analyze resume against job requirements

**Request Body:**
```json
{
  "resumeText": "John Doe\nSenior React Developer...",
  "jobRequirements": {
    "title": "Senior React Developer",
    "required_skills": ["React", "TypeScript", "Node.js"],
    "experience_years": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "match_score": 92,
    "matching_skills": ["React", "TypeScript"],
    "missing_skills": ["GraphQL"],
    "experience_relevance": "Highly Relevant",
    "recommendations": ["Learn GraphQL"],
    "red_flags": []
  },
  "message": "Resume analyzed successfully"
}
```

---

### 6. Generate Job Recommendations
**Endpoint:** `POST /api/ai/job-recommendations`
**Authentication:** Required
**Description:** Recommend jobs based on candidate profile

**Request Body:**
```json
{
  "candidateProfile": {
    "experience_level": "Senior",
    "skills": ["React", "TypeScript", "Node.js"],
    "salary_expectation": 150000,
    "availability": "Immediate"
  },
  "availableJobs": [
    {
      "id": 1,
      "title": "Senior React Developer",
      "company": { "name": "Tech Corp" },
      "requiredSkills": ["React", "TypeScript"],
      "experienceLevel": "Senior",
      "salaryMin": 140000,
      "salaryMax": 180000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "job_id": 1,
      "match_score": 95,
      "reasons": ["Strong skill match", "Salary alignment"]
    }
  ],
  "message": "Job recommendations generated successfully"
}
```

---

### 7. Generate Cover Letter
**Endpoint:** `POST /api/ai/generate-cover-letter`
**Authentication:** Required
**Description:** Generate a professional cover letter

**Request Body:**
```json
{
  "candidateProfile": {
    "firstName": "John",
    "lastName": "Doe",
    "experience_level": "Senior",
    "skills": ["React", "TypeScript"],
    "bio": "Passionate developer with 5+ years experience"
  },
  "jobDetails": {
    "title": "Senior React Developer",
    "company": { "name": "Tech Corp" },
    "description": "We are looking for...",
    "requiredSkills": ["React", "TypeScript"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coverLetter": "Dear Hiring Manager...",
    "generated_at": "2026-03-09T17:30:00.000Z"
  },
  "message": "Cover letter generated successfully"
}
```

---

### 8. Analyze Interview Performance
**Endpoint:** `POST /api/ai/analyze-performance`
**Authentication:** Required
**Description:** Analyze overall interview performance

**Request Body:**
```json
{
  "interviewData": {
    "duration": 45,
    "questionsCount": 10,
    "responseQuality": "Good",
    "technicalScore": 85,
    "communicationScore": 82,
    "problemSolvingScore": 80,
    "overallScore": 82
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Performance summary...",
    "analyzed_at": "2026-03-09T17:30:00.000Z"
  },
  "message": "Interview performance analyzed successfully"
}
```

---

### 9. Generate Skill Development Plan
**Endpoint:** `POST /api/ai/skill-development-plan`
**Authentication:** Required
**Description:** Create a personalized skill development plan

**Request Body:**
```json
{
  "candidateProfile": {
    "experience_level": "Mid-level",
    "skills": ["React", "JavaScript"],
    "learningStyle": "Hands-on projects"
  },
  "targetSkills": ["TypeScript", "Node.js", "GraphQL"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "developmentPlan": "Comprehensive plan...",
    "created_at": "2026-03-09T17:30:00.000Z"
  },
  "message": "Skill development plan generated successfully"
}
```

---

## How to Use in Frontend

### Example: Generate Interview Questions
```typescript
// In your React component
const generateQuestions = async () => {
  try {
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobDetails: {
          title: 'Senior React Developer',
          job_type: 'Full-time',
          experience_level: 'Senior',
          interview_type: 'Technical',
          required_skills: ['React', 'TypeScript'],
          description: 'Job description here'
        },
        questionCount: 10
      })
    });

    const data = await response.json();
    console.log('Generated Questions:', data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Testing the AI Service

### 1. Check Status (No Auth Required)
```bash
curl http://localhost:5000/api/ai/status
```

### 2. Generate Questions (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobDetails": {
      "title": "Senior React Developer",
      "job_type": "Full-time",
      "experience_level": "Senior",
      "interview_type": "Technical",
      "required_skills": ["React", "TypeScript"],
      "description": "We are looking for a Senior React Developer"
    },
    "questionCount": 5
  }'
```

---

## Error Handling

### Common Errors

**401 Unauthorized**
- Missing or invalid JWT token
- Solution: Include valid Bearer token in Authorization header

**400 Bad Request**
- Missing required fields
- Solution: Check request body matches the schema

**500 Internal Server Error**
- OpenAI API error or service unavailable
- Solution: Check OpenAI API key and service status

---

## Configuration

### Environment Variables
```env
# Already configured in .env
OPENAI_API_KEY=sk-proj-...
```

### Model Settings
- **Model:** gpt-3.5-turbo
- **Temperature:** 0.3 - 0.7 (varies by endpoint)
- **Max Tokens:** 1500 - 3000 (varies by endpoint)

---

## Best Practices

1. **Always include authentication** for protected endpoints
2. **Validate input data** before sending to AI
3. **Handle errors gracefully** in your frontend
4. **Cache results** when possible to reduce API calls
5. **Use appropriate temperature settings** for consistency
6. **Test with sample data** before production use

---

## Troubleshooting

### AI Service Not Available
1. Check if PostgreSQL is running
2. Verify OpenAI API key in `.env`
3. Check server logs for errors
4. Test status endpoint: `GET /api/ai/status`

### Questions Not Generated
1. Verify job details are complete
2. Check OpenAI API quota
3. Review server logs for API errors
4. Try with fewer questions (reduce questionCount)

### Authentication Errors
1. Ensure user is logged in
2. Verify JWT token is valid
3. Check token expiration
4. Include Bearer prefix in Authorization header

---

## Next Steps

1. ✅ Start PostgreSQL
2. ✅ Start the server
3. ✅ Test AI status endpoint
4. ✅ Integrate AI features into your frontend
5. ✅ Test with real data

