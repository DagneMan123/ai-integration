# Help Center Database Setup - COMPLETED

## Summary
Added three missing database models to the Prisma schema to support help center functionality:
- `HelpCenterCategory` - Categories for organizing help articles
- `HelpCenterArticle` - Help center articles with views and helpful counts
- `SupportTicket` - Support tickets submitted by users

## Changes Made

### 1. Updated Prisma Schema (`server/prisma/schema.prisma`)

Added three new models at the end of the schema:

```prisma
model HelpCenterCategory {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  articles HelpCenterArticle[]

  @@map("help_center_categories")
}

model HelpCenterArticle {
  id         Int       @id @default(autoincrement())
  title      String
  category   String
  content    String
  views      Int       @default(0)
  helpful    Int       @default(0)
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@index([category])
  @@index([createdAt])
  @@map("help_center_articles")
}

model SupportTicket {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  subject   String
  message   String
  category  String
  status    String    @default("open") // open, in_progress, resolved, closed
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("support_tickets")
}
```

Also added the relation to the User model:
```prisma
supportTickets   SupportTicket[]
```

## Next Steps - REQUIRED

You must run these commands in your terminal to apply the database changes:

### Option 1: Using Prisma Migrate (Recommended)
```bash
cd server
npx prisma migrate dev --name add_help_center_tables
```

This will:
- Create a migration file
- Apply the schema changes to your database
- Regenerate the Prisma client

### Option 2: Using Prisma DB Push (If migrations are disabled)
```bash
cd server
npx prisma db push
```

## Verification

After running the migration, verify the tables were created:

```bash
cd server
npx prisma studio
```

This opens Prisma Studio where you can see:
- `help_center_categories` table
- `help_center_articles` table
- `support_tickets` table

## Seeding Help Center Data (Optional)

To populate the help center with sample data, you can add this to `server/prisma/seed.js`:

```javascript
// Add to seed.js
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
      content: 'Learn how to prepare for your first AI-powered interview...',
      views: 0,
      helpful: 0
    },
    {
      title: 'System Requirements',
      category: 'Technical',
      content: 'Check the technical requirements for running interviews...',
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

## Current Status

✅ Schema models added
✅ Relations configured
✅ Indexes created for performance
⏳ **PENDING**: Run migration commands (user action required)

## Help Center Endpoints

Once the database is set up, these endpoints will work:

- `GET /api/help-center/articles` - Get all articles (with optional category/search filters)
- `GET /api/help-center/articles/:id` - Get specific article
- `POST /api/help-center/articles/:id/helpful` - Mark article as helpful/unhelpful
- `GET /api/help-center/categories` - Get all categories with article counts
- `POST /api/help-center/support-ticket` - Submit a support ticket

## Client-Side Fallbacks

The client already has fallback data configured in `client/src/services/helpCenterService.ts`, so the app will continue to work even if the server is temporarily unavailable. Once the database is set up, the real data will be used instead.
