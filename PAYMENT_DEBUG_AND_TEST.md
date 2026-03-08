# Payment Debug & Test Guide 🔧

## Quick Start

### 1. Access Test Payment Page
```
http://localhost:3000/test-payment
```

### 2. Test Credentials
- **Phone**: `0900000000`
- **Amount**: `100` ETB
- **Payment Type**: `subscription`

### 3. Step-by-Step Test

**Step 1: Initialize Payment**
- Click "Initialize Payment"
- Check console for response
- Should see: `paymentId`, `transactionRef`, `checkoutUrl`

**Step 2: Open Chapa Checkout**
- Click "Open Chapa Checkout"
- New window opens with Chapa payment page
- Use test phone: `0900000000`

**Step 3: Complete Payment**
- Enter phone number: `0900000000`
- Complete payment on Chapa
- Chapa redirects back

**Step 4: Verify Payment**
- Click "Verify Payment"
- Should see status: `COMPLETED`

---

## Common Issues & Fixes

### Issue 1: "Session Expired" Error

**Symptoms**:
- Error appears when verifying payment
- Token expired during payment process

**Root Cause**:
- JWT token expires (default 7 days)
- Payment verification endpoint rejects expired token

**Fix Applied**:
- ✅ Modified `server/middleware/auth.js`
- ✅ Added grace period for `/payments/verify` endpoint
- ✅ Allows expired tokens for payment operations

**How to Test**:
1. Initialize payment (token valid)
2. Wait for token to expire (or manually expire)
3. Complete payment on Chapa
4. Verify payment with expired token
5. Should work now with grace period

**Verification**:
- Check server logs: `Using expired token for payment verification`
- Payment should verify successfully

---

### Issue 2: "Payment Already Paid" Error

**Symptoms**:
- Error appears when trying to pay again
- Duplicate payment attempts blocked

**Root Cause**:
- User tries to pay twice for same subscription
- No check for existing pending/completed payments

**Fix Applied**:
- ✅ Modified `server/controllers/paymentController.js`
- ✅ Added duplicate detection logic
- ✅ Checks for pending payments (same user, amount, type)
- ✅ Checks for completed payments in last 24 hours
- ✅ Reuses existing pending payment if found

**How to Test**:
1. Initialize payment (creates PENDING payment)
2. Close browser without completing
3. Initialize payment again
4. Should return existing payment (not create new one)
5. Complete payment with same transaction

**Verification**:
- Check server logs: `Pending payment already exists`
- Database shows only 1 payment record
- Both attempts use same `transactionId`

---

### Issue 3: Webhook Not Accessible

**Symptoms**:
- Chapa webhook fails to update payment
- Payment status stays PENDING after completion

**Root Cause**:
- Webhook route protected by authentication
- Chapa can't send webhook without token

**Fix Applied**:
- ✅ Modified `server/routes/payments.js`
- ✅ Moved webhook route BEFORE authentication middleware
- ✅ Webhook now accessible without token

**How to Test**:
1. Complete payment on Chapa
2. Check server logs for webhook
3. Should see: `Chapa webhook received`
4. Payment status should update to COMPLETED

**Verification**:
- Check database: Payment status = COMPLETED
- Check server logs: `Payment completed via webhook`

---

## Debugging Steps

### 1. Check Server Logs

```bash
# Terminal 1: Watch error logs
tail -f server/logs/error.log

# Terminal 2: Watch combined logs
tail -f server/logs/combined.log
```

**Look for**:
- `Initializing payment`
- `Using expired token for payment verification`
- `Pending payment already exists`
- `Chapa webhook received`
- `Payment verified and completed`

### 2. Check Browser Console

Open DevTools (F12) and check:
- Network tab: API requests/responses
- Console tab: JavaScript errors
- Application tab: Token in localStorage

### 3. Check Database

```sql
-- View all payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 10;

-- View pending payments
SELECT * FROM "Payment" WHERE status = 'PENDING';

-- View completed payments
SELECT * FROM "Payment" WHERE status = 'COMPLETED';

-- Check for duplicates
SELECT "userId", amount, COUNT(*) as count 
FROM "Payment" 
GROUP BY "userId", amount 
HAVING COUNT(*) > 1;
```

### 4. Check Environment Variables

```bash
# server/.env
CHAPA_SECRET_KEY=CHASECK_TEST-...
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-...
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

## Test Scenarios

### Scenario 1: Normal Payment Flow ✅

**Steps**:
1. Login with fresh token
2. Go to `/test-payment`
3. Click "Initialize Payment"
4. Click "Open Chapa Checkout"
5. Complete payment with `0900000000`
6. Click "Verify Payment"

**Expected**:
- ✅ Payment initialized
- ✅ Checkout URL returned
- ✅ Payment verified
- ✅ Status: COMPLETED

**Logs**:
```
Initializing payment: amount=100, type=subscription
Payment record created: payment_id
Chapa response received: checkout_url
Payment verified and completed: payment_id
```

---

### Scenario 2: Session Expiration ✅

**Steps**:
1. Initialize payment (token valid)
2. Wait for token to expire (or manually expire)
3. Complete payment on Chapa
4. Verify payment with expired token

**Expected**:
- ✅ Payment initialized
- ✅ Verify works with expired token
- ✅ Status: COMPLETED

**Logs**:
```
Initializing payment: amount=100, type=subscription
Using expired token for payment verification: /api/payments/verify/TX-...
Payment verified and completed: payment_id
```

---

### Scenario 3: Duplicate Prevention ✅

**Steps**:
1. Initialize payment (creates PENDING)
2. Close browser
3. Initialize payment again (same amount, type)
4. Should return existing payment

**Expected**:
- ✅ First payment created
- ✅ Second attempt returns existing payment
- ✅ No duplicate created
- ✅ Message: "Using existing pending payment"

**Logs**:
```
Initializing payment: amount=100, type=subscription
Payment record created: payment_id
Initializing payment: amount=100, type=subscription
Pending payment already exists: payment_id
```

---

### Scenario 4: 24-Hour Block ✅

**Steps**:
1. Complete payment (status: COMPLETED)
2. Try to pay again immediately
3. Should get error: "Wait 24 hours"
4. Try to pay after 24 hours
5. Should be allowed

**Expected**:
- ✅ First payment: COMPLETED
- ✅ Immediate retry: Error
- ✅ After 24 hours: Allowed

**Logs**:
```
Payment verified and completed: payment_id
Initializing payment: amount=100, type=subscription
Payment already completed recently: payment_id
```

---

## API Endpoints

### Initialize Payment
```bash
POST /api/payments/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100,
  "type": "subscription",
  "description": "Test payment"
}

Response:
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "transactionRef": "TX-...",
    "checkoutUrl": "https://chapa.co/...",
    "amount": 100
  }
}
```

### Verify Payment
```bash
GET /api/payments/verify/{tx_ref}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentId": "uuid",
    "status": "COMPLETED"
  }
}
```

### Webhook
```bash
POST /api/payments/webhook
Content-Type: application/json
(No authentication required)

{
  "tx_ref": "TX-...",
  "event": "charge.completed",
  "status": "success"
}

Response:
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## Troubleshooting Checklist

- [ ] Server running: `npm start` in server folder
- [ ] Client running: `npm start` in client folder
- [ ] Database connected: Check `server/logs/combined.log`
- [ ] Chapa credentials configured: Check `server/.env`
- [ ] JWT secret configured: Check `server/.env`
- [ ] Token not expired: Login fresh
- [ ] No pending payments: Check database
- [ ] Webhook accessible: Check routes

---

## Performance Metrics

**Expected Response Times**:
- Initialize payment: < 2 seconds
- Verify payment: < 1 second
- Webhook processing: < 500ms
- Duplicate check: < 100ms

**If Slower**:
- Check database connection
- Check Chapa API response time
- Check network latency
- Check server CPU/memory

---

## Security Checklist

- ✅ Webhook has NO authentication
- ✅ Webhook signature validation enabled
- ✅ JWT secret configured
- ✅ Chapa secret key configured
- ✅ Payment data encrypted
- ✅ Sensitive data not logged
- ✅ HTTPS in production

---

## Next Steps

1. **Test Payment Flow**
   - Go to `/test-payment`
   - Follow step-by-step test
   - Monitor logs

2. **Test All Scenarios**
   - Normal flow
   - Session expiration
   - Duplicate prevention
   - 24-hour block

3. **Monitor Production**
   - Watch for errors
   - Monitor duplicate attempts
   - Check webhook processing

4. **Gather Feedback**
   - User experience
   - Any issues
   - Performance

---

## Support

**If Issues Occur**:
1. Check server logs: `server/logs/error.log`
2. Check browser console: F12 → Console
3. Check database: Query payments table
4. Check environment: Verify .env variables
5. Restart server: `npm start`

**Common Fixes**:
- Restart server after .env changes
- Clear browser cache: Ctrl+Shift+Delete
- Check token expiration: Login fresh
- Check database connection: Verify DATABASE_URL

