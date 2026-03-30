# 🚀 QUICK START GUIDE

**Status**: ✅ System Ready to Run  
**Last Updated**: March 30, 2026

---

## 📋 PREREQUISITES

Before starting, ensure you have:
- ✅ Node.js installed (v14+)
- ✅ PostgreSQL installed and running
- ✅ Git installed
- ✅ Environment variables configured

---

## 🔧 STEP 1: START POSTGRESQL

### Windows (PowerShell)
```powershell
# Start PostgreSQL service
Start-Service -Name "postgresql-x64-15"

# Verify it's running
Get-Service -Name "postgresql-x64-15"
```

### Windows (Command Prompt)
```cmd
# Start PostgreSQL service
net start postgresql-x64-15

# Verify it's running
sc query postgresql-x64-15
```

### macOS
```bash
# Start PostgreSQL
brew services start postgresql

# Verify it's running
brew services list
```

### Linux
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Verify it's running
sudo systemctl status postgresql
```

---

## 🔧 STEP 2: START BACKEND SERVER

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already installed)
npm install

# Start the server
npm run dev
```

**Expected Output**:
```
warn: Database connection failed (attempt 1/5). Retrying in 1000ms...
Database connection established successfully via Prisma.
Server running on port 5000
```

---

## 🔧 STEP 3: START FRONTEND SERVER

In a new terminal:

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already installed)
npm install

# Start the frontend
npm start
```

**Expected Output**:
```
Compiled successfully!
You can now view simuai in the browser.
Local: http://localhost:3000
```

---

## 🧪 STEP 4: TEST THE SYSTEM

### Login as Candidate
1. Open browser: http://localhost:3000
2. Click "Login"
3. Enter credentials:
   - Email: `candidate@example.com`
   - Password: `candidate123`
4. Click "Login"

### Test Payment Flow
1. Click "Explore Jobs"
2. Select a job
3. Click "Apply"
4. Go to "Interviews"
5. Click "Start Interview"
6. Payment modal appears
7. If you have 0 credits, click "Pay & Start Interview"
8. You'll be redirected to Chapa checkout
9. Enter test card details:
   - Card Number: `4200000000000000`
   - Expiry: `12/25`
   - CVV: `123`
10. Complete payment
11. You'll be redirected back to interview
12. Interview starts automatically

### Test Interview
1. Answer the interview questions
2. Submit your responses
3. View your interview report
4. Check your score and feedback

---

## 📊 VERIFY SYSTEM STATUS

### Check Backend Connection
```bash
# In server directory
curl http://localhost:5000/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2026-03-30T10:00:00.000Z"
}
```

### Check Database Connection
```bash
# In server directory
npm run test:db
```

### Check Payment System
```bash
# In server directory
npm run test:payment
```

---

## 🐛 TROUBLESHOOTING

### PostgreSQL Not Running
```
Error: Can't reach database server at `localhost:5432`
```

**Solution**:
```powershell
# Windows
Start-Service -Name "postgresql-x64-15"

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Frontend Build Error
```
Error: Module not found
```

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database Connection Timeout
```
Error: Database connection failed (attempt 5/5)
```

**Solution**:
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists
4. Check firewall settings

---

## 📝 ENVIRONMENT VARIABLES

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/simuai
JWT_SECRET=your_jwt_secret_key
CHAPA_API_KEY=your_chapa_api_key
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_WEBHOOK_URL=http://localhost:5000/api/webhook/chapa
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎯 COMMON TASKS

### Reset Database
```bash
# In server directory
npx prisma db push --force-reset
npx prisma db seed
```

### View Database
```bash
# In server directory
npx prisma studio
```

### Check Logs
```bash
# Backend logs
tail -f server/logs/combined.log

# Error logs
tail -f server/logs/error.log
```

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

---

## 📞 SUPPORT

### Common Issues

**Issue**: "Payment Required" error when starting interview
- **Solution**: Ensure you have at least 1 credit in your wallet

**Issue**: Interview report shows "undefined"
- **Solution**: Wait for AI to finish evaluation (takes 30-60 seconds)

**Issue**: Rate limiting (429 error)
- **Solution**: Wait 15 minutes or restart the server

**Issue**: Database disconnection
- **Solution**: Server will auto-reconnect. Check PostgreSQL is running.

---

## 🚀 NEXT STEPS

1. ✅ Start PostgreSQL
2. ✅ Start Backend Server
3. ✅ Start Frontend Server
4. ✅ Login as Candidate
5. ✅ Test Payment Flow
6. ✅ Complete Interview
7. ✅ View Report

---

## 📚 DOCUMENTATION

- **System Status**: See `SYSTEM_STATUS_COMPLETE.md`
- **Verification Report**: See `FINAL_VERIFICATION_REPORT.md`
- **API Documentation**: See `server/routes/` directory
- **Database Schema**: See `server/prisma/schema.prisma`

---

**Ready to start?** Follow the steps above and you'll be up and running in minutes!

**Questions?** Check the troubleshooting section or review the documentation files.

**Status**: ✅ READY TO RUN
