# Complete Setup Guide - Video Interview System

## Current Status
✅ Cloudinary upload working (100% progress)  
❌ Backend sync failing (404 error)  
⏳ Backend server not running

---

## What You Need to Do

### Prerequisites
- Node.js installed
- PostgreSQL running
- `.env` files configured

---

## Step 1: Start PostgreSQL

### Windows
```bash
# Check if running
Get-Service postgresql-x64-15

# If not running, start it
Start-Service -Name "postgresql-x64-15"
```

### Linux
```bash
# Check if running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
```

### macOS
```bash
# Check if running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql
```

---

## Step 2: Start Backend Server

### Terminal 1: Backend
```bash
cd server
npm start
```

**Expected output**:
```
🚀 Server running on port 5000
📊 Database status: ✅ Connected
🌐 API available at http://localhost:5000
💻 Frontend available at http://localhost:3000
```

**If you see errors**:
- Check PostgreSQL is running
- Check `.env` file has correct database credentials
- Check `server/logs/error.log` for details

---

## Step 3: Start Frontend Server

### Terminal 2: Frontend
```bash
cd client
npm start
```

**Expected output**:
```
Compiled successfully!
You can now view client in the browser.
Local: http://localhost:3000
```

---

## Step 4: Verify Everything is Running

### Terminal 3: Test Commands

**Test 1: Backend Health**
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

**Test 2: Interviews Router**
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:5000/api/interviews/test \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**:
```json
{
  "success": true,
  "message": "Interviews router is working",
  "path": "/api/interviews/test",
  "user": 123
}
```

---

## Step 5: Test Recording Upload

1. Open browser: `http://localhost:3000`
2. Log in as candidate
3. Go to Practice Interview
4. Record a response (10-15 seconds)
5. Stop recording
6. Wait for upload

**Expected**:
- Progress bar: 0% → 100%
- Toast: "Response saved!"
- Next question appears

**If 404 error**:
- Check backend is running: `curl http://localhost:5000/health`
- Check route exists: `grep save-recording server/routes/interviews.js`
- Check server logs: `tail -f server/logs/combined.log`

---

## Terminal Setup

You should have **3 terminals** open:

```
┌─────────────────────────────────────────────────────────┐
│ Terminal 1: Backend                                     │
│ $ cd server && npm start                                │
│ 🚀 Server running on port 5000                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Terminal 2: Frontend                                    │
│ $ cd client && npm start                                │
│ Compiled successfully!                                  │
│ Local: http://localhost:3000                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Terminal 3: Testing/Commands                            │
│ $ curl http://localhost:5000/health                     │
│ $ grep save-recording server/routes/interviews.js       │
│ $ tail -f server/logs/combined.log                      │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Backend Won't Start

**Error**: "Can't reach database server"
```bash
# Check PostgreSQL is running
Get-Service postgresql-x64-15

# Start PostgreSQL
Start-Service -Name "postgresql-x64-15"
```

**Error**: "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or use a different port
PORT=5001 npm start
```

**Error**: "Database connection failed"
```bash
# Check .env file
cat server/.env

# Verify credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=simuai
# DB_USER=postgres
# DB_PASSWORD=your_password
```

### Frontend Won't Start

**Error**: "Port 3000 already in use"
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm start
```

**Error**: "Module not found"
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules
npm cache clean --force
npm install
npm start
```

### 404 Error on Upload

**Check 1**: Backend running?
```bash
curl http://localhost:5000/health
```

**Check 2**: Route registered?
```bash
grep save-recording server/routes/interviews.js
```

**Check 3**: Method exported?
```bash
grep exports.saveRecording server/controllers/interviewController.js
```

**Check 4**: Server logs?
```bash
tail -f server/logs/combined.log
```

---

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simuai
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=dm5rf4yzc
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=dm5rf4yzc
REACT_APP_CLOUDINARY_UPLOAD_PRESET_VIDEO=simuai_video_preset
```

---

## Database Setup

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE simuai;

# Exit
\q
```

### Run Migrations
```bash
cd server
npx prisma migrate dev
```

### Seed Database (Optional)
```bash
cd server
npm run seed
```

---

## Verification Checklist

- [ ] PostgreSQL running?
  - Test: `Get-Service postgresql-x64-15`

- [ ] Backend running on port 5000?
  - Test: `curl http://localhost:5000/health`

- [ ] Frontend running on port 3000?
  - Test: Open `http://localhost:3000` in browser

- [ ] Database connected?
  - Check: Backend logs show "✅ Connected"

- [ ] Routes registered?
  - Test: `curl -H "Authorization: Bearer {token}" http://localhost:5000/api/interviews/test`

- [ ] Can log in?
  - Test: Log in with valid credentials

- [ ] Can record?
  - Test: Record a response in Practice Interview

- [ ] Can upload?
  - Test: Stop recording and wait for upload

---

## Success Criteria

✅ Backend running on port 5000  
✅ Frontend running on port 3000  
✅ Database connected  
✅ Can log in  
✅ Can record video  
✅ Cloudinary upload completes (100%)  
✅ Backend sync completes (201 response)  
✅ Next question appears  
✅ No 404 errors  

---

## Quick Start (TL;DR)

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend (new terminal)
cd client
npm start

# Terminal 3: Test (new terminal)
curl http://localhost:5000/health

# Open browser
http://localhost:3000

# Log in and test recording
```

---

## Support

### For Backend Issues
- Check: `server/logs/error.log`
- Check: `server/logs/combined.log`
- Test: `curl http://localhost:5000/health`

### For Frontend Issues
- Check: Browser console (F12)
- Check: DevTools Network tab (F12 → Network)
- Test: `http://localhost:3000`

### For Database Issues
- Check: PostgreSQL is running
- Check: `.env` credentials are correct
- Test: `psql -U postgres -d simuai`

---

## Next Steps

1. ✅ Start PostgreSQL
2. ✅ Start backend: `cd server && npm start`
3. ✅ Start frontend: `cd client && npm start`
4. ✅ Test recording upload
5. ✅ Verify success

---

**Status**: Ready to implement  
**Last Updated**: April 20, 2026  
**Next Action**: Start backend server
