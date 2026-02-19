# 🚀 SimuAI Platform - START HERE

## ⚡ Quick Start (3 Options)

### Option 1: Automated (EASIEST) ⭐
Double-click this file:
```
start-app.bat
```
Done! Everything starts automatically.

### Option 2: Manual (Two Terminals)
```bash
# Terminal 1
cd server
npm start

# Terminal 2  
cd client
npm start
```

### Option 3: First Time Setup
```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Setup database
cd ../server
npx prisma db push
npx prisma generate

# 3. Start (use Option 1 or 2)
```

---

## ❌ Common Mistake

**YOU TYPED**: `node start` ❌  
**YOU SHOULD TYPE**: `npm start` ✅

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **CORRECT_START_COMMANDS.txt** | Visual guide (READ THIS FIRST) |
| **START_APPLICATION.md** | Detailed start instructions |
| **FIX_START_ERROR.md** | Troubleshooting guide |
| **QUICK_REFERENCE.md** | Quick commands reference |
| **FINAL_IMPLEMENTATION_STATUS.md** | Complete feature overview |
| **CODE_QUALITY_REPORT.md** | Code quality analysis |

---

## ✅ What You Need

- ✅ Node.js installed (v16+)
- ✅ PostgreSQL running
- ✅ Dependencies installed (`npm install`)

---

## 🎯 Access Points

After starting:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 🆘 Quick Help

**Problem**: Command not found  
**Solution**: Install Node.js from https://nodejs.org/

**Problem**: Port in use  
**Solution**: Close other instances or change port

**Problem**: Database error  
**Solution**: Check PostgreSQL is running

---

## 📞 More Help

1. Read: **CORRECT_START_COMMANDS.txt**
2. Read: **START_APPLICATION.md**
3. Check logs: `server/logs/combined.log`

---

**Remember**: Use `npm start`, NOT `node start` ✅
