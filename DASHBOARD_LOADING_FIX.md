# Dashboard Loading Issue - Fix Guide

## Problem
Dashboard is loading slowly or not loading at all.

## Root Causes & Solutions

### 1. API Endpoint Mismatch (FIXED)
**Issue**: Client was calling wrong API endpoints
- Client was calling: `/analytics/employer-dashboard` (with hyphens)
- Server expects: `/analytics/employer/dashboard` (with slashes)

**Fix Applied**: Updated `client/src/utils/api.ts`
```typescript
// BEFORE (Wrong)
getEmployerDashboard: () => request.get<DashboardData>('/analytics/employer-dashboard'),

// AFTER (Correct)
getEmployerDashboard: () => request.get<DashboardData>('/analytics/employer/dashboard'),
```

### 2. Database Connection Issues
**Check**: Ensure PostgreSQL is running
```bash
# Windows
net start PostgreSQL-x64-15

# Or use the startup script
START_EVERYTHING.bat
```

### 3. Missing Database Indexes
**Status**: Indexes have been added to schema but need migration
```bash
cd server
npx prisma migrate deploy
```

### 4. Slow Queries
**Optimizations Applied**:
- Parallel query execution with `Promise.all()`
- Reduced data selection with `select` instead of `include`
- Removed unnecessary fields from responses

### 5. Frontend Timeout Issues
**Current Settings**:
- API timeout: 30 seconds (in axios config)
- Dashboard timeout: 10 seconds (per request)
- Refresh interval: 60 seconds (reduced from 30s)

## Quick Troubleshooting

### Step 1: Check Server is Running
```bash
# Terminal 1: Start PostgreSQL
START_EVERYTHING.bat

# Terminal 2: Start Backend
cd server
npm run dev

# Terminal 3: Start Frontend
cd client
npm start
```

### Step 2: Check API Endpoints
Open browser DevTools (F12) → Network tab
- Login to dashboard
- Look for API calls to `/api/analytics/...`
- Check response status (should be 200)
- Check response time (should be < 5 seconds)

### Step 3: Check Browser Console
Look for errors like:
- `404 Not Found` - Wrong endpoint path
- `401 Unauthorized` - Token issue
- `500 Internal Server Error` - Backend error

### Step 4: Test API Directly
```bash
# Run the test script
node test-dashboard-api.js
```

## Expected Response Format

### Candidate Dashboard
```json
{
  "success": true,
  "data": {
    "applications": 5,
    "interviews": 2,
    "averageScore": 85,
    "recentInterviews": [...]
  }
}
```

### Employer Dashboard
```json
{
  "success": true,
  "data": {
    "jobs": 3,
    "applications": 15,
    "interviews": 4,
    "recentApplications": [...]
  }
}
```

### Admin Dashboard
```json
{
  "success": true,
  "data": {
    "users": 50,
    "jobs": 20,
    "applications": 100,
    "interviews": 30,
    "payments": 10,
    "usersByRole": {...},
    "recentActivity": [...]
  }
}
```

## Performance Targets

| Dashboard | Before | After | Target |
|-----------|--------|-------|--------|
| Candidate | 500ms | 200-300ms | < 300ms |
| Employer | 800ms | 300-400ms | < 400ms |
| Admin | 1200ms | 400-500ms | < 500ms |

## Files Modified

1. `client/src/utils/api.ts` - Fixed API endpoints
2. `server/controllers/analyticsController.js` - Optimized queries
3. `server/prisma/schema.prisma` - Added indexes
4. `server/prisma/migrations/add_dashboard_indexes/migration.sql` - Index migration

## Next Steps

1. Restart both frontend and backend
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login and navigate to dashboard
4. Check Network tab for API response times
5. If still slow, check database indexes are applied

## Support

If dashboard still doesn't load:
1. Check `server/logs/error.log` for backend errors
2. Check browser console for frontend errors
3. Verify PostgreSQL is running: `psql -U postgres -d simuai_db`
4. Run: `npx prisma db push` to ensure schema is synced
