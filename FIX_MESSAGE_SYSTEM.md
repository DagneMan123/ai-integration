# Fix Message System - Database Migration Required

## Problem
The message system is failing because the Prisma client hasn't been regenerated after adding the Message model to the schema.

## Solution

### Step 1: Regenerate Prisma Client
Run this command in the server directory:
```bash
npx prisma generate
```

### Step 2: Run Database Migration
After regenerating the client, run the migration:
```bash
npx prisma migrate dev --name add_messages
```

This will:
- Create the `messages` table in your PostgreSQL database
- Update the Prisma client with the Message model

### Step 3: Restart Server
Stop your server and restart it:
```bash
npm run dev
```

## What Was Done

1. **Added Message Model** to `server/prisma/schema.prisma`:
   - Stores messages between users
   - Tracks sender and recipient relationships
   - Includes read and archived status

2. **Created Message Controller** at `server/controllers/messageController.js`:
   - `getMessages()` - Fetch all messages for a user
   - `getMessage()` - Get a specific message
   - `sendMessage()` - Send a new message
   - `markAsRead()` - Mark message as read
   - `toggleArchive()` - Archive/unarchive messages
   - `deleteMessage()` - Delete a message

3. **Created Message Routes** at `server/routes/messages.js`:
   - All routes require authentication
   - RESTful endpoints for CRUD operations

4. **Updated Frontend** at `client/src/pages/employer/Inbox.tsx`:
   - Integrated with messageAPI
   - Displays messages from backend
   - Supports search, archive, and delete

## Testing

After migration, test the message system:

1. Navigate to `/employer/messages` in the app
2. Messages should load from the database
3. You can send, read, archive, and delete messages

## Troubleshooting

If you still see "Cannot read properties of undefined (reading 'findMany')" error:

1. Verify migration ran successfully:
   ```bash
   npx prisma migrate status
   ```

2. Check if messages table exists:
   ```bash
   npx prisma db push
   ```

3. Regenerate client again:
   ```bash
   npx prisma generate
   ```

4. Restart the server
