# Backend Not Running - Quick Fix

## Problem
```
POST http://localhost:3000/api/interviews/save-recording 404 (Not Found)
```

The frontend is trying to reach the backend but getting 404. This means **the backend server is not running**.

---

## Solution: Start the Backend

### Step 1: Open a New Terminal
Open a new terminal window (don't close the frontend terminal).

### Step 2: Navigate to Server Directory
```bash
cd server
```

### Step 3: Start the Backend
```bash
npm start
```

### Expected Output
```
🚀 Server running on port 5000
📊 Database status: ✅ Connected
🌐 API available at http://localhost:5000
💻 Frontend available at http://localhost:3000
```

---

## Verify Backend is Running

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected response**:
```json
{
  "status": "OK",
  "database": "connected",
  "uptime": 123.45
}
```

### Test 2: Test Interviews Router
```bash
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

---

## Now Try Recording Again

1. Go back to browser
2. Try recording and uploading again
3. Should work now!

---

## If Still Getting 404

### Check 1: Is Backend Running?
```bash
curl http://localhost:5000/health
```

If you get "Connection refused", backend is not running. Go back to Step 3.

### Check 2: Is Route Registered?
```bash
grep -n "save-recording" server/routes/interviews.js
```

Should show:
```
35:router.post('/save-recording', authorizeRoles('candidate'), interviewController.saveRecording);
```

### Check 3: Check Server Logs
```bash
tail -f server/logs/combined.log
```

Look for errors or the request being logged.

---

## Terminal Setup

You should have **3 terminals** running:

1. **Terminal 1**: Backend
   ```bash
   cd server
   npm start
   ```

2. **Terminal 2**: Frontend
   ```bash
   cd client
   npm start
   ```

3. **Terminal 3**: For running commands/tests
   ```bash
   # Use for curl commands, grep, etc.
   ```

---

## Summary

**Problem**: Backend not running  
**Solution**: `cd server && npm start`  
**Verify**: `curl http://localhost:5000/health`  
**Result**: Recording upload should work

---

**Status**: ✅ Ready to implement  
**Last Updated**: April 20, 2026
