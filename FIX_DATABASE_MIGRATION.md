# Fix: Database Table Missing - Run Prisma Migration

## Error
```
The table `public.interview_responses` does not exist in the current database.
```

## Root Cause
The `InterviewResponse` model exists in the schema, but the database table hasn't been created yet. We need to run Prisma migrations to create the table.

## Solution: Run Prisma Migration

### Step 1: Stop Backend Server
Press Ctrl+C to stop the server

### Step 2: Run Migration
```bash
cd server
npm run db:push
```

This command:
- Reads the schema from `server/prisma/schema.prisma`
- Compares it with the current database
- Creates any missing tables
- Creates the `interview_responses` table with all required fields

### Step 3: Restart Backend
```bash
npm run dev
```

### Step 4: Test
1. Go to practice interview
2. Record a video
3. Click "Submit Response"
4. Video should upload successfully!

## What Gets Created

The migration will create the `interview_responses` table with:
- `id` (primary key)
- `session_id` (foreign key to interviews)
- `question_id` (question identifier)
- `user_id` (foreign key to users)
- `video_path` (local file path)
- `video_url` (Cloudinary URL)
- `video_size` (file size in bytes)
- `recording_time` (duration in seconds)
- `status` (processing, completed, error)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Alternative: Full Database Reset

If you want to reset everything and start fresh:

```bash
cd server
npm run db:reset
```

This will:
1. Drop all tables
2. Create all tables from schema
3. Run seed data (if configured)

**Warning**: This deletes all data in the database!

## Verification

After running the migration, you should see:
- ✅ No "table does not exist" error
- ✅ Video uploads to Cloudinary
- ✅ Backend saves recording to database
- ✅ Response returns with responseId

## If Still Having Issues

1. Verify database connection:
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

2. Check schema validity:
   ```bash
   npx prisma validate
   ```

3. View database with Prisma Studio:
   ```bash
   npx prisma studio
   ```

4. Check migrations:
   ```bash
   npx prisma migrate status
   ```

## Related Tables

The migration will also create/update these related tables:
- `interview_analyses` - for AI analysis of responses
- `interview_questions` - for storing questions
- And other models defined in the schema

## Next Steps

1. Run `npm run db:push`
2. Restart backend with `npm run dev`
3. Test video upload
4. If successful, you're done!
