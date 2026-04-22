# Complete Fix Guide - Video Upload Error

## Current Status
✅ Prisma client regenerated successfully  
❌ Database tables not created yet

## What Needs to Be Done

The database is missing the `interview_responses` table. We need to run the migration to create it.

## Quick Fix (1 minute)

### Step 1: Stop Backend Server
Press Ctrl+C in the terminal

### Step 2: Run Migration
```bash
cd server
npm run db:push
```

Expected output:
```
✔ Database synced, schema is in sync
```

### Step 3: Restart Backend
```bash
npm run dev
```

### Step 4: Test
1. Go to http://localhost:3000
2. Practice Interview → Record Video
3. Click "Submit Response"
4. Video should upload successfully!

## What This Does

The `npm run db:push` command:
1. Reads the Prisma schema
2. Compares it with the current database
3. Creates missing tables:
   - `interview_responses` - stores video recordings
   - `interview_analyses` - stores AI analysis results
   - `interview_questions` - stores interview questions
4. Creates indexes for performance

## Expected Result

After running the migration:
- ✅ No "table does not exist" error
- ✅ Video uploads to Cloudinary
- ✅ Backend saves recording to database
- ✅ Interview flow works end-to-end
- ✅ No more 500 errors

## Tables Being Created

### interview_responses
Stores video recordings from candidates:
- `id` - unique identifier
- `session_id` - which interview session
- `question_id` - which question
- `user_id` - which candidate
- `video_url` - Cloudinary URL
- `video_path` - local file path
- `recording_time` - duration in seconds
- `status` - processing/completed/error

### interview_analyses
Stores AI analysis of responses:
- `response_id` - links to interview_responses
- `transcript` - speech-to-text
- `scores` - AI scoring breakdown
- `strengths` - what went well
- `improvements` - areas to improve
- `feedback` - detailed feedback

### interview_questions
Stores interview questions:
- `session_id` - which interview
- `text` - question text
- `type` - technical/behavioral/etc
- `difficulty` - beginner/intermediate/advanced

## If You Need More Details

- `FIX_DATABASE_MIGRATION.md` - Detailed migration guide
- `TASK_16_COMPLETE_ANALYSIS.md` - Technical analysis
- `FIX_PRISMA_CLIENT_UNDEFINED.md` - Prisma client explanation

## Troubleshooting

### If migration fails:

**Option 1: Use db:push (recommended)**
```bash
npm run db:push
```

**Option 2: Use db:migrate**
```bash
npm run db:migrate
```

**Option 3: Reset database (deletes all data)**
```bash
npm run db:reset
```

### If still having issues:

1. Check database connection:
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

2. View database with Prisma Studio:
   ```bash
   npx prisma studio
   ```

3. Check migration status:
   ```bash
   npx prisma migrate status
   ```

## Summary

1. Run `npm run db:push` in server directory
2. Restart backend with `npm run dev`
3. Test video upload
4. Done!

---

**That's it! Just run the command and you're done.**
