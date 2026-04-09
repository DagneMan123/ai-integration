# Commands to Run - Help Center Setup

## 🎯 Main Command (Required)

This is the ONLY command you need to run to complete the setup:

```bash
cd server
npx prisma migrate dev --name add_help_center_tables
```

**What it does**:
- Creates migration file
- Applies schema to PostgreSQL
- Regenerates Prisma client
- Enables help center functionality

**Expected output**:
```
✔ Prisma Migrate created the following migration:

migrations/
  └─ 20260409_add_help_center_tables/
    └─ migration.sql

✔ Your database has been successfully migrated to the latest schema.
```

**Time**: ~2-3 minutes

---

## ✅ Verification Commands (Optional but Recommended)

### 1. Check Tables Were Created
```bash
cd server
npx prisma studio
```

**What to look for**:
- Left sidebar should show 3 new tables:
  - `help_center_categories`
  - `help_center_articles`
  - `support_tickets`

**How to exit**: Press Ctrl+C

---

### 2. Test Help Center Endpoints
```bash
# Get articles
curl http://localhost:5000/api/help-center/articles

# Get categories
curl http://localhost:5000/api/help-center/categories
```

**Expected response**:
```json
{
  "success": true,
  "data": [],
  "message": "Articles fetched successfully"
}
```

---

### 3. Restart Server (If Needed)
```bash
# In server directory
npm start
```

Or if using a different start command:
```bash
node index.js
```

---

## 🌱 Optional: Seed Sample Data

If you want to populate the help center with sample articles:

### Step 1: Edit Seed File
Open `server/prisma/seed.js` and add this to the main seed function:

```javascript
// Add help center data
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
      content: 'Learn how to prepare for your first AI-powered interview. Make sure your camera and microphone are working properly.',
      views: 0,
      helpful: 0
    },
    {
      title: 'System Requirements',
      category: 'Technical',
      content: 'Your system needs: Chrome/Firefox browser, webcam, microphone, stable internet connection (5+ Mbps).',
      views: 0,
      helpful: 0
    },
    {
      title: 'Troubleshooting Camera Issues',
      category: 'Troubleshooting',
      content: 'If your camera is not working: 1) Check permissions, 2) Restart browser, 3) Try different browser.',
      views: 0,
      helpful: 0
    },
    {
      title: 'How to Update Your Profile',
      category: 'Account',
      content: 'Go to Settings > Profile to update your information, resume, and skills.',
      views: 0,
      helpful: 0
    },
    {
      title: 'Payment Methods',
      category: 'Payments',
      content: 'We accept credit cards, debit cards, and mobile money payments.',
      views: 0,
      helpful: 0
    }
  ],
  skipDuplicates: true
});

console.log('✅ Help center data seeded');
```

### Step 2: Run Seed
```bash
cd server
npx prisma db seed
```

**Expected output**:
```
Running seed command `node prisma/seed.js` ...
✅ Help center data seeded
```

---

## 🔄 Rollback (If Something Goes Wrong)

If you need to undo the migration:

```bash
cd server
npx prisma migrate resolve --rolled-back add_help_center_tables
```

Then you can run the migration again:

```bash
npx prisma migrate dev --name add_help_center_tables
```

---

## 🐛 Troubleshooting Commands

### If you get "Prisma Client is out of sync"
```bash
cd server
npx prisma generate
```

### If you get "Cannot connect to database"
Check your DATABASE_URL:
```bash
# Windows PowerShell
Get-Content server\.env | Select-String DATABASE_URL

# Or just open the file
cat server/.env
```

Make sure it looks like:
```
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
```

### If you get "relation does not exist"
The migration didn't run. Try again:
```bash
cd server
npx prisma migrate dev --name add_help_center_tables
```

### If you get "Unique constraint failed"
There's duplicate data. Check the database:
```bash
cd server
npx prisma studio
```

---

## 📋 Complete Setup Workflow

### Step 1: Run Migration (Required)
```bash
cd server
npx prisma migrate dev --name add_help_center_tables
```

### Step 2: Verify (Recommended)
```bash
cd server
npx prisma studio
```
Check that 3 new tables exist.

### Step 3: Restart Server (If Needed)
```bash
npm start
```

### Step 4: Test in Browser
- Open http://localhost:3000
- Click Help Center
- Should show real data (not fallback)
- No 500 errors in console

### Step 5: Optional - Seed Data
```bash
cd server
npx prisma db seed
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Run migration | 2-3 min |
| Verify tables | 1 min |
| Restart server | 30 sec |
| Test in browser | 1 min |
| Seed data | 1 min |
| **Total** | **5-7 min** |

---

## ✨ Success Indicators

After running the migration, you should see:

✅ No errors in terminal
✅ "Your database has been successfully migrated" message
✅ 3 new tables in Prisma Studio
✅ Help Center sidebar loads real data
✅ No 500 errors in browser console
✅ Support ticket form works

---

## 🎯 Quick Copy-Paste

Just copy and paste this into your terminal:

```bash
cd server && npx prisma migrate dev --name add_help_center_tables
```

That's it! The migration will run and complete the setup.

---

## 📞 Need Help?

If something doesn't work:

1. Check the error message carefully
2. Look in `HELP_CENTER_VISUAL_GUIDE.md` for troubleshooting
3. Verify PostgreSQL is running
4. Check `server/.env` for DATABASE_URL
5. Try running `npx prisma generate`

---

**Ready?** Run the main command above and you're done! 🚀
