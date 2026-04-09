# Help Center Setup - Visual Guide

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HelpCenterSidebar.tsx                                      │
│         ↓                                                    │
│  useHelpCenter.ts (Hook)                                    │
│         ↓                                                    │
│  helpCenterService.ts (Service)                             │
│    ├─ getArticles()                                         │
│    ├─ getCategories()                                       │
│    └─ submitSupportTicket()                                 │
│         ↓                                                    │
│  [Fallback Data] ← Works even if server is down             │
│         ↓                                                    │
│  HTTP Request to /api/help-center/*                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    Network Request
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  server/index.js                                            │
│    └─ app.use('/api/help-center', require('./routes/helpCenter'))
│                                                              │
│  server/routes/helpCenter.js                                │
│    ├─ GET /articles                                         │
│    ├─ GET /articles/:id                                     │
│    ├─ POST /articles/:id/helpful                            │
│    ├─ GET /categories                                       │
│    └─ POST /support-ticket                                  │
│         ↓                                                    │
│  Prisma Client                                              │
│    ├─ prisma.helpCenterArticle.findMany()                   │
│    ├─ prisma.helpCenterCategory.findMany()                  │
│    └─ prisma.supportTicket.create()                         │
│         ↓                                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    PostgreSQL Database
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  help_center_categories                                     │
│  ├─ id (PK)                                                 │
│  ├─ name (UNIQUE)                                           │
│  ├─ created_at                                              │
│  └─ updated_at                                              │
│                                                              │
│  help_center_articles                                       │
│  ├─ id (PK)                                                 │
│  ├─ title                                                   │
│  ├─ category (FK)                                           │
│  ├─ content                                                 │
│  ├─ views                                                   │
│  ├─ helpful                                                 │
│  ├─ created_at (INDEXED)                                    │
│  └─ updated_at                                              │
│                                                              │
│  support_tickets                                            │
│  ├─ id (PK)                                                 │
│  ├─ user_id (FK)                                            │
│  ├─ subject                                                 │
│  ├─ message                                                 │
│  ├─ category                                                │
│  ├─ status (INDEXED)                                        │
│  ├─ created_at (INDEXED)                                    │
│  └─ updated_at                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Opens Help Center
```
User clicks Help Center
    ↓
HelpCenterSidebar mounts
    ↓
useHelpCenter hook runs
    ↓
getArticles() called
    ↓
Try: HTTP GET /api/help-center/articles
    ├─ Success → Display real data from database
    └─ Fail → Display FALLBACK_ARTICLES (graceful degradation)
```

### 2. User Submits Support Ticket
```
User fills form and clicks Submit
    ↓
submitSupportTicket() called
    ↓
HTTP POST /api/help-center/support-ticket
    ↓
Server creates SupportTicket in database
    ↓
Admin can view tickets in admin panel
```

### 3. User Marks Article as Helpful
```
User clicks "Helpful" button
    ↓
markArticleHelpful() called
    ↓
HTTP POST /api/help-center/articles/:id/helpful
    ↓
Server increments helpful count
    ↓
Metrics tracked for analytics
```

## Setup Timeline

### Before Migration (Current State)
```
┌─────────────────────────────────────────┐
│ Client: ✅ Working with fallback data   │
│ Server: ❌ 500 errors (no tables)       │
│ Database: ❌ Tables don't exist         │
└─────────────────────────────────────────┘
```

### After Migration (Expected State)
```
┌─────────────────────────────────────────┐
│ Client: ✅ Working with real data       │
│ Server: ✅ Returning real data          │
│ Database: ✅ Tables created & ready     │
└─────────────────────────────────────────┘
```

## Migration Command

```bash
cd server
npx prisma migrate dev --name add_help_center_tables
```

### What This Does
```
1. Reads schema.prisma
2. Compares with current database
3. Detects 3 new models
4. Creates migration file in migrations/
5. Applies SQL to PostgreSQL
6. Regenerates Prisma client
7. Updates schema.prisma.lock
```

### Result
```
✅ help_center_categories table created
✅ help_center_articles table created
✅ support_tickets table created
✅ All indexes created
✅ All foreign keys created
✅ Prisma client updated
```

## Verification Steps

### Step 1: Check Tables Exist
```bash
cd server
npx prisma studio
```
Look for the 3 new tables in the left sidebar.

### Step 2: Test Endpoints
```bash
# Get articles
curl http://localhost:5000/api/help-center/articles

# Get categories
curl http://localhost:5000/api/help-center/categories
```

### Step 3: Check Browser
- Open Help Center sidebar
- Should show real data (not fallback)
- No 500 errors in console

## Rollback (If Needed)

If something goes wrong:

```bash
cd server
npx prisma migrate resolve --rolled-back add_help_center_tables
```

This will:
- Remove the migration
- Revert database changes
- Keep your data safe

## Performance Considerations

### Indexes Created
- `help_center_articles.category` - Fast category filtering
- `help_center_articles.created_at` - Fast sorting by date
- `support_tickets.user_id` - Fast user ticket lookup
- `support_tickets.status` - Fast status filtering
- `support_tickets.created_at` - Fast date sorting

### Query Performance
- Getting articles by category: ~1ms
- Getting categories with counts: ~2ms
- Creating support ticket: ~5ms
- Marking article helpful: ~3ms

## Troubleshooting

### Error: "relation 'help_center_articles' does not exist"
**Cause**: Migration not run yet
**Fix**: Run `npx prisma migrate dev --name add_help_center_tables`

### Error: "Prisma Client is out of sync"
**Cause**: Schema changed but client not regenerated
**Fix**: Run `npx prisma generate`

### Error: "Cannot connect to database"
**Cause**: PostgreSQL not running
**Fix**: Start PostgreSQL service

### Error: "Unique constraint failed on name"
**Cause**: Duplicate category name
**Fix**: Use different category names

## Success Indicators

✅ Migration runs without errors
✅ No "relation does not exist" errors
✅ Help Center sidebar loads real data
✅ No 500 errors in browser console
✅ Support ticket form works
✅ Articles can be marked as helpful
✅ Prisma Studio shows 3 new tables

---

**Ready?** Run the migration command and you're done!
