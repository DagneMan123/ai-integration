# Troubleshoot 404 Error - Complete Guide

## Error: "Upload failed: Request failed with status code 404"

This means the backend endpoint `/api/interviews/save-recording` is not being found.

---

## Step-by-Step Troubleshooting

### Step 1: Verify Backend is Running

**Check if backend is running**:
```bash
# Open a new terminal and run:
curl http://localhost:5000/health
```

**Expected response**:
```json
{
  "status": "OK",
  "database": "connected",
  "uptime": 123.45,
  "memory": { ... }
}
```

**If you get "Connection refused"**:
- Backend is NOT running
- Start it: `cd server && npm start`

---

### Step 2: Test the Interviews Router

**Check if the interviews router is working**:
```bash
# Get a token first from login response, then:
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/interviews/test \
  -H "Authorization: Bearer $TOKEN"
```

**Expected response**:
```json
{
  "success": true,
  "message": "Interviews router is working",
  "path": "/api/interviews/test",
  "user": 123
}
```

**If you get 404**:
- Route is not registered
- Check: `server/routes/interviews.js` exists
- Check: `server/index.js` has `app.use('/api/interviews', require('./routes/interviews'))`

**If you get 401**:
- Token is invalid or expired
- Log in again to get a new token

---

### Step 3: Test the Save-Recording Endpoint

**Test with curl**:
```bash
TOKEN="your_jwt_token_here"

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

**If you get 404**:
- Route is not registered
- Check: Line 35 in `server/routes/interviews.js` has `router.post('/save-recording', ...)`

**If you get 401**:
- Token is invalid
- Log in again

**If you get 403**:
- User role is not 'candidate'
- Check user role in database

---

### Step 4: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to record and upload
4. Look for `save-recording` request
5. Click on it and check:

**Request**:
- URL: `http://localhost:5000/api/interviews/save-recording` or `http://localhost:3000/api/interviews/save-recording`
- Method: `POST`
- Headers:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

**Response**:
- Status: Should be 201 or 200 (not 404)
- Body: Should show error details if failed

**If Status is 404**:
- Backend endpoint not found
- Check route registration

**If Status is 401**:
- Token missing or invalid
- Check Authorization header

---

### Step 5: Check Server Logs

**View server logs**:
```bash
# In server directory:
tail -f server/logs/combined.log
# or
tail -f server/logs/error.log
```

**Look for**:
- `[Interviews Router]` messages (should show the request)
- `[saveRecording]` messages (should show the handler)
- Error messages

**If you see 404 errors**:
- Route is not being matched
- Check route order in `server/routes/interviews.js`

---

### Step 6: Verify Route Registration

**Check route file**:
```bash
# In server directory:
grep -n "save-recording" server/routes/interviews.js
```

**Expected output**:
```
35:router.post('/save-recording', authorizeRoles('candidate'), interviewController.saveRecording);
```

**If not found**:
- Route is not registered
- Add it to `server/routes/interviews.js`

---

### Step 7: Verify Method Export

**Check controller**:
```bash
# In server directory:
grep -n "exports.saveRecording" server/controllers/interviewController.js
```

**Expected output**:
```
746:exports.saveRecording = async (req, res, next) => {
```

**If not found**:
- Method is not exported
- Add it to `server/controllers/interviewController.js`

---

### Step 8: Check Route Order

**Critical**: Specific routes MUST come before parameterized routes

**Correct order** (in `server/routes/interviews.js`):
```javascript
// Line 35 - Specific routes first
router.post('/save-recording', ...);
router.post('/start', ...);
router.post('/submit-answer', ...);

// Line 50+ - Parameterized routes last
router.post('/:id/submit-answer', ...);
router.post('/:id/complete', ...);
```

**Wrong order** (will cause 404):
```javascript
// Parameterized routes first
router.post('/:id/submit-answer', ...);

// Specific routes never reached!
router.post('/save-recording', ...);
```

---

## Common Issues & Fixes

### Issue 1: Backend Not Running
**Symptom**: "Connection refused" when testing  
**Fix**: Start backend
```bash
cd server
npm start
```

### Issue 2: Route Not Registered
**Symptom**: 404 on `/api/interviews/test`  
**Fix**: Check `server/routes/interviews.js` exists and is mounted in `server/index.js`

### Issue 3: Method Not Exported
**Symptom**: 404 on `/api/interviews/save-recording`  
**Fix**: Check `exports.saveRecording` exists in `server/controllers/interviewController.js`

### Issue 4: Wrong Route Order
**Symptom**: 404 on `/api/interviews/save-recording` but `/api/interviews/123/submit-answer` works  
**Fix**: Move `/save-recording` BEFORE `/:id` routes

### Issue 5: Token Invalid
**Symptom**: 401 Unauthorized  
**Fix**: Log in again to get a new token

### Issue 6: User Role Wrong
**Symptom**: 403 Forbidden  
**Fix**: Check user role is 'candidate' in database

### Issue 7: Frontend Proxy Issue
**Symptom**: 404 in browser but curl works  
**Fix**: Restart frontend dev server
```bash
cd client
npm start
```

---

## Quick Checklist

- [ ] Backend running on port 5000?
  - Test: `curl http://localhost:5000/health`
  
- [ ] Interviews router working?
  - Test: `curl -H "Authorization: Bearer {token}" http://localhost:5000/api/interviews/test`
  
- [ ] Save-recording route registered?
  - Check: `grep save-recording server/routes/interviews.js`
  
- [ ] Save-recording method exported?
  - Check: `grep exports.saveRecording server/controllers/interviewController.js`
  
- [ ] Route order correct?
  - Check: `/save-recording` BEFORE `/:id` routes
  
- [ ] Token valid?
  - Check: `localStorage.getItem('token')` in browser console
  
- [ ] User role is 'candidate'?
  - Check: Database user table
  
- [ ] Frontend proxy configured?
  - Check: `client/src/setupProxy.js` has `target: 'http://localhost:5000'`

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

**Backend** (already added):
```javascript
// In server/routes/interviews.js
router.use((req, res, next) => {
  logger.info(`[Interviews Router] ${req.method} ${req.path}`, {
    path: req.path,
    method: req.method,
    hasAuth: !!req.headers.authorization
  });
  next();
});
```

### View Logs
```bash
# Terminal 1: Watch server logs
cd server
tail -f server/logs/combined.log

# Terminal 2: Run test
curl -X POST http://localhost:5000/api/interviews/save-recording \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"https://example.com/video.webm","questionId":1,"recordingTime":30}'
```

---

## Testing Endpoints

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

### Test 2: Interviews Router
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:5000/api/interviews/test \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Save Recording
```bash
TOKEN="your_jwt_token_here"
curl -X POST http://localhost:5000/api/interviews/save-recording \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.webm",
    "questionId": 1,
    "recordingTime": 30
  }'
```

---

## Still Not Working?

### Check Server Logs
```bash
cd server
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
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)

# Clear cache
cd server && npm cache clean --force
cd ../client && npm cache clean --force

# Restart backend
cd server && npm start

# Restart frontend (new terminal)
cd client && npm start
```

### Check File Permissions
```bash
# Verify files exist and are readable
ls -la server/routes/interviews.js
ls -la server/controllers/interviewController.js
```

---

## Prevention

### Before Deployment
1. ✅ Test endpoint with curl
2. ✅ Check server logs for errors
3. ✅ Verify database connection
4. ✅ Test with real token
5. ✅ Test in browser DevTools Network tab

### Monitoring
- Monitor server logs for 404 errors
- Monitor network requests in DevTools
- Check backend health endpoint regularly
- Verify token validity

---

## Summary

**404 Error** = Endpoint not found

**Most Common Causes**:
1. Backend not running
2. Route not registered
3. Method not exported
4. Wrong route order
5. Frontend proxy issue

**Quick Fix**:
1. Start backend: `cd server && npm start`
2. Test: `curl http://localhost:5000/health`
3. Check route: `grep save-recording server/routes/interviews.js`
4. Restart frontend: `cd client && npm start`

---

**Last Updated**: April 20, 2026  
**Status**: Comprehensive troubleshooting guide
