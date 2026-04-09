# Help Center Setup - Quick Start

## What Was Done

✅ Added 3 missing database models to `server/prisma/schema.prisma`:
- `HelpCenterCategory` - Article categories
- `HelpCenterArticle` - Help articles with views/helpful counts
- `SupportTicket` - User support tickets

✅ Added `supportTickets` relation to User model

## What You Need to Do

### Step 1: Run the Migration
Open your terminal and run:

```bash
cd server
npx prisma migrate dev --name add_help_center_tables
```

This will:
- Create the migration file
- Apply changes to your PostgreSQL database
- Regenerate Prisma client

### Step 2: Verify (Optional)
Check that tables were created:

```bash
cd server
npx prisma studio
```

Look for:
- `help_center_categories`
- `help_center_articles`
- `support_tickets`

### Step 3: Seed Sample Data (Optional)
To add sample help center articles, edit `server/prisma/seed.js` and add:

```javascript
// Add this to the seed function
const categories = await prisma.helpCenterCategory.createMany({
  data: [
    { name: 'Getting Started' },
    { name: 'Technical' },
    { name: 'Troubleshooting' },
    { name: 'Account' },
    { name: 'Payments' }
  ],
  skipDuplicates: true
});

const articles = await prisma.helpCenterArticle.createMany({
  data: [
    {
      title: 'Getting Started with Interviews',
      category: 'Getting Started',
      content: 'Learn how to prepare for your first AI-powered interview.',
      views: 0,
      helpful: 0
    },
    {
      title: 'System Requirements',
      category: 'Technical',
      content: 'Check the technical requirements for running interviews.',
      views: 0,
      helpful: 0
    }
  ],
  skipDuplicates: true
});
```

Then run:
```bash
cd server
npx prisma db seed
```

## What Happens After

Once the migration is complete:

1. **Help Center Endpoints Work**
   - GET `/api/help-center/articles` - Fetch articles
   - GET `/api/help-center/categories` - Fetch categories
   - POST `/api/help-center/support-ticket` - Submit tickets

2. **Client App Works**
   - Help Center sidebar loads real data from database
   - Support ticket form submits to database
   - Fallback data is used if server is temporarily down

3. **No More 500 Errors**
   - The "GET http://localhost:5000/api/help-center/articles 500" errors will be gone
   - Real data will display instead of fallback data

## Troubleshooting

**Error: "relation 'help_center_articles' does not exist"**
- Run: `npx prisma migrate dev --name add_help_center_tables`

**Error: "Prisma Client is out of sync"**
- Run: `npx prisma generate`

**Database connection issues**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `server/.env`

## Files Modified

- `server/prisma/schema.prisma` - Added 3 new models + User relation

## Files Not Modified (Already Working)

- `server/routes/helpCenter.js` - Routes are ready
- `client/src/services/helpCenterService.ts` - Service is ready with fallbacks
- `client/src/hooks/useHelpCenter.ts` - Hook is ready
- `server/index.js` - Route is already registered

Everything is ready to go once you run the migration!
