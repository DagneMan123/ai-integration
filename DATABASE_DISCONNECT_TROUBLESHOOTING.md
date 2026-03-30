# Database Connection Disconnect - Troubleshooting Guide

## Common Reasons for Sudden Disconnects

### 1. **PostgreSQL Service Stopped**
Most common cause - the database service crashed or was stopped.

**Check Status:**
```powershell
Get-Service -Name "postgresql-x64-15"
```

**Restart:**
```powershell
Start-Service -Name "postgresql-x64-15"
```

---

### 2. **Connection Pool Exhausted**
Too many connections opened without closing them.

**Symptoms:**
- "too many connections" error
- Slow queries
- New connections fail

**Fix in `server/lib/prisma.js`:**
```javascript
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Add connection pool settings
const prismaWithPool = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=10'
    }
  }
});
```

---

### 3. **Idle Connection Timeout**
PostgreSQL closes idle connections after a period of inactivity.

**Default: 10 minutes**

**Fix in `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/simuai?connect_timeout=10&statement_timeout=30000"
```

---

### 4. **Network Issues**
Firewall, network adapter, or connectivity problems.

**Check Connection:**
```bash
# Test PostgreSQL connection
psql -U postgres -d simuai -c "SELECT 1"

# Check if port 5432 is listening
netstat -ano | findstr :5432
```

---

### 5. **Out of Memory**
PostgreSQL process running out of memory.

**Check Memory:**
```powershell
Get-Process postgresql | Select-Object Name, WorkingSet
```

---

### 6. **Disk Space Full**
Database can't write if disk is full.

**Check Disk:**
```powershell
Get-Volume | Select-Object DriveLetter, SizeRemaining, Size
```

---

## Diagnostic Steps

### Step 1: Check PostgreSQL Status
```powershell
# Is service running?
Get-Service -Name "postgresql-x64-15"

# Check process
Get-Process postgresql

# Check port
netstat -ano | findstr :5432
```

### Step 2: Test Connection
```bash
# Direct connection test
psql -U postgres -d simuai -c "SELECT 1"

# Check connection count
psql -U postgres -d simuai -c "SELECT count(*) FROM pg_stat_activity"
```

### Step 3: Check Logs
```bash
# PostgreSQL logs (Windows)
# Usually in: C:\Program Files\PostgreSQL\15\data\log\

# Backend logs
tail -f server/logs/error.log
tail -f server/logs/combined.log
```

### Step 4: Monitor Connections
```sql
-- Check active connections
SELECT pid, usename, application_name, state, query 
FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - interval '10 minutes';
```

---

## Prevention: Add Connection Retry Logic

**File: `server/lib/prisma.js`**

```javascript
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Add retry logic
async function connectWithRetry(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connected');
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
      if (i < maxRetries - 1) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  return false;
}

// Use in server startup
export { prisma, connectWithRetry };
```

**File: `server/index.js`**

```javascript
import { prisma, connectWithRetry } from './lib/prisma.js';

// On startup
const connected = await connectWithRetry();
if (!connected) {
  console.error('❌ Failed to connect to database after retries');
  process.exit(1);
}
```

---

## Prevention: Add Connection Pooling

**File: `server/lib/prisma.js`**

```javascript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + 
        '?connection_limit=10&' +
        'pool_timeout=10&' +
        'statement_timeout=30000&' +
        'idle_in_transaction_session_timeout=60000'
    }
  },
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
```

---

## Prevention: Add Health Check Endpoint

**File: `server/routes/health.js`**

```javascript
import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
```

**File: `server/index.js`**

```javascript
import healthRoutes from './routes/health.js';

app.use('/api', healthRoutes);

// Monitor health every 30 seconds
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection healthy');
  } catch (error) {
    console.error('❌ Database connection lost:', error.message);
    // Alert or restart logic here
  }
}, 30000);
```

---

## Quick Recovery Steps

### If Connection Drops:

**1. Restart PostgreSQL**
```powershell
Stop-Service -Name "postgresql-x64-15"
Start-Service -Name "postgresql-x64-15"
```

**2. Restart Backend**
```bash
# Stop backend (Ctrl + C)
# Then restart
npm run dev
```

**3. Check Logs**
```bash
tail -f server/logs/error.log
```

**4. Verify Connection**
```bash
psql -U postgres -d simuai -c "SELECT 1"
```

---

## Environment Variables for Stability

**File: `.env`**

```env
# Database connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/simuai?connect_timeout=10&statement_timeout=30000&idle_in_transaction_session_timeout=60000"

# Connection pool
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_TIMEOUT=10

# Timeouts (milliseconds)
DATABASE_QUERY_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=60000
```

---

## Monitoring Dashboard

**File: `server/routes/monitoring.js`**

```javascript
import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/db-stats', async (req, res) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        sum(case when state = 'active' then 1 else 0 end) as active,
        sum(case when state = 'idle' then 1 else 0 end) as idle,
        sum(case when state = 'idle in transaction' then 1 else 0 end) as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database();
    `;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## Checklist for Stability

- [ ] PostgreSQL service set to "Automatic" startup
- [ ] Connection pool configured (5-10 connections)
- [ ] Idle timeout set (60 seconds)
- [ ] Statement timeout set (30 seconds)
- [ ] Graceful shutdown handlers added
- [ ] Health check endpoint implemented
- [ ] Retry logic implemented
- [ ] Monitoring dashboard set up
- [ ] Error logging configured
- [ ] Database backups scheduled

---

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Connected | OK |
| 503 | Disconnected | Restart PostgreSQL |
| 504 | Timeout | Check network |
| 500 | Error | Check logs |

---

## Quick Test

```bash
# Test connection
curl http://localhost:5000/api/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"2026-03-29T..."}
```

---

**If connection keeps dropping:**
1. Check PostgreSQL logs
2. Check system resources (memory, disk)
3. Check network connectivity
4. Increase connection pool size
5. Increase timeout values
6. Contact database administrator

