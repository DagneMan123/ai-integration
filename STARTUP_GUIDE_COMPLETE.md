# Complete Startup Guide - SimuAI Platform

## Current Status
- ✅ Interview controller: All 16 functions present and exported
- ✅ Routes: Properly mapped to controller functions
- ✅ Mock AI Mode: Enabled (USE_MOCK_AI=true)
- ⚠️ Database: PostgreSQL must be running on port 5432
- ⚠️ Webpack: Client build cache may need clearing

## Prerequisites
1. **PostgreSQL** must be installed and running
2. **Node.js** v18+ installed
3. **npm** installed

## Step-by-Step Startup

### Step 1: Start PostgreSQL Database
**Windows:**
```bash
# Option A: Using PostgreSQL Service (if installed as service)
net start postgresql-x64-15

# Option B: Using pgAdmin or PostgreSQL installer
# Open PostgreSQL installer and start the service

# Option C: Using command line (if PostgreSQL is in PATH)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

**Verify PostgreSQL is running:**
```bash
psql -U postgres -c "SELECT version();"
```

### Step 2: Start Backend Server (Port 5000)
```bash
cd server
npm install  # Only needed first time
npm run dev
```

**Expected output:**
```
Database connection established successfully via Prisma.
✓ AI Service initialized via Mock Mode
Server running on port 5000
```

### Step 3: Start Frontend Client (Port 3000)
**In a NEW terminal window:**
```bash
cd client
npm install  # Only needed first time
npm run dev
```

**Expected output:**
```
Compiled successfully!
You can now view the app in the browser.
Local: http://localhost:3000
```

### Step 4: Verify All Services
- Backend: http://localhost:5000/api/health (if endpoint exists)
- Frontend: http://localhost:3000
- Database: Connected via Prisma

## Troubleshooting

### Error: "Can't reach database server at localhost:5432"
**Solution:**
1. Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
2. Check DATABASE_URL in `server/.env` is correct
3. Ensure database `simuai_db` exists
4. Restart PostgreSQL service

### Error: "Route.get() requires a callback function"
**Solution:**
- This is fixed. All 16 interview controller functions are now properly exported.
- If error persists, restart the server: `npm run dev`

### Error: "Loading chunk failed (timeout)"
**Solution:**
```bash
cd client
# Clear build cache
rm -r build node_modules/.cache
npm install
npm run dev
```

### Error: "USE_MOCK_AI not working"
**Solution:**
1. Verify `server/.env` has: `USE_MOCK_AI=true`
2. Restart server: `npm run dev`
3. Check server logs for: "Using mock AI mode"

## Environment Variables

**server/.env** (Critical settings):
```
DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public"
USE_MOCK_AI=true
PORT=5000
NODE_ENV=development
```

**client/.env** (if needed):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run build` | Build for production |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                  │
│                   React + TypeScript                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────┐
│                    Backend (Port 5000)                   │
│                   Express + Node.js                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Interview Controller (16 functions)             │   │
│  │  - startInterview                                │   │
│  │  - submitAnswer                                  │   │
│  │  - completeInterview                             │   │
│  │  - getCandidateInterviews                        │   │
│  │  - getEmployerInterviews                         │   │
│  │  - ... (11 more functions)                       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────┐
│              PostgreSQL Database (Port 5432)             │
│                    simuai_db                             │
└─────────────────────────────────────────────────────────┘
```

## Key Features Enabled

✅ **Mock AI Mode**: All AI calls return fallback responses (no API quota needed)
✅ **Interview System**: Full interview workflow with 16 controller functions
✅ **Database**: Automatic data fetching with job information
✅ **Anti-Cheat**: Session monitoring and integrity scoring
✅ **Authentication**: JWT-based auth with role-based access control

## Next Steps

1. Start PostgreSQL
2. Start backend server
3. Start frontend client
4. Navigate to http://localhost:3000
5. Login or register
6. Test interview functionality

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify all three services are running (PostgreSQL, Backend, Frontend)
3. Check `server/logs/error.log` for detailed errors
4. Restart all services in order: Database → Backend → Frontend
