# Interview Questions & Answers Generation Guide

## What Was Fixed

The interview question generation wasn't working because:
1. AI question generation was being called inside a Prisma transaction (which doesn't support async API calls)
2. The transaction was trying to await an external API call

## Solution

Moved the AI question generation **outside** the transaction:
1. Generate questions first (async API call)
2. Then create the interview record with the questions (in transaction)

## How It Works

### 1. Start Interview
When a candidate starts an interview:
```
POST /api/interviews/start
{
  "jobId": 1,
  "applicationId": 1,
  "interviewMode": "text",
  "strictnessLevel": "moderate"
}
```

### 2. AI Generates Questions
The system calls OpenAI to generate interview questions based on:
- Job title and description
- Required skills
- Experience level
- Difficulty level (lenient, moderate, strict)

### 3. Questions Are Stored
Questions are saved in the interview record with:
- Question text
- Question type (technical, behavioral, problem-solving)
- Difficulty level
- Expected keywords
- Follow-up triggers

### 4. Candidate Answers
Candidate submits answers:
```
POST /api/interviews/:id/answer
{
  "questionIndex": 0,
  "answer": "candidate's answer text",
  "timeTaken": 120
}
```

### 5. AI Evaluates Answer
The system calls OpenAI to evaluate the answer:
- Technical accuracy (0-100)
- Completeness (0-100)
- Clarity (0-100)
- Relevance (0-100)
- Overall score (0-100)
- Feedback and suggestions

## Testing

### Test Question Generation
```bash
node test-interview-questions.js
```

This will:
1. Generate 5 sample questions for a Senior Software Engineer role
2. Evaluate a sample answer
3. Show scores and feedback

### Test in the Application
1. Start the server: `npm run dev`
2. Login as a candidate
3. Apply for a job
4. Start an interview
5. Questions should be generated automatically

## Fallback Questions

If OpenAI API is unavailable, the system uses fallback questions:
- 10 realistic interview questions
- Covers technical, behavioral, and problem-solving
- Works offline

## Configuration

### OpenAI API Key
Set in `server/.env`:
```
OPENAI_API_KEY=sk-proj-...
```

### Mock AI Mode
For testing without API calls:
```
USE_MOCK_AI=true
```

## Question Types

1. **Technical** (40%)
   - Tests technical knowledge
   - Requires specific keywords
   - Example: "Explain the difference between let and const in JavaScript"

2. **Behavioral** (10%)
   - Tests soft skills
   - Example: "Tell me about a time you handled conflict in a team"

3. **Problem-Solving** (30%)
   - Tests problem-solving ability
   - Example: "How would you design a scalable chat application?"

4. **Communication** (20%)
   - Tests communication skills
   - Example: "Explain a complex technical concept to a non-technical person"

## Scoring

### Technical Score
- Accuracy of technical content
- Use of correct terminology
- Depth of knowledge

### Completeness
- Covers all aspects of the question
- Provides examples
- Addresses edge cases

### Clarity
- Easy to understand
- Well-structured
- Logical flow

### Relevance
- Directly answers the question
- Relates to the job
- Practical application

## Troubleshooting

### Questions Not Generating
1. Check if OpenAI API key is set
2. Check if API key is valid
3. Check if you have API credits
4. Check server logs for errors

### Fallback Questions Being Used
This is normal if:
- OpenAI API is unavailable
- API key is not set
- USE_MOCK_AI=true

### Evaluation Not Working
1. Make sure answer is submitted correctly
2. Check if OpenAI API is working
3. Check server logs for errors

## API Endpoints

### Start Interview
```
POST /api/interviews/start
```

### Submit Answer
```
POST /api/interviews/:id/answer
```

### Get Interview Report
```
GET /api/interviews/:id/report
```

### Get Integrity Report
```
GET /api/interviews/:id/integrity
```

## Files Modified

- `server/controllers/interviewController.js` - Fixed transaction issue
- `server/services/enhancedAIService.js` - Question generation and evaluation
- `test-interview-questions.js` - Test script

## Next Steps

1. Run the test: `node test-interview-questions.js`
2. Start the server: `npm run dev`
3. Test in the application
4. Check server logs for any errors

## Support

For issues or questions, check:
- `server/logs/error.log` - Error logs
- `AI_QUESTIONS_ANSWERS_GUIDE.md` - AI setup guide
- `INTERVIEW_SYSTEM_ARCHITECTURE.md` - System architecture
