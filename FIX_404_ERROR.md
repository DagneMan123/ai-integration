# Fix 404 Error on /api/interviews/save-recording

## Problem
Upload fails with: `Request failed with status code 404`

## Root Causes (Check in Order)

### 1. Backend Not Running ⚠️ MOST COMMON
**Check**: Is the backend server running on port 5000?

```bash
# Check if backend is running
curl http://localhost:5000/health

# Expected response:
# { "status": "OK", "database": "connected", ... }
```

**Fix**: Start the backend server
```bash
cd server
npm start
```

---

### 2. Route Not Registered
**Check**: Is the route properly registered in `server/routes/interviews.js`?

```javascript
// Line 14 should have:
router.post('/save-recording', authorizeRoles('candidate'), interviewController.saveRecording);
```

**Verify**:
```bash
grep -n "save-recording" server/routes/interviews.js
# Should show: 14:router.post('/save-recording', ...
```

---

### 3. Method Not Exported
**Check**: Is `saveRecording` exported from the controller?

```javascript
// server/controllers/interviewController.js line 746 should have:
exports.saveRecording = async (req, res, next) => {
```

**Verify**:
```bash
grep -n "exports.saveRecording" server/controllers/interviewController.js
# Should show: 746:exports.saveRecording = async (req, res, next) => {
```

---

### 4. Route Order Issue
**Check**: Is `/save-recording` BEFORE parameterized routes like `/:id`?

```javascript
// ✅ CORRECT ORDER:
router.post('/save-recording', ...);  // Line 14 - Specific
router.post('/:id/submit-answer', ...); // Line 28 - Parameterized

// ❌ WRONG ORDER:
router.post('/:id/submit-answer', ...); // Parameterized first
router.post('/save-recording', ...);  // Never reached!
```

**Fix**: Move `/save-recording` route BEFORE `/:id` routes

---

### 5. Authentication Middleware Issue
**Check**: Is the token being sent correctly?

```javascript
// In browser DevTools → Network → save-recording request
// Headers should include:
Authorization: Bearer {token}
Content-Type: application/json
```

**Verify in console**:
```javascript
// Open browser console and run:
localStorage.getItem('token')
// Should return a token string, not null
```

**Fix**: If token is null, user needs to log in again

---

### 6. Proxy Configuration Issue
**Check**: Is the frontend proxy configured correctly?

```javascript
// client/src/setupProxy.js should have:
target: 'http://localhost:5000'
```

**Fix**: Restart frontend dev server after checking proxy

---

## Diagnostic Steps

### Step 1: Check Backend Health
```bash
curl http://localhost:5000/health
```

**Expected**:
```json
{
  "status": "OK",
  "database": "connected",
  "uptime": 123.45
}
```

**If fails**: Backend not running

---

### Step 2: Check Route Registration
```bash
# In server directory:
grep -A 2 "save-recording" server/routes/interviews.js
```

**Expected**:
```
router.post('/save-recording', authorizeRoles('candidate'), interviewController.saveRecording);
```

**If not found**: Route not registered

---

### Step 3: Check Method Export
```bash
# In server directory:
grep "exports.saveRecording" server/controllers/interviewController.js
```

**Expected**:
```
exports.saveRecording = async (req, res, next) => {
```

**If not found**: Method not exported

---

### Step 4: Check Token in Browser
```javascript
// Open browser console and run:
console.log('Token:', localStorage.getItem('token'));
```

**Expected**: A long JWT token string  
**If null**: User not logged in

---

### Step 5: Check Network Request
1. Open DevTools → Network tab
2. Try to record and upload
3. Look for `save-recording` request
4. Check:
   - Status code (should be 201 or 200, not 404)
   - Request URL (should be `/api/interviews/save-recording`)
   - Request headers (should include `Authorization: Bearer {token}`)
   - Response (should show error details)

---

## Common Error Messages

### "404 Not Found"
**Cause**: Route not found  
**Fix**: Check route registration and order

### "401 Unauthorized"
**Cause**: Token missing or invalid  
**Fix**: Log in again

### "403 Forbidden"
**Cause**: User role not 'candidate'  
**Fix**: Check user role in database

### "503 Service Unavailable"
**Cause**: Backend not running  
**Fix**: Start backend server

---

## Quick Fix Checklist

- [ ] Backend running on port 5000?
- [ ] Route registered in `server/routes/interviews.js`?
- [ ] Method exported in `server/controllers/interviewController.js`?
- [ ] Route order correct (specific before parameterized)?
- [ ] Token exists in localStorage?
- [ ] Token sent in Authorization header?
- [ ] Frontend proxy configured correctly?
- [ ] Frontend dev server restarted?

---

## Debug Mode

### Enable Detailed Logging

**Frontend** (already added):
```javascript
console.log('[Practice Interview] Calling backend endpoint:', {
  endpoint: '/api/interviews/save-recording',
  videoUrl: videoUrl ? 'provided' : 'missing',
  questionId: currentQuestion.id,
  recordingTime,
  hasToken: !!token
});

console.error('[Practice Interview] Error details:', {
  message: error.message,
  status: error.response?.status,
  statusText: error.response?.statusText,
  url: error.config?.url,
  method: error.config?.method,
  data: error.response?.data
});
```

**Backend** (add to controller):
```javascript
console.log('[saveRecording] Request received', {
  userId: req.user?.id,
  questionId: req.body.questionId,
  videoUrl: req.body.videoUrl ? 'provided' : 'missing',
  hasToken: !!req.headers.authorization
});
```

---

## Testing the Endpoint

### Using curl
```bash
# Get a token first (from login response)
TOKEN="your_jwt_token_here"

# Test the endpoint
curl -X POST http://localhost:5000/api/interviews/save-recording \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.webm",
    "questionId": 1,
    "recordingTime": 30
  }'
```

**Expected response**:
```json
{
  "success": true,
  "data": {
    "responseId": 123,
    "videoUrl": "https://example.com/video.webm",
    "message": "Recording saved successfully"
  }
}
```

---

## Still Not Working?

### Check Server Logs
```bash
# In server directory:
tail -f server/logs/combined.log
# or
tail -f server/logs/error.log
```

### Check Database Connection
```bash
# Verify PostgreSQL is running
# Windows:
Get-Service postgresql-x64-15

# Linux:
sudo systemctl status postgresql
```

### Restart Everything
```bash
# Stop backend
Ctrl+C

# Stop frontend
Ctrl+C

# Clear node_modules cache
cd server && npm cache clean --force
cd ../client && npm cache clean --force

# Restart backend
cd server && npm start

# Restart frontend (in new terminal)
cd client && npm start
```

---

## Prevention

### Before Deployment
1. ✅ Verify route is registered
2. ✅ Verify method is exported
3. ✅ Verify route order (specific before parameterized)
4. ✅ Test endpoint with curl
5. ✅ Check server logs for errors
6. ✅ Verify database connection
7. ✅ Test with real token

### Monitoring
- Monitor server logs for 404 errors
- Monitor network requests in DevTools
- Check backend health endpoint regularly
- Verify token validity

---

## Summary

**404 Error** = Route not found or backend not running

**Quick Fix**:
1. Check backend is running: `curl http://localhost:5000/health`
2. Check route is registered: `grep save-recording server/routes/interviews.js`
3. Check method is exported: `grep exports.saveRecording server/controllers/interviewController.js`
4. Restart backend and frontend

---

**Last Updated**: April 20, 2026  
**Status**: Diagnostic guide for 404 errors
