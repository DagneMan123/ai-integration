# Payment Verification - Quick Test Guide

## System Status
✅ Backend: Ready
✅ Frontend: Ready
✅ Database: Ready
✅ All Endpoints: Registered
✅ No Syntax Errors: Verified

## Quick Test Checklist

### 1. Backend Verification
```bash
# Check if payment routes are registered
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/payments/verify/test_txref

# Expected: 404 (payment not found) or 200 (if payment exists)
# NOT: 404 route not found
```

### 2. Payment Flow Test
```
1. Login to candidate dashboard
2. Click on "Start Interview" or "Buy Credits"
3. Select a credit bundle
4. Click "Pay with Chapa"
5. Complete payment (use test card: 4111111111111111)
6. Should redirect to /payment/success?tx_ref=...
7. Should show "Verifying Payment" loading state
8. Should show "Payment Confirmed!" success message
9. Should auto-redirect to interview or subscription
```

### 3. Database Verification
```sql
-- Check payment was created
SELECT * FROM payments 
WHERE transaction_id LIKE 'tx_%' 
ORDER BY created_at DESC LIMIT 1;

-- Check wallet was updated
SELECT * FROM wallets 
WHERE user_id = (SELECT user_id FROM payments ORDER BY created_at DESC LIMIT 1);

-- Check wallet transaction was logged
SELECT * FROM wallet_transactions 
WHERE user_id = (SELECT user_id FROM payments ORDER BY created_at DESC LIMIT 1);
```

### 4. API Endpoint Tests

#### Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bundleId": "1",
    "amount": 500,
    "creditAmount": 100
  }'

# Expected Response:
{
  "success": true,
  "data": {
    "txRef": "tx_1234567890",
    "paymentId": 1,
    "amount": 500,
    "creditAmount": 100,
    "bundleName": "100 Credits"
  }
}
```

#### Verify Payment
```bash
curl -X GET http://localhost:5000/api/payments/verify/tx_1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response (if completed):
{
  "success": true,
  "data": {
    "txRef": "tx_1234567890",
    "amount": 500,
    "status": "COMPLETED",
    "creditAmount": 100,
    "paidAt": "2026-03-29T10:30:00Z"
  }
}

# Expected Response (if pending):
{
  "success": false,
  "data": {
    "txRef": "tx_1234567890",
    "amount": 500,
    "status": "PENDING",
    "creditAmount": 100,
    "paidAt": null
  }
}
```

#### Get Payment History
```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 500,
      "status": "COMPLETED",
      "transactionId": "tx_1234567890",
      "paidAt": "2026-03-29T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## Troubleshooting

### Issue: "Payment not found" error
**Solution**: 
1. Verify txRef is correct
2. Check payment was initialized before redirect
3. Check database: `SELECT * FROM payments WHERE transaction_id = 'txRef'`

### Issue: "Unauthorized access to payment" error
**Solution**:
1. Verify JWT token is valid
2. Verify token belongs to same user who initiated payment
3. Check user_id in payments table matches authenticated user

### Issue: "Server connection lost" on PaymentSuccess page
**Solution**:
1. Check backend is running: `curl http://localhost:5000/api/health`
2. Check CHAPA_API_KEY is set in .env
3. Check network tab in browser DevTools for actual error
4. Check server logs for detailed error message

### Issue: Payment status stays PENDING
**Solution**:
1. Verify payment was completed on Chapa
2. Check Chapa webhook is configured correctly
3. Manually verify with Chapa API: `GET /transaction/verify/{txRef}`
4. Check server logs for webhook processing

## Expected Behavior

### Success Flow
```
Initialize Payment
    ↓
Redirect to Chapa
    ↓
Complete Payment on Chapa
    ↓
Redirect to /payment/success?tx_ref=...
    ↓
Verify Payment (GET /payments/verify/{txRef})
    ↓
Update Payment Status to COMPLETED
    ↓
Update Wallet Balance
    ↓
Log Transaction
    ↓
Show Success Message
    ↓
Auto-redirect to Interview/Subscription
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
Verify Payment (GET /payments/verify/{txRef})
    ↓
Payment Status = FAILED or PENDING
    ↓
Show Error Message
    ↓
User Can Retry or Go Back
```

## Performance Metrics

- Payment initialization: < 500ms
- Payment verification: < 1000ms (includes Chapa API call)
- Wallet update: < 100ms (atomic transaction)
- Total flow: < 2 seconds

## Security Checklist

✅ JWT authentication required for all endpoints
✅ User can only verify their own payments
✅ Payment amount validated against Chapa
✅ Webhook signature validated with HMAC-SHA256
✅ Sensitive data not logged
✅ Idempotency check prevents duplicate processing
✅ Atomic transactions prevent race conditions
✅ Chapa API key stored in environment variables only

## Monitoring

### Key Metrics to Monitor
1. Payment initialization success rate
2. Payment verification success rate
3. Wallet update success rate
4. Average response times
5. Error rates by type
6. Chapa API availability

### Logs to Check
```bash
# Backend logs
tail -f server/logs/combined.log

# Error logs
tail -f server/logs/error.log

# Search for payment errors
grep -i "payment" server/logs/error.log
grep -i "chapa" server/logs/error.log
grep -i "wallet" server/logs/error.log
```

## Ready to Test! 🚀

All systems are in place. Start the backend and frontend, then follow the payment flow test above.
