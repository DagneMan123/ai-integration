# Fix: AI Chat 500 Error

## Problem
The `/api/ai/chat` endpoint was returning 500 error when trying to send messages to the chatbot.

## Root Cause
The `chatWithAI` function in `aiService.js` was:
1. Not checking for mock mode before trying to use the API
2. Throwing errors when Groq API key was invalid
3. Not providing fallback responses on error

## Solution Applied

### 1. Updated `aiService.js`
- Added mock mode check at the beginning of `chatWithAI`
- Returns mock response when `USE_MOCK_AI=true`
- Improved error handling with fallback response

### 2. Updated `ai.js` route
- Better error handling in the `/chat` endpoint
- Returns proper error response instead of throwing
- Logs errors for debugging

## How It Works Now

When you send a chat message:
1. ✓ If `USE_MOCK_AI=true` → Returns mock response instantly
2. ✓ If Groq API available → Uses Groq API
3. ✓ If error occurs → Returns fallback response

## Testing

### Test the Chat Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "response": "I'm SimuAI Assistant. I'm here to help you prepare for interviews. How can I assist you today?",
    "timestamp": "2026-03-24T..."
  }
}
```

### In the Application
1. Start server: `npm run dev`
2. Open chatbot in the app
3. Send a message
4. Should get instant response (no 500 error)

## Configuration

Your current setup:
- `USE_MOCK_AI=true` ✓ (Mock mode enabled)
- `GROQ_API_KEY` set (but not used in mock mode)

The system will use mock responses, so no API calls are made.

## Files Modified

- `server/services/aiService.js` - Added mock mode check and error handling
- `server/routes/ai.js` - Improved error handling in chat endpoint

## What Changed

### Before
```javascript
async chatWithAI(userMessage, conversationHistory = []) {
  if (!openai && !MOCK_MODE) throw new Error('AI Engine not initialized');
  // ... tries to call API even if it fails
}
```

### After
```javascript
async chatWithAI(userMessage, conversationHistory = []) {
  if (MOCK_MODE) {
    return "I'm SimuAI Assistant..."; // Returns immediately
  }
  // ... tries API with better error handling
}
```

## Next Steps

1. Restart server: `npm run dev`
2. Test chatbot in the app
3. Send a message
4. Should work without 500 error

## Troubleshooting

**Still getting 500 error?**
1. Check server logs: `server/logs/error.log`
2. Make sure `USE_MOCK_AI=true` in `.env`
3. Restart server: `npm run dev`

**Chat not responding?**
1. Check browser console for errors
2. Check network tab to see response
3. Make sure server is running on port 5000

## Mock Responses

The chatbot will respond with:
- "I'm SimuAI Assistant. I'm here to help you prepare for interviews. How can I assist you today?"
- "I'm here to help with interview preparation. Could you tell me more about the role you're preparing for?"

These are fallback responses used when:
- `USE_MOCK_AI=true`
- API is unavailable
- API returns an error

## Production

When you have a valid Groq API key:
1. Set `USE_MOCK_AI=false` in `.env`
2. Restart server
3. Chatbot will use real Groq API responses

## Support

For issues:
1. Check `server/logs/error.log`
2. Check browser console
3. Verify `USE_MOCK_AI=true` in `.env`
4. Restart server
