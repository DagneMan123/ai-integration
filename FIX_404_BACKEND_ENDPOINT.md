# Fix: 404 Error on /api/interviews/save-recording

## Problem
Backend endpoint returns 404 when trying to save recording.

## Root Cause
Express route matching issue - the `/:id` parameterized route was catching `/save-recording` before it could be matched.

## Solution

### 1. Route Order Fix (`server/routes/interviews.js`)

**Critical Rule**: Non-parameterized routes MUST come before parameterized routes.

**Before (WRONG):**
```javascript
router.post('/submit-answer', ...);
router.post('/:id/submit-answer', ...);  // /:id catches /save-recording!
router.post('/save-recording', ...);
```

**After (CORRECT):**
```javascript
// Specific paths first
router.post('/start', ...);
router.post('/submit-answer', ...);
router.post('/save-recording', ...);  // Before /:id routes
router.get('/candidate/my-interviews', ...);

// Parameterized routes last
router.post('/:id/submit-answer', ...);
router.post('/:id/complete', ...);
```

### 2. Enhanced Logging

Added detailed console logs to help debug:

**Frontend (`PracticeInterviewEnvironment.tsx`):**
```typescript
console.log('[Practice Interview] Calling backend endpoint:', {
  endpoint: '/api/interviews/save-recording',
  videoUrl: videoUrl ? 'provided' : 'missing',
  questionId,
  recordingTime,
  hasToken: !!token
});
```

**Backend (`interviewController.js`):**
```javascript
console.log('[saveRecording] Request received', {
  userId,
  questionId,
  recordingTime,
  videoUrl: videoUrl ? 'provided' : 'missing',
  hasBody: !!req.body
});
```

## Testing the Fix

### Step 1: Verify Route Registration
Check server logs on startup:
```
[saveRecording] Route registered: POST /api/interviews/save-recording
```

### Step 2: Test Endpoint
```bash
curl -X POST http://localhost:5000/api/interviews/save-recording \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://res.cloudinary.com/...",
    "questionId": 1,
    "recordingTime": 45
  }'
```

### Step 3: Check Console Logs
Frontend should show:
```
[Practice Interview] Calling backend endpoint: {
  endpoint: '/api/interviews/save-recording',
  videoUrl: 'provided',
  questionId: 1,
  recordingTime: 45,
  hasToken: true
}
```

Backend should show:
```
[saveRecording] Request received {
  userId: 123,
  questionId: 1,
  recordingTime: 45,
  videoUrl: 'provided',
  hasBody: true
}
```

## Files Modified

### `server/routes/interviews.js`
- Reorganized route order
- Specific paths before parameterized routes
- Added comments explaining the order

### `client/src/components/PracticeInterviewEnvironment.tsx`
- Added detailed logging before backend call
- Shows endpoint, parameters, and token status

### `server/controllers/interviewController.js`
- Added console.log statements
- Better error messages
- Stack trace logging

## Express Route Matching Rules

Express matches routes in the order they are defined:

```javascript
// Route 1: Specific path
router.post('/save-recording', handler1);

// Route 2: Parameterized path
router.post('/:id', handler2);

// If Route 1 is defined first, /save-recording matches Route 1
// If Route 2 is defined first, /save-recording matches Route 2 (WRONG!)
```

## Common Mistakes

### ❌ WRONG: Parameterized route before specific route
```javascript
router.post('/:id/submit-answer', ...);
router.post('/save-recording', ...);  // Never reached!
```

### ✅ CORRECT: Specific route before parameterized route
```javascript
router.post('/save-recording', ...);
router.post('/:id/submit-answer', ...);
```

## Debugging Checklist

- [ ] Route is defined in `server/routes/interviews.js`
- [ ] Route is before `/:id` routes
- [ ] Controller method `saveRecording` exists
- [ ] Method is exported: `exports.saveRecording`
- [ ] Token is being sent in Authorization header
- [ ] Request body has `videoUrl`, `questionId`, `recordingTime`
- [ ] Backend logs show request received
- [ ] No 404 in response

## If Still Getting 404

### Check 1: Route Registration
```bash
# Add this to server/index.js temporarily
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check 2: Middleware Order
Ensure `authenticateToken` middleware is not blocking the route:
```javascript
router.use(authenticateToken);  // Applied to all routes
router.post('/save-recording', authorizeRoles('candidate'), interviewController.saveRecording);
```

### Check 3: Controller Method
Verify method exists:
```bash
grep -n "exports.saveRecording" server/controllers/interviewController.js
```

### Check 4: Network Tab
In browser DevTools:
1. Open Network tab
2. Record video and submit
3. Look for POST request to `/api/interviews/save-recording`
4. Check Status column (should be 201, not 404)
5. Check Response tab for error details

## Expected Response

### Success (201)
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "responseId": 123,
    "videoUrl": "https://res.cloudinary.com/...",
    "message": "Recording saved successfully"
  },
  "message": "Recording saved successfully"
}
```

### Error (404)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Cannot POST /api/interviews/save-recording"
}
```

## Prevention

Always follow this pattern:

```javascript
// 1. Middleware
router.use(authenticateToken);

// 2. Specific paths (no parameters)
router.post('/start', ...);
router.post('/save-recording', ...);
router.get('/results', ...);

// 3. Specific paths with parameters (but not :id)
router.get('/job/:jobId/interviews', ...);

// 4. Parameterized paths (:id)
router.post('/:id/complete', ...);
router.get('/:id/report', ...);
```

## Related Documentation

- `ROBUST_STATE_MACHINE_IMPLEMENTATION.md` - Full implementation
- `VIDEO_INTERVIEW_FINAL_SOLUTION.md` - Solution overview
