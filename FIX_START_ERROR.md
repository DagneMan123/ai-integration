# 🔧 Fix: "Cannot find module" Error

## ❌ The Error You Got

```
Error: Cannot find module 'C:\Users\Hena\Desktop\ai integration\client\start'
```

## 🎯 The Problem

You ran: `node start` ❌  
This is **WRONG** because:
- `node` command expects a JavaScript file (like `node app.js`)
- `start` is not a JavaScript file, it's an npm script

## ✅ The Solution

Use `npm start` instead of `node start`

---

## 📋 Step-by-Step Fix

### Option 1: Use the Automated Script (EASIEST)

Just double-click this file:
```
start-app.bat
```

This will:
- ✅ Install dependencies if needed
- ✅ Start backend automatically
- ✅ Start frontend automatically
- ✅ Open both in separate windows

### Option 2: Manual Start (RECOMMENDED FOR LEARNING)

#### Step 1: Open First Terminal
```bash
cd server
npm start
```

**Wait for this message:**
```
🚀 Server running on port 5000
✅ Database connection established
```

#### Step 2: Open Second Terminal
```bash
cd client
npm start
```

**Wait for this message:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 🔍 Understanding npm vs node

### `node` command
- Runs JavaScript files directly
- Example: `node app.js`, `node test.js`
- Used for: Running specific JS files

### `npm` command
- Runs scripts defined in package.json
- Example: `npm start`, `npm test`, `npm run build`
- Used for: Running project commands

### What happens when you run `npm start`?

1. npm looks in `package.json`
2. Finds the "start" script
3. Runs the command defined there

**In client/package.json:**
```json
{
  "scripts": {
    "start": "react-scripts start"
  }
}
```

**In server/package.json:**
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

So `npm start` in server folder actually runs `node index.js`!

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG Commands
```bash
node start          # ❌ Wrong
node npm start      # ❌ Wrong
npm node start      # ❌ Wrong
node client         # ❌ Wrong
node server         # ❌ Wrong
```

### ✅ CORRECT Commands
```bash
npm start           # ✅ Correct
npm run dev         # ✅ Correct (if dev script exists)
npm run build       # ✅ Correct
npm test            # ✅ Correct
```

---

## 📦 First Time Setup

If this is your first time running the app:

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 2. Setup Database

```bash
cd server
npx prisma db push
npx prisma generate
```

### 3. Configure Environment

Make sure these files exist:

**server/.env**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/simuai
JWT_SECRET=your_secret_here
```

**client/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start Application

```bash
# Terminal 1
cd server
npm start

# Terminal 2
cd client
npm start
```

---

## 🎯 Quick Reference

| What You Want | Command | Where |
|---------------|---------|-------|
| Start backend | `npm start` | server folder |
| Start frontend | `npm start` | client folder |
| Install packages | `npm install` | server or client |
| Update database | `npx prisma db push` | server folder |
| Build frontend | `npm run build` | client folder |
| Run tests | `npm test` | server or client |

---

## 🐛 Still Having Issues?

### Error: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Error: "Cannot find module 'react-scripts'"
**Solution**: 
```bash
cd client
npm install
```

### Error: "Port 3000 already in use"
**Solution**: 
```bash
# Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port
# Edit client/.env
PORT=3001
```

### Error: "Database connection failed"
**Solution**: 
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in server/.env
3. Run: `cd server && npx prisma db push`

---

## ✅ Verification Checklist

After starting, verify:

- [ ] Backend terminal shows: "Server running on port 5000"
- [ ] Frontend terminal shows: "Compiled successfully"
- [ ] Browser opens automatically to http://localhost:3000
- [ ] No red errors in either terminal
- [ ] Can access http://localhost:5000/api/health

---

## 🎉 Success!

If you see both servers running without errors, you're all set!

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📞 Quick Help

**Problem**: Command not working  
**Solution**: Make sure you're in the correct folder (server or client)

**Problem**: Dependencies missing  
**Solution**: Run `npm install` in that folder

**Problem**: Port already in use  
**Solution**: Close other instances or change port

**Problem**: Database error  
**Solution**: Check PostgreSQL is running and DATABASE_URL is correct

---

**Remember**: 
- Use `npm start` (NOT `node start`)
- Run in correct folder (server or client)
- Keep both terminals open while using the app

---

**Need more help?** Check: START_APPLICATION.md
