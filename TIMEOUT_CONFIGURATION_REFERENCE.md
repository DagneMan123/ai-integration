# Timeout Configuration Reference

## Current Timeout Settings

### Backend (Node.js)

#### Chapa Service (`server/services/chapaService.js`)
```javascript
// Payment Initialization
timeout: 30000 // 30 seconds

// Payment Verification
timeout: 30000 // 30 seconds

// Bank List Fetching
timeout: 30000 // 30 seconds
```

#### Database Operations
```javascript
// Prisma queries
// Default: No timeout (uses connection pool timeout)
// Typical response: < 100ms
```

#### Express Server
```javascript
// Default: No timeout
// Typical request: < 35 seconds
```

### Frontend (React)

#### Axios Instance (`client/src/utils/api.ts`)
```javascript
timeout: 60000 // 60 seconds
```

#### Individual Requests
```javascript
// Payment verification
GET /api/payments/verify/:txRef
// Typical response: 1-5 seconds
// Max timeout: 60 seconds
```

## Timeout Hierarchy

```
Frontend Request Timeout: 60 seconds
    ↓
Backend Processing: 35 seconds max
    ├─ Chapa API Call: 30 seconds
    ├─ Database Query: < 1 second
    ├─ Response Processing: < 5 seconds
    └─ Network Overhead: < 1 second
```

## When to Adjust Timeouts

### Increase Timeout If:
- Chapa API is slow (> 20 seconds)
- Network latency is high (> 5 seconds)
- Database is slow (> 1 second)
- Getting frequent timeout errors

### Decrease Timeout If:
- Want faster failure detection
- Have very fast network
- Want to fail fast on errors

## Recommended Timeout Values

### For Different Scenarios

| Scenario | Chapa Timeout | Frontend Timeout | Notes |
|----------|--------------|-----------------|-------|
| Local Development | 30s | 60s | Standard |
| Staging | 30s | 60s | Standard |
| Production (Normal) | 30s | 60s | Standard |
| Production (High Load) | 45s | 90s | Increased for reliability |
| Production (Low Latency) | 20s | 45s | Reduced for speed |

## How to Change Timeouts

### Backend Timeout

**File**: `server/services/chapaService.js`

```javascript
// Find this line in each method:
timeout: 30000

// Change to desired value (in milliseconds):
timeout: 45000 // 45 seconds
```

### Frontend Timeout

**File**: `client/src/utils/api.ts`

```javascript
// Find this line:
timeout: 60000

// Change to desired value (in milliseconds):
timeout: 90000 // 90 seconds
```

## Monitoring Timeouts

### Check Timeout Errors in Logs

```bash
# Backend logs
grep -i "timeout" server/logs/error.log

# Frontend console
# Open browser DevTools → Console
# Look for timeout errors
```

### Monitor Timeout Metrics

```sql
-- Check average payment verification time
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_time_seconds,
  MAX(EXTRACT(EPOCH FROM (updated_at - created_at))) as max_time_seconds,
  COUNT(*) as total_payments
FROM payments
WHERE status = 'COMPLETED'
AND created_at > NOW() - INTERVAL '1 hour';
```

## Timeout Error Messages

### Frontend Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "timeout of 60000ms exceeded" | Frontend timeout | Increase frontend timeout |
| "timeout of 10000ms exceeded" | Backend timeout | Increase backend timeout |
| "Server connection lost" | Network error | Check network connectivity |
| "Payment verification is taking longer..." | Chapa slow | Wait and retry |

### Backend Error Messages

```
error: Payment verification error: timeout of 30000ms exceeded
warn: Chapa verification failed: timeout of 30000ms exceeded
```

## Performance Baseline

### Expected Response Times

| Operation | Min | Avg | Max |
|-----------|-----|-----|-----|
| Payment Query | 10ms | 50ms | 100ms |
| Chapa Verification | 1s | 3s | 30s |
| Wallet Update | 10ms | 50ms | 100ms |
| Total Verification | 1s | 3.5s | 30s |

## Timeout Best Practices

1. **Set timeouts high enough** to handle network latency
2. **Monitor timeout errors** to detect issues early
3. **Log timeout events** for debugging
4. **Alert on timeout spikes** to catch problems
5. **Test with slow networks** to verify timeout handling
6. **Document timeout values** for team reference
7. **Review timeouts quarterly** to optimize

## Testing Timeout Behavior

### Simulate Slow Network

```bash
# Using Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Try payment verification
5. Should still succeed with 60s timeout
```

### Simulate Chapa Delay

```bash
# Add delay in chapaService.js for testing
const response = await new Promise(resolve => {
  setTimeout(() => {
    // Make actual request
  }, 15000); // 15 second delay
});
```

## Timeout Configuration Checklist

- [x] Backend Chapa timeout: 30 seconds
- [x] Frontend axios timeout: 60 seconds
- [x] Error handling for timeouts
- [x] User-friendly timeout messages
- [x] Logging for timeout events
- [x] Monitoring for timeout metrics
- [x] Documentation for timeout values
- [x] Testing for timeout scenarios

## Quick Reference

### To Increase Timeouts
1. Edit `server/services/chapaService.js` - Change `timeout: 30000` to `timeout: 45000`
2. Edit `client/src/utils/api.ts` - Change `timeout: 60000` to `timeout: 90000`
3. Restart backend and frontend
4. Test payment verification

### To Decrease Timeouts
1. Edit `server/services/chapaService.js` - Change `timeout: 30000` to `timeout: 20000`
2. Edit `client/src/utils/api.ts` - Change `timeout: 60000` to `timeout: 45000`
3. Restart backend and frontend
4. Test payment verification

### To Monitor Timeouts
1. Check logs: `grep -i "timeout" server/logs/error.log`
2. Check database: Query payments table for completion times
3. Check frontend: Open DevTools → Network tab
4. Check Chapa status: https://status.chapa.co

---

**Last Updated**: March 29, 2026
**Status**: Current and Accurate
**Timeout Values**: Optimized for Production
