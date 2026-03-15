# Fix Database Connection and Company Profile Errors

## Issues Fixed

1. **PostgreSQL Connection Error**: "Can't reach database server at `localhost:5432`"
2. **Invalid Company ID Error**: Route ordering issue causing `/api/companies/profile` to hit wrong endpoint

## Solution

### Step 1: Start PostgreSQL Service

**Option A: Using Services (Recommended)**
```powershell
# Open PowerShell as Administrator and run:
Start-Service postgresql-x64-15
# or if you have PostgreSQL 14:
Start-Service postgresql-x64-14
```

**Option B: Using Task Manager**
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Go to Services tab
3. Find `postgresql-x64-15` or `postgresql-x64-14`
4. Right-click → Start

**Option C: Using Services.msc**
1. Press `Win + R`
2. Type `services.msc`
3. Find PostgreSQL service
4. Right-click → Start

### Step 2: Verify PostgreSQL is Running

```powershell
# Test connection
psql -U postgres -h localhost -p 5432 -c "SELECT 1"
```

If successful, you'll see output. If it fails, PostgreSQL isn't running.

### Step 3: Start the Server

```powershell
cd server
npm run dev
```

Or use the batch file:
```powershell
.\start-all.bat
```

## What Was Fixed

### Route Fix (server/routes/companies.js)
- Changed `/my/profile` to `/profile` to match frontend calls
- Reordered routes so specific routes come before dynamic `:id` routes
- This prevents "profile" from being treated as an ID parameter

### Before:
```
GET /companies/:id  ← "profile" was treated as an ID
GET /companies/my/profile
```

### After:
```
GET /companies/profile  ← Specific route comes first
GET /companies/:id      ← Dynamic route comes last
```

## Testing

Once PostgreSQL is running and server starts:

1. Open browser to `http://localhost:3000`
2. Login as employer
3. Go to employer dashboard
4. Company profile should load without "Invalid company ID" error

## If Still Getting Errors

1. **Check PostgreSQL is running**:
   ```powershell
   Get-Service postgresql-x64-15 | Select-Object Status
   ```

2. **Check database exists**:
   ```powershell
   psql -U postgres -l
   ```

3. **Check server logs** for more details

4. **Restart everything**:
   - Stop PostgreSQL service
   - Stop Node server
   - Start PostgreSQL service
   - Start Node server
