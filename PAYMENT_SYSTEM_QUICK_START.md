# Payment System - Quick Start Guide

## What Was Fixed

✅ **Payment Verification Endpoint** - Added missing `/payments/verify/:txRef` route
✅ **Payment Service Method** - Added `getPaymentByTxRef()` method
✅ **Timeout Issues** - Increased all Chapa API timeouts from 10s to 30s
✅ **Frontend Timeout** - Increased axios timeout from 30s to 60s
✅ **Error Handling** - Enhanced timeout error messages

## Quick Test (5 minutes)

### 1. Start Backend
```bash
cd server
npm run dev
```

### 2. Start Frontend
```bash
cd client
npm run dev
```

### 3. Test Payment Flow
1. Login as candidate
2. Navigate to interview payment
3. Select credit bundle
4. Click "Pay with Chapa"
5. Complete payment (use test card: 4111111111111111)
6. Should redirect to PaymentSuccess page
7. Should show "Payment Confirmed!" message
8. Should auto-redirect to interview

## Expected Behavior

### Success Flow
```
Initialize Payment
    ↓ (< 1 second)
Redirect to Chapa
    ↓ (user completes payment)
Redirect to /payment/success?tx_ref=...
    ↓ (< 5 seconds)
Verify Payment
    ↓ (< 30 seconds)
Show "Payment Confirmed!"
    ↓ (5 second countdown)
Redirect to Interview
```

### Error Flow
```
Initialize Payment
    ↓
Redirect to Chapa
    ↓
User Cancels or Payment Fails
    ↓
Redirect to /payment/success?tx_ref=...
    ↓
Verify Payment
    ↓
Show Error Message
    ↓
User Can Retry or Go Back
```

## Timeout Configuration

### Current Settings
```
Frontend: 60 seconds
Backend Chapa API: 30 seconds
```

### To Change Timeouts

**Backend** (`server/services/chapaService.js`):
```javascript
// Find: timeout: 30000
// Change to: timeout: 45000 (for 45 seconds)
```

**Frontend** (`client/src/utils/api.ts`):
```javascript
// Find: timeout: 60000
// Change to: timeout: 90000 (for 90 seconds)
```

## Verify Installation

### Check Backend
```bash
# Should see no errors
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/payments/verify/test

# Expected: 404 (payment not found) or 200 (if payment exists)
# NOT: 404 route not found
```

### Check Frontend
```bash
# Open browser console (F12)
# Should see no errors
# Try payment flow
```

### Check Database
```sql
-- Check payment was created
SELECT * FROM payments 
WHERE transaction_id LIKE 'tx_%' 
ORDER BY created_at DESC LIMIT 1;

-- Check wallet was updated
SELECT * FROM wallets 
WHERE user_id = (SELECT user_id FROM payments ORDER BY created_at DESC LIMIT 1);
```

## Common Issues

### Issue: "Payment not found" error
**Solution**: 
- Verify txRef is correct
- Check payment was initialized before redirect
- Check database for payment record

### Issue: "Timeout" error
**Solution**:
- Check backend is running
- Check Chapa API is accessible
- Increase timeout if needed
- Check network connectivity

### Issue: "Unauthorized access" error
**Solution**:
- Verify JWT token is valid
- Verify token belongs to same user
- Check user_id in payments table

### Issue: Payment status stays PENDING
**Solution**:
- Verify payment was completed on Chapa
- Check webhook is configured
- Manually verify with Chapa API
- Check server logs

## Monitoring

### Check Logs
```bash
# Backend logs
tail -f server/logs/combined.log

# Error logs
tail -f server/logs/error.log

# Search for payment errors
grep -i "payment" server/logs/error.log
grep -i "chapa" server/logs/error.log
grep -i "timeout" server/logs/error.log
```

### Monitor Metrics
```sql
-- Payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payments
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY status;

-- Average verification time
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_seconds,
  MAX(EXTRACT(EPOCH FROM (updated_at - created_at))) as max_seconds
FROM payments
WHERE status = 'COMPLETED'
AND created_at > NOW() - INTERVAL '1 hour';
```

## Files Changed

1. `server/services/paymentService.js` - Added getPaymentByTxRef()
2. `server/routes/payments.js` - Registered /verify/:txRef route
3. `server/services/chapaService.js` - Updated timeouts to 30s
4. `client/src/utils/api.ts` - Updated timeout to 60s
5. `client/src/pages/PaymentSuccess.tsx` - Enhanced error handling

## Environment Variables

Make sure these are set in `.env`:

```env
# Backend
CHAPA_API_KEY=your_chapa_api_key
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook
DATABASE_URL=postgresql://user:password@localhost:5432/simuai

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Initialize Payment
```bash
POST /api/payments/initialize
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "bundleId": "1",
  "amount": 500,
  "creditAmount": 100
}
```

### Verify Payment
```bash
GET /api/payments/verify/{txRef}
Authorization: Bearer YOUR_TOKEN
```

### Get Payment History
```bash
GET /api/payments/history
Authorization: Bearer YOUR_TOKEN
```

## Deployment

### Pre-Deployment
- [x] All code changes completed
- [x] All tests passing
- [x] All documentation created
- [x] No breaking changes
- [x] Backward compatible

### Deployment Steps
1. Deploy backend: `npm run build && npm start`
2. Deploy frontend: `npm run build`
3. Monitor logs for errors
4. Test payment flow
5. Monitor success rate

### Rollback
If issues occur:
1. Revert to previous version
2. Investigate root cause
3. Fix and redeploy

## Support

### Documentation
- `PAYMENT_VERIFICATION_COMPLETE.md` - Complete guide
- `PAYMENT_VERIFICATION_TEST_GUIDE.md` - Testing guide
- `CHAPA_TIMEOUT_FIX.md` - Timeout fix details
- `TIMEOUT_CONFIGURATION_REFERENCE.md` - Timeout reference
- `PAYMENT_SYSTEM_FINAL_STATUS.md` - Final status

### Troubleshooting
1. Check logs: `tail -f server/logs/error.log`
2. Check database: Query payments table
3. Check Chapa status: https://status.chapa.co
4. Check network: Use browser DevTools

## Status

✅ **Ready for Production**
✅ **All Tests Passing**
✅ **No Blocking Issues**
✅ **Documentation Complete**

---

**Last Updated**: March 29, 2026
**Status**: Production Ready
**Version**: 1.0.0
