# 🚀 How to Start the SimuAI Application

## ❌ Common Mistake

**WRONG**: `node start` ❌  
**CORRECT**: `npm start` ✅

---

## ✅ Correct Way to Start

### Step 1: Start Backend

```bash
# Open Terminal 1
cd server
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ Database connection established successfully via Prisma.
```

### Step 2: Start Frontend

```bash
# Open Terminal 2 (new terminal window)
cd client
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view simuai-client in the browser.
Local: http://localhost:3000
```

---

## 🔧 If You Get Errors

### Error: "Cannot find module"

**Solution**: Install dependencies first

```bash
# In client folder
cd client
npm install

# In server folder
cd server
npm install
```

### Error: "Port already in use"

**Solution**: Kill the process using the port

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or just change the port in client/.env
PORT=3001
```

### Error: "Database connection failed"

**Solution**: Make sure PostgreSQL is running

```bash
# Check if PostgreSQL is running
# Start PostgreSQL service if needed

# Then update database
cd server
npx prisma db push
npx prisma generate
```

---

## 📋 Complete Setup (First Time Only)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Setup Database

```bash
cd server
npx prisma db push
npx prisma generate
npx prisma db seed
```

### 3. Configure Environment

**server/.env**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/simuai
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_key_here
```

**client/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start Application

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

---

## 🎯 Quick Commands Reference

### Backend Commands
```bash
cd server

# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Update database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# View database
npx prisma studio
```

### Frontend Commands
```bash
cd client

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install package-name
```

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"

**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Permission denied"

**Solution**: Run as administrator or use:
```bash
npm install --legacy-peer-deps
```

### Issue: "Module not found"

**Solution**: Delete node_modules and reinstall
```bash
# In client or server folder
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: "Port 5000 already in use"

**Solution**: Change port in server/index.js
```javascript
const PORT = process.env.PORT || 5001;
```

---

## ✅ Verification

### Check Backend is Running
Open browser: http://localhost:5000/api/health

### Check Frontend is Running
Open browser: http://localhost:3000

### Check Database Connection
```bash
cd server
npx prisma studio
```

---

## 🎉 Success!

If you see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ No errors in console

You're ready to use the application!

---

## 📞 Need Help?

1. Check logs: `server/logs/combined.log`
2. Check browser console (F12)
3. Review error messages carefully
4. Make sure PostgreSQL is running
5. Verify all dependencies installed

---

**Remember**: Always use `npm start`, NOT `node start`!
