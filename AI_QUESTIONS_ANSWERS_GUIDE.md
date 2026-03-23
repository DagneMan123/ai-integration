# AI Questions & Answers Generation Guide

## Overview
The SimuAI platform uses OpenAI's GPT-4o model to generate dynamic interview questions and evaluate candidate answers in real-time.

## How It Works

### 1. Question Generation
When a candidate starts an interview:
- The system fetches the job details (title, description, required skills, experience level)
- Sends a prompt to OpenAI to generate 10 contextual interview questions
- Questions are categorized by type: technical, behavioral, problem-solving
- Each question has difficulty levels: easy, medium, hard
- Expected keywords are provided for answer evaluation

**File:** `server/services/enhancedAIService.js` → `generateInterviewQuestions()`

### 2. Answer Evaluation
When a candidate submits an answer:
- The system sends the question, answer, and job context to OpenAI
- OpenAI evaluates the answer on multiple dimensions:
  - Technical Accuracy (0-100)
  - Completeness (0-100)
  - Clarity (0-100)
  - Relevance (0-100)
  - Overall Score (0-100)
- Provides constructive feedback, strengths, and improvement areas

**File:** `server/services/enhancedAIService.js` → `evaluateAnswer()`

### 3. Fallback System
If OpenAI API is unavailable:
- System uses pre-defined fallback questions
- Answers are evaluated using basic heuristics (word count, keyword matching)
- Ensures interviews can still proceed without AI

## Configuration

### Environment Variables
```env
# Required for AI functionality
OPENAI_API_KEY=sk-proj-xxxxx

# Optional - use mock AI for development
USE_MOCK_AI=true
```

### API Key Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `server/.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```
3. Restart the server

## Testing

### Test Question Generation
```bash
node test-ai-questions.js
```

This will:
- Generate 5 sample questions for a Senior Full Stack Developer role
- Evaluate a sample answer
- Display scores and feedback

### Manual Testing via API

**Generate Questions:**
```bash
curl -X POST http://localhost:5000/api/interviews/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobId": 1,
    "applicationId": 1,
    "interviewMode": "text",
    "strictnessLevel": "moderate"
  }'
```

**Submit Answer:**
```bash
curl -X POST http://localhost:5000/api/interviews/1/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionIndex": 0,
    "answer": "Your answer here",
    "timeTaken": 45
  }'
```

## Question Types

### Technical Questions (40%)
- Test specific technology knowledge
- Require technical depth
- Example: "Tell me about your experience with React"

### Problem-Solving Questions (30%)
- Test approach to challenges
- Require analytical thinking
- Example: "Describe a challenging project and how you solved it"

### Behavioral Questions (20%)
- Test soft skills and teamwork
- Require interpersonal awareness
- Example: "Tell me about a time you worked with a difficult team member"

### Communication Questions (10%)
- Test clarity and articulation
- Require clear expression
- Example: "Explain a complex technical concept in simple terms"

## Scoring System

### Score Breakdown
- **90-100:** Excellent - Comprehensive, well-articulated answer
- **75-89:** Good - Solid answer with minor gaps
- **60-74:** Satisfactory - Adequate answer with some improvements needed
- **45-59:** Fair - Basic understanding but lacks depth
- **Below 45:** Poor - Insufficient or incorrect answer

### Strictness Levels
- **Lenient:** Scores are 10% higher (more forgiving)
- **Moderate:** Standard scoring (default)
- **Strict:** Scores are 10% lower (more demanding)

## Troubleshooting

### Issue: "AI Service not configured"
**Solution:** 
- Check `OPENAI_API_KEY` is set in `server/.env`
- Verify API key is valid and has credits
- Restart the server

### Issue: Questions are generic/fallback
**Solution:**
- Check OpenAI API status
- Verify API key has sufficient quota
- Check server logs for API errors
- Try using `USE_MOCK_AI=true` for testing

### Issue: Evaluation scores seem incorrect
**Solution:**
- Ensure answer is substantial (at least 20 words)
- Check that job context is properly loaded
- Verify strictness level is appropriate
- Review OpenAI response format

## Performance Tips

1. **Caching:** Questions are generated once per interview session
2. **Timeout:** API calls have a 30-second timeout
3. **Fallback:** System gracefully degrades if API is unavailable
4. **Batch:** Multiple evaluations can run in parallel

## Cost Estimation

Using GPT-4o model:
- Question generation: ~$0.01 per interview
- Answer evaluation: ~$0.005 per answer
- Average interview (10 questions): ~$0.06

## Advanced Features

### Follow-up Questions
The system can generate contextual follow-up questions based on candidate responses:
```javascript
const followUp = await enhancedAI.generateFollowUpQuestion(
  originalQuestion,
  candidateAnswer,
  job
);
```

### AI Content Detection
Detect if answers contain AI-generated content:
```javascript
const result = await enhancedAI.detectAIContent(answer);
```

### Speech Pattern Analysis
Analyze speech patterns from audio transcripts:
```javascript
const patterns = enhancedAI.analyzeSpeechPatterns(transcript, duration);
```

### Sentiment Analysis
Analyze sentiment and professionalism of answers:
```javascript
const sentiment = await enhancedAI.analyzeSentiment(answer);
```

## API Reference

### generateInterviewQuestions(job, difficulty, count)
Generates interview questions based on job details.

**Parameters:**
- `job` (Object): Job details with title, description, requiredSkills
- `difficulty` (String): 'easy', 'moderate', 'hard'
- `count` (Number): Number of questions to generate (default: 10)

**Returns:** Array of question objects

### evaluateAnswer(question, answer, job, strictness)
Evaluates a candidate's answer.

**Parameters:**
- `question` (Object): Question object with expectedKeywords
- `answer` (String): Candidate's answer text
- `job` (Object): Job context
- `strictness` (String): 'lenient', 'moderate', 'strict'

**Returns:** Evaluation object with scores and feedback

## Next Steps

1. Ensure PostgreSQL is running
2. Set valid `OPENAI_API_KEY` in `.env`
3. Start the server: `npm run dev`
4. Test with: `node test-ai-questions.js`
5. Access interviews at: `http://localhost:3000/candidate/interviews`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs: `server/logs/error.log`
3. Test with mock mode: `USE_MOCK_AI=true`
4. Verify OpenAI API status and quota
