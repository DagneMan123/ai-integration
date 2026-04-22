# ⚡ ACTION CARD - Video Upload Fix

## Current Issue
```
The table `public.interview_responses` does not exist in the current database.
```

## What to Do (1 minute)

### 1️⃣ Stop Backend
```
Ctrl+C
```

### 2️⃣ Run Migration
```bash
cd server
npm run db:push
```

### 3️⃣ Restart Backend
```bash
npm run dev
```

### 4️⃣ Test
- Go to practice interview
- Record video
- Click "Submit Response"
- ✅ Should work!

## What This Does
Creates the missing database tables:
- `interview_responses` - stores videos
- `interview_analyses` - stores AI analysis
- `interview_questions` - stores questions

## Expected Result
✅ Video uploads work  
✅ No more 500 errors  
✅ Interview flow complete  

---

**Time to fix: 1 minute**  
**Difficulty: Easy**  
**Status: Ready to go!**
