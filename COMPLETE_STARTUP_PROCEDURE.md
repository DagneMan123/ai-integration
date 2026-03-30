# Complete Startup Procedure - Step by Step

## Overview
This guide walks you through starting the entire SimuAI application from scratch.

---

## Step 1: Start PostgreSQL Database (CRITICAL)

### Windows Services Method (Recommended)

**1. Open Services Manager**
```
Press: Windows Key + R
Type: services.msc
Press: Enter
```

**2. Find PostgreSQL Service**
```
Look for: "postgresql-x64-15" (or similar version)
```

**3. Start the Service**
```
Right-click on PostgreSQL
Select: Start
Wait for status to show: "Running"
```

**4. Verify It's Running**
```
Status column should show: "Running"
Startup Type should show: "Automatic"
```

### PowerShell Method (Alternative)

```powershell
# Run as Administrator
Start-Service -Name "postgresql-x64-15"

# Verify
Get-Service -Name "postgresql-x64-15"
```

### Verify Database Connection

```bash
# Open Command Prompt
psql -U postgres -d simuai -c "SELECT 1"
```

Expected: `1` (if database exists)

---

## Step 2: Start Backend Server

### Terminal 1: Backend

```bash
# Navigate to server directory
cd server

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node index.js`
Database connection established successfully via Prisma.
Server running on port 5000
```

**If you see errors:**
- Check PostgreSQL is running (Step 1)
- Check DATABASE_URL in `.env`
- Check port 5000 is not in use

---

## Step 3: Start Frontend Server

### Terminal 2: Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
Compiled successfully!
You can now view simuai-client in the browser.
Local: http://localhost:3000
```

**If you see errors:**
- Check backend is running (Step 2)
- Check REACT_APP_API_URL in `.env`
- Check port 3000 is not in use

---

## Step 4: Access Application

### Open Browser

```
URL: http://localhost:3000
```

**Expected:**
- SimuAI homepage loads
- No console errors
- Can navigate to login page

---

## Step 5: Test Login

### Create Test User (if needed)

```bash
# In server directory
node create-test-user.js
```

### Login

```
Email: test@example.com
Password: Test@123456
```

**Expected:**
- Login successful
- Redirected to dashboard
- Can see user profile

---

## Step 6: Test Payment System

### Purchase Credits

```
1. Go to Payments page
2. Select credit bundle
3. Click "Buy Now"
4. Complete payment with Chapa
5. Credits should be added to wallet
```

### Start Interview

```
1. Go to Jobs page
2. Apply for a job
3. Click "Start Interview"
4. Interview should begin
5. 1 credit should be deducted
```

---

## Complete Startup Checklist

### Before Starting
- [ ] PostgreSQL installed
- [ ] Node.js installed
- [ ] Git repository cloned
- [ ] Dependencies installed (`npm install` in both directories)
- [ ] `.env` files configured

### Starting Services
- [ ] PostgreSQL service running
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)

### Verification
- [ ] Backend logs show "Database connection established"
- [ ] Frontend logs show "Compiled successfully"
- [ ] Browser can access http://localhost:3000
- [ ] No console errors in browser
- [ ] Can login with test credentials

### Testing Features
- [ ] Can view jobs
- [ ] Can apply for jobs
- [ ] Can purchase credits
- [ ] Can start interviews
- [ ] Can view payment history

---

## Troubleshooting

### PostgreSQL Not Starting

**Check if service exists:**
```powershell
Get-Service -Name "postgresql-x64-15"
```

**If not found, try different version:**
```powershell
Get-Service | grep -i postgres
```

**Start the service:**
```powershell
Start-Service -Name "postgresql-x64-15"
```

### Backend Won't Connect to Database

**Check DATABASE_URL in `.env`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/simuai"
```

**Check if database exists:**
```bash
psql -U postgres -l
```

**Create database if needed:**
```bash
createdb -U postgres simuai
```

### Frontend Can't Connect to Backend

**Check REACT_APP_API_URL in `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Check backend is running:**
```bash
curl http://localhost:5000/api/health
```

### Port Already in Use

**Find process using port:**
```powershell
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :3000  # Frontend
netstat -ano | findstr :5432  # PostgreSQL
```

**Kill process:**
```powershell
taskkill /PID <PID> /F
```

### Application Crashes

**Check logs:**
```bash
# Backend logs
tail -f server/logs/error.log

# Frontend console
Open DevTools (F12) → Console tab
```

**Common issues:**
- Database connection lost
- API endpoint not found
- Missing environment variables
- Port conflicts

---

## Environment Variables

### Backend (server/.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/simuai"
JWT_SECRET="your-secret-key"
CHAPA_API_KEY="your-chapa-api-key"
CHAPA_SECRET_KEY="your-chapa-secret-key"
OPENAI_API_KEY="your-openai-api-key"
```

### Frontend (client/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Quick Commands Reference

### PostgreSQL
```powershell
# Start
Start-Service -Name "postgresql-x64-15"

# Stop
Stop-Service -Name "postgresql-x64-15"

# Status
Get-Service -Name "postgresql-x64-15"
```

### Backend
```bash
cd server
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run tests
```

### Frontend
```bash
cd client
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run tests
```

### Database
```bash
# Connect to database
psql -U postgres -d simuai

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

---

## Performance Tips

1. **Use SSD** - Faster database operations
2. **Close unused apps** - Free up system resources
3. **Monitor logs** - Check for performance issues
4. **Use Chrome DevTools** - Profile frontend performance
5. **Check database queries** - Use Prisma Studio

---

## Security Reminders

- ✅ Never commit `.env` files
- ✅ Use strong passwords
- ✅ Keep dependencies updated
- ✅ Use HTTPS in production
- ✅ Validate all user inputs
- ✅ Store secrets in environment variables

---

## Next Steps

After successful startup:

1. **Explore the application**
   - Test all features
   - Check user flows
   - Verify payment system

2. **Run tests**
   - Backend tests
   - Frontend tests
   - Integration tests

3. **Deploy to production**
   - Build frontend
   - Deploy backend
   - Configure database
   - Set up monitoring

---

## Support

### If You Get Stuck

1. Check this guide again
2. Check error logs
3. Check browser console (F12)
4. Check backend logs
5. Verify all services are running

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Can't reach database" | Start PostgreSQL service |
| "Port already in use" | Kill process using port |
| "API not found" | Check backend is running |
| "CORS error" | Check REACT_APP_API_URL |
| "Database not found" | Create database with createdb |

---

## Status Indicators

### ✅ Everything Working
```
Backend: Database connection established
Frontend: Compiled successfully
Browser: Application loads without errors
```

### ⚠️ Something Wrong
```
Backend: Error connecting to database
Frontend: Compilation errors
Browser: Console errors or blank page
```

---

**Time to Complete**: 5-10 minutes
**Difficulty**: Easy
**Prerequisites**: PostgreSQL, Node.js, Git

Ready to start? Begin with Step 1!
