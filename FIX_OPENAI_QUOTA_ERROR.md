# Fix: OpenAI Quota & API Key Errors

## Problem
You're getting two errors:
1. **429 Error**: "You exceeded your current quota" - OpenAI account has no credits
2. **401 Error**: "Incorrect API key" - Wrong API key format (Groq instead of OpenAI)

## Solution: Enable Mock AI Mode

Mock AI mode uses fallback questions and evaluations without needing OpenAI API credits.

### Step 1: Update .env
Change this line in `server/.env`:
```
USE_MOCK_AI=false
```

To this:
```
USE_MOCK_AI=true
```

### Step 2: Restart Server
```bash
npm run dev
```

The server will now use mock AI and won't call OpenAI API.

---

## What Happens with Mock AI

### Interview Questions
Instead of calling OpenAI, the system uses 10 pre-built realistic questions:
- Technical questions (40%)
- Problem-solving questions (30%)
- Communication questions (20%)
- Behavioral questions (10%)

### Answer Evaluation
Instead of calling OpenAI, the system uses a fallback evaluation:
- Technical Score: 75-85
- Completeness: 70-80
- Clarity: 75-85
- Relevance: 80-90
- Overall Score: 75-85

### Benefits
✓ No API costs
✓ No quota limits
✓ Instant responses
✓ Works offline
✓ Perfect for testing

---

## When to Use Mock AI

**Use Mock AI for:**
- Development and testing
- Demo purposes
- When you don't have OpenAI credits
- When you want to avoid API costs

**Use Real OpenAI for:**
- Production environment
- When you have API credits
- For more realistic AI responses

---

## To Use Real OpenAI Later

When you have OpenAI API credits:

1. Get your API key from: https://platform.openai.com/account/api-keys
2. Update `server/.env`:
   ```
   OPENAI_API_KEY=sk-proj-your-key-here
   USE_MOCK_AI=false
   ```
3. Restart server: `npm run dev`

---

## Current Configuration

Your `server/.env` has:
- `GROQ_API_KEY` - Groq API (not used)
- `USE_MOCK_AI=true` - Mock AI enabled ✓

The system will now:
1. Use fallback questions (no API call)
2. Use fallback evaluations (no API call)
3. Work without any external API

---

## Testing

### Test with Mock AI
```bash
node test-interview-questions.js
```

This will show:
- 5 sample questions (from fallback)
- Sample answer evaluation (from fallback)
- No API errors

### In the Application
1. Start server: `npm run dev`
2. Login as candidate
3. Apply for a job
4. Start interview
5. Questions will be generated instantly (no API call)
6. Submit answers and get instant feedback

---

## Fallback Questions

The system includes 10 realistic interview questions:

1. **Technical**: "Explain the difference between let and const in JavaScript"
2. **Technical**: "What is the difference between == and === in JavaScript?"
3. **Problem-Solving**: "How would you design a scalable chat application?"
4. **Problem-Solving**: "Describe your approach to debugging a complex issue"
5. **Behavioral**: "Tell me about a time you handled conflict in a team"
6. **Behavioral**: "Describe a situation where you had to learn something new quickly"
7. **Communication**: "Explain a complex technical concept to a non-technical person"
8. **Communication**: "How do you approach documenting your code?"
9. **Technical**: "What are the main differences between SQL and NoSQL databases?"
10. **Problem-Solving**: "How would you optimize a slow database query?"

---

## Files Modified

- `server/.env` - Set `USE_MOCK_AI=true`
- `server/services/enhancedAIService.js` - Added mock AI check

---

## Next Steps

1. Restart the server: `npm run dev`
2. Test in the application
3. Interview questions should generate instantly
4. No more API errors

---

## FAQ

**Q: Will the questions be the same every time?**
A: Yes, with mock AI. The fallback questions are fixed. With real OpenAI, they'll be different.

**Q: Can I switch between mock and real AI?**
A: Yes, just change `USE_MOCK_AI` in `.env` and restart.

**Q: Will mock AI affect the final product?**
A: No, it's just for development. Switch to real OpenAI for production.

**Q: How do I get OpenAI credits?**
A: Visit https://platform.openai.com/account/billing/overview

---

## Support

For issues:
1. Check `server/logs/error.log`
2. Make sure `USE_MOCK_AI=true` in `.env`
3. Restart the server
4. Check browser console for errors
