# Payment Flow Testing Guide ✅

## Overview
This guide helps you test the complete payment flow with session expiration and duplicate payment prevention fixes.

---

## Prerequisites

### 1. Environment Setup
Ensure these are in `server/.env`:
```
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 2. Test Credentials
- **Phone**: `0900000000` (Chapa test number)
- **Amount**: Any amount (e.g., 100 ETB)
- **Test Card**: Use Chapa's test card in their sandbox

### 3. Server Running
```bash
cd server
npm start
```

---

## Test Scenarios

### Test 1: Basic Payment Flow (No Session Expiration)

**Objective**: Verify payment works normally without token expiration

**Steps**:
1. Login to get fresh token
2. Click "Subscribe Now" or initiate payment
3. Complete payment on Chapa (use test credentials)
4. Verify payment completes successfully

**Expected Result**:
- ✅ Payment initialized successfully
- ✅ Chapa checkout URL returned
- ✅ Payment verified after completion
- ✅ Payment status: COMPLETED
- ✅ Database shows payment record

**API Calls**:
```bash
# 1. Initialize Payment
POST /api/payments/initialize
Headers: Authorization: Bearer {token}
Body: {
  "amount": 100,
  "type": "subscription",
  "description": "Premium Subscription"
}

# 2. Verify Payment (after Chapa redirect)
GET /api/payments/verify/{tx_ref}
Headers: Authorization: Bearer {token}
```

---

### Test 2: Session Expiration During Payment

**Objective**: Verify payment verification works with expired token

**Steps**:
1. Login to get token
2. Initiate payment (token valid)
3. Wait for token to expire (or manually expire it)
4. Complete payment on Chapa
5. Call verify endpoint with expired token

**Expected Result**:
- ✅ Payment initialized successfully
- ✅ Verify endpoint accepts expired token (grace period)
- ✅ Payment verified successfully
- ✅ Payment status: COMPLETED

**How to Test**:
```bash
# 1. Get token (valid for 7 days)
POST /api/auth/login
Response: { "token": "eyJhbGc..." }

# 2. Initialize payment (token valid)
POST /api/payments/initialize
Headers: Authorization: Bearer {valid_token}
Response: { "checkoutUrl": "https://chapa.co/..." }

# 3. Wait for token to expire OR manually create expired token
# For testing, you can:
# - Wait 7 days (not practical)
# - Modify JWT_EXPIRES_IN to 1 second, login, wait 2 seconds
# - Manually create expired token using jwt.sign with past expiration

# 4. Complete payment on Chapa

# 5. Verify with expired token
GET /api/payments/verify/{tx_ref}
Headers: Authorization: Bearer {expired_token}
Response: { "success": true, "status": "COMPLETED" }
```

**Server Logs**:
```
Using expired token for payment verification: /api/payments/verify/TX-...
Payment verified and completed: payment_id
```

---

### Test 3: Duplicate Payment Prevention

**Objective**: Verify duplicate payments are prevented

**Steps**:
1. Login to get token
2. Click "Subscribe Now" (first time)
3. Close browser before completing payment
4. Click "Subscribe Now" again (second time)
5. Verify same payment is reused

**Expected Result**:
- ✅ First payment created with status PENDING
- ✅ Second attempt returns existing pending payment
- ✅ No duplicate payment created
- ✅ Response includes message: "Using existing pending payment"

**API Response**:
```json
{
  "success": true,
  "data": {
    "paymentId": "same_id_as_first",
    "transactionRef": "TX-...",
    "checkoutUrl": "https://chapa.co/...",
    "amount": 100,
    "message": "Using existing pending payment"
  }
}
```

**Server Logs**:
```
Pending payment already exists: payment_id
```

---

### Test 4: Recent Payment Block (24-Hour Window)

**Objective**: Verify payments are blocked within 24 hours

**Steps**:
1. Complete payment successfully
2. Try to pay again immediately
3. Try to pay again after 24 hours

**Expected Result**:
- ✅ First payment: COMPLETED
- ✅ Immediate retry: Error message
- ✅ After 24 hours: Payment allowed

**Error Response** (immediate retry):
```json
{
  "success": false,
  "message": "Payment already completed. Please wait 24 hours before making another payment for this plan."
}
```

**Server Logs**:
```
Payment already completed recently: payment_id
```

---

### Test 5: Webhook Processing

**Objective**: Verify Chapa webhook updates payment status

**Steps**:
1. Initiate payment
2. Complete payment on Chapa
3. Chapa sends webhook to `/api/payments/webhook`
4. Verify payment status updated to COMPLETED

**Expected Result**:
- ✅ Webhook received without authentication
- ✅ Payment status updated to COMPLETED
- ✅ paidAt timestamp set
- ✅ Webhook response: `{ "success": true }`

**Webhook Payload** (from Chapa):
```json
{
  "tx_ref": "TX-...",
  "event": "charge.completed",
  "status": "success"
}
```

**Server Logs**:
```
Chapa webhook received: tx_ref=TX-..., event=charge.completed, status=success
Payment completed via webhook: payment_id
```

---

## Manual Testing with cURL

### 1. Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "subscription",
    "description": "Premium Subscription"
  }'
```

### 2. Verify Payment
```bash
curl -X GET http://localhost:5000/api/payments/verify/TX-1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Payment History
```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Subscription Status
```bash
curl -X GET http://localhost:5000/api/payments/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Test Webhook (without auth)
```bash
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "tx_ref": "TX-1234567890",
    "event": "charge.completed",
    "status": "success"
  }'
```

---

## Database Verification

### Check Payment Records
```sql
-- View all payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC;

-- View pending payments
SELECT * FROM "Payment" WHERE status = 'PENDING';

-- View completed payments
SELECT * FROM "Payment" WHERE status = 'COMPLETED';

-- View payments for specific user
SELECT * FROM "Payment" WHERE "userId" = 1 ORDER BY "createdAt" DESC;

-- Check for duplicates
SELECT "userId", amount, status, COUNT(*) as count 
FROM "Payment" 
GROUP BY "userId", amount, status 
HAVING COUNT(*) > 1;
```

---

## Troubleshooting

### Issue: "Session expired" error on verify
**Solution**:
1. Check auth middleware has grace period for `/payments/verify`
2. Verify JWT_SECRET matches in .env
3. Check server logs for token verification errors
4. Restart server after .env changes

### Issue: Duplicate payments still created
**Solution**:
1. Check payment controller has duplicate detection logic
2. Verify database queries work (test in Prisma Studio)
3. Check metadata field is properly set
4. Review server logs for duplicate detection

### Issue: Webhook not updating payment
**Solution**:
1. Verify webhook route has NO authentication
2. Check webhook signature validation (if enabled)
3. Verify tx_ref matches in database
4. Check server logs for webhook errors

### Issue: 24-hour block not working
**Solution**:
1. Check server time is correct
2. Verify paidAt timestamp is set correctly
3. Check 24-hour calculation in code
4. Review database timestamps

---

## Success Indicators

✅ All tests pass when:
- Payment initializes successfully
- Chapa checkout URL returned
- Payment verifies with expired token
- Duplicate payments prevented
- Recent payments blocked for 24 hours
- Webhook updates payment status
- No errors in server logs
- Database records created correctly

---

## Performance Metrics

**Expected Response Times**:
- Initialize payment: < 2 seconds
- Verify payment: < 1 second
- Webhook processing: < 500ms
- Duplicate check: < 100ms

---

## Security Checklist

- ✅ Webhook route has NO authentication
- ✅ Webhook signature validation enabled
- ✅ JWT secret configured
- ✅ Chapa secret key configured
- ✅ HTTPS used in production
- ✅ Payment data encrypted in database
- ✅ Sensitive data not logged

---

## Next Steps

1. **Run all tests** to verify payment flow
2. **Monitor logs** for any errors
3. **Test with real Chapa account** (not sandbox)
4. **Load test** with multiple concurrent payments
5. **Monitor database** for data integrity

---

## Support

If issues occur:
1. Check server logs: `server/logs/error.log`
2. Check combined logs: `server/logs/combined.log`
3. Verify database connection
4. Verify Chapa API credentials
5. Check network connectivity

