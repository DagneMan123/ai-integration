# Setup Message System - Complete Guide

## Quick Fix (Windows)

Double-click: `server/setup-messages.bat`

This will automatically:
1. Regenerate Prisma Client
2. Run database migration
3. Create messages table

## Manual Setup (All Platforms)

Open terminal in `server` directory and run:

```bash
npx prisma generate
npx prisma migrate dev --name add_messages
```

## After Setup

1. Restart your server: `npm run dev`
2. Navigate to `/employer/messages`
3. Messages should now work!

## What Was Fixed

- Added conditional message route loading
- Server won't crash if migration hasn't run
- Helpful error message guides users to run migration
- Created automated setup script for Windows

## Troubleshooting

If still seeing errors:
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Run: `npx prisma db push`
4. Restart server
