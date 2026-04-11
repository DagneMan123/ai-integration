# Dashboard Setup & Verification Guide

## Quick Start

### 1. Ensure Database is Running
```bash
# Windows - Start PostgreSQL
Start-Service -Name "postgresql-x64-15"

# Or verify it's running
Get-Service postgresql-x64-15
```

### 2. Run Database Migrations
```bash
cd server
npx prisma migrate dev
```

### 3. Start Backend Server
```bash
cd server
npm start
# Should see: ✅ Database connection established successfully
# Should see: 🚀 Server running on port 5000
```

### 4. Start Frontend
```bash
cd client
npm start
# Should see: Compiled successfully!
# Should open http://localhost:3000
```

## Verification Checklist

### Backend Verification

#### 1. Check Database Connection
```bash
curl http://localhost:5000/health
# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2024-...",
#   "database": "connected"
# }
```

#### 2. Test Dashboard Endpoints (with valid token)
```bash
# Get a valid token first by logging in
# Then test endpoints:

# Candidate Dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard/candidate

# Employer Dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard/employer

# Admin Dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard/admin

# Communication Stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard-communication/stats
```

#### 3. Check All Routes are Registered
```bash
# Look for these in server startup logs:
# ✅ /api/auth
# ✅ /api/users
# ✅ /api/dashboard
# ✅ /api/dashboard-data
# ✅ /api/dashboard-communication
# ✅ /api/jobs
# ✅ /api/applications
# ✅ /api/interviews
# ✅ /api/admin
```

### Frontend Verification

#### 1. Check Services are Loaded
Open browser console (F12) and check:
```javascript
// Should not show errors
console.log('Services loaded successfully')
```

#### 2. Test Dashboard Navigation
1. Login as Candidate → Navigate to `/candidate/dashboard`
   - Should see: Applications, Interviews, Average Score
   - Should see: Real data from database
   - Should auto-refresh every 60 seconds

2. Login as Employer → Navigate to `/employer/dashboard`
   - Should see: Jobs, Applications, Interviews
   - Should see: Real data from database
   - Should auto-refresh every 60 seconds

3. Login as Admin → Navigate to `/admin/dashboard`
   - Should see: Users, Jobs, Interviews, Revenue
   - Should see: Real data from database
   - Should auto-refresh every 60 seconds

#### 3. Check Real-Time Updates
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to any dashboard
4. Should see API calls every 5 seconds:
   - `/api/dashboard-communication/messages/:dashboard`
   - `/api/dashboard-communication/stats`
   - `/api/dashboard-communication/notifications/:dashboard`

#### 4. Test Data Transfer Between Dashboards
1. Login as Candidate in one browser tab
2. Login as Employer in another browser tab
3. Candidate applies for a job
4. Employer dashboard should show new application within 5 seconds
5. Admin dashboard should also show the update

### Database Verification

#### 1. Check Tables Exist
```bash
# Connect to PostgreSQL
psql -U postgres -d simuai_db

# List tables
\dt

# Should see:
# - users
# - jobs
# - applications
# - interviews
# - companies
# - dashboard_messages
# - application_activities
# - interview_activities
# - system_updates
# - dashboard_notifications
```

#### 2. Check Data is Being Saved
```sql
-- Check dashboard messages
SELECT COUNT(*) FROM dashboard_messages;

-- Check recent messages
SELECT * FROM dashboard_messages ORDER BY timestamp DESC LIMIT 5;

-- Check application activities
SELECT COUNT(*) FROM application_activities;

-- Check interview activities
SELECT COUNT(*) FROM interview_activities;
```

## Common Issues & Solutions

### Issue: Dashboard shows "No data"
**Solution:**
1. Verify user is logged in
2. Check API token is valid
3. Verify database has data:
   ```sql
   SELECT COUNT(*) FROM applications WHERE candidate_id = YOUR_USER_ID;
   ```
4. Check browser console for errors
5. Check server logs: `server/logs/error.log`

### Issue: Real-time updates not working
**Solution:**
1. Verify polling is active (check Network tab)
2. Check API endpoints are responding
3. Verify database connection is active
4. Restart backend server
5. Clear browser cache and reload

### Issue: Authentication errors
**Solution:**
1. Verify token is stored in browser localStorage
2. Check token hasn't expired
3. Verify API includes Authorization header
4. Try logging out and back in
5. Check server auth middleware logs

### Issue: Database connection failed
**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   Get-Service postgresql-x64-15
   ```
2. Start PostgreSQL if not running:
   ```bash
   Start-Service -Name "postgresql-x64-15"
   ```
3. Check DATABASE_URL in `.env`
4. Verify database exists: `simuai_db`
5. Run migrations: `npx prisma migrate dev`

### Issue: CORS errors
**Solution:**
1. Verify FRONTEND_URL in server `.env`
2. Check CORS middleware is configured
3. Verify frontend is running on correct port (3000)
4. Clear browser cache
5. Restart both frontend and backend

## Performance Monitoring

### Check API Response Times
1. Open DevTools → Network tab
2. Filter by XHR requests
3. Check response times for:
   - `/api/dashboard/candidate` - Should be < 500ms
   - `/api/dashboard/employer` - Should be < 500ms
   - `/api/dashboard/admin` - Should be < 500ms
   - `/api/dashboard-communication/stats` - Should be < 200ms

### Monitor Database Performance
```sql
-- Check slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Testing Scenarios

### Scenario 1: Candidate Application Flow
1. Login as Candidate
2. View Dashboard → See applications
3. Apply for a job
4. Check Employer Dashboard → See new application
5. Check Admin Dashboard → See activity log

### Scenario 2: Interview Scheduling
1. Login as Employer
2. View Dashboard → See applications
3. Schedule interview with candidate
4. Check Candidate Dashboard → See new interview
5. Check Admin Dashboard → See activity log

### Scenario 3: System Update
1. Login as Admin
2. Make a system update
3. Check Candidate Dashboard → See notification
4. Check Employer Dashboard → See notification
5. Check Admin Dashboard → See update in activity log

### Scenario 4: Real-Time Sync
1. Open 3 browser tabs (Candidate, Employer, Admin)
2. Candidate performs action
3. Verify Employer sees update within 5 seconds
4. Verify Admin sees update within 5 seconds
5. Verify all dashboards stay in sync

## Debugging Tips

### Enable Verbose Logging
```bash
# In server .env
LOG_LEVEL=debug

# In client, open console and run:
localStorage.setItem('DEBUG', '*')
```

### Monitor Network Requests
1. Open DevTools → Network tab
2. Filter by XHR
3. Watch for API calls
4. Check response status and data

### Check Database Queries
```bash
# Enable query logging in PostgreSQL
# In postgresql.conf:
log_statement = 'all'
log_duration = on
```

### Browser Console Debugging
```javascript
// Check auth store
console.log(useAuthStore.getState())

// Check dashboard data
console.log('Dashboard data loaded')

// Monitor API calls
window.addEventListener('fetch', (e) => {
  console.log('API Call:', e.request.url)
})
```

## Deployment Checklist

- [ ] Database migrations completed
- [ ] All tables created successfully
- [ ] Backend server starts without errors
- [ ] Frontend compiles successfully
- [ ] Health check endpoint responds
- [ ] Dashboard endpoints return data
- [ ] Real-time updates working
- [ ] Cross-dashboard communication working
- [ ] Error handling working
- [ ] Logging configured
- [ ] Performance acceptable
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Authentication working
- [ ] Authorization working

## Support Resources

- **Server Logs**: `server/logs/error.log`
- **Database**: PostgreSQL on localhost:5432
- **API Documentation**: See DASHBOARD_IMPLEMENTATION_COMPLETE.md
- **Frontend Services**: `client/src/services/`
- **Backend Controllers**: `server/controllers/`

---

**Last Updated**: 2024
**Status**: ✅ Ready for Testing
