# Chapa Payment Integration - Testing & Troubleshooting Guide

## Overview
This guide helps you test and debug the Chapa payment integration in the SimuAI platform.

## Prerequisites
- PostgreSQL running at `localhost:5432`
- Server running at `http://localhost:5000`
- Client running at `http://localhost:3000`
- Valid Chapa test credentials in `.env`

## Current Configuration

### Environment Variables (server/.env)
```
CHAPA_SECRET_KEY=CHASECK_TEST-YpDEoSk7pikyWErZn6q4enzQuJ6CD7Wo
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-8eXf0uVQ0Cppi22Q9dFrvBDB5K2dTShv
CHAPA_WEBHOOK_SECRET=simuai_secret_key_2026_x
CLIENT_URL=http://localhost:3000
```

## Payment Flow

### 1. Initialize Payment (Frontend → Backend)
**Endpoint**: `POST /api/payments/initialize`

**Request Body**:
```json
{
  "amount": 999,
  "type": "subscription",
  "description": "Basic Plan - Monthly Subscription"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "transactionRef": "TX-1234567890-abc123",
    "checkoutUrl": "https://checkout.chapa.co/...",
    "amount": 999
  }
}
```

**What Happens**:
1. Backend creates a Payment record with status `PENDING`
2. Generates unique `transactionId` (TX-timestamp-random)
3. Calls Chapa API to initialize transaction
4. Returns checkout URL for redirect

### 2. User Completes Payment (Chapa)
- User is redirected to Chapa checkout page
- User selects payment method (bank, mobile money, card)
- User completes payment
- Chapa redirects back to `CLIENT_URL/payment/success`

### 3. Verify Payment (Frontend → Backend)
**Endpoint**: `GET /api/payments/verify/:tx_ref`

**Example**: `GET /api/payments/verify/TX-1234567890-abc123`

**Expected Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentId": "uuid",
    "status": "COMPLETED"
  }
}
```

**What Happens**:
1. Backend finds Payment by `transactionId`
2. Calls Chapa API to verify transaction
3. Updates Payment status to `COMPLETED` if successful
4. Returns verification result

### 4. Webhook Notification (Chapa → Backend)
**Endpoint**: `POST /api/payments/webhook`

**Webhook Payload**:
```json
{
  "tx_ref": "TX-1234567890-abc123",
  "event": "charge.completed",
  "status": "success"
}
```

**What Happens**:
1. Backend receives webhook from Chapa
2. Validates webhook signature (if configured)
3. Finds Payment by `transactionId`
4. Updates Payment status to `COMPLETED`

## Testing Steps

### Step 1: Start Services
```bash
# Terminal 1: Start PostgreSQL
start-postgres.bat

# Terminal 2: Start Server
cd server
npm start

# Terminal 3: Start Client
cd client
npm start
```

### Step 2: Test Payment Initialization
```bash
# Using curl or Postman
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 999,
    "type": "subscription",
    "description": "Basic Plan - Monthly Subscription"
  }'
```

**Expected Output**:
- Status: 200
- Response includes `checkoutUrl`
- Payment record created in database

### Step 3: Check Database
```bash
# Connect to PostgreSQL
psql -U postgres -d simuai_db

# Check payment record
SELECT id, "transactionId", status, amount, "paymentMethod" FROM "Payment" 
ORDER BY "createdAt" DESC LIMIT 1;
```

**Expected Output**:
```
                  id                  |      transactionId      | status  | amount | paymentMethod
--------------------------------------+------------------------+---------+--------+---------------
 550e8400-e29b-41d4-a716-446655440000 | TX-1234567890-abc123    | PENDING |    999 | chapa
```

### Step 4: Test Payment Verification
```bash
curl -X GET http://localhost:5000/api/payments/verify/TX-1234567890-abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Output**:
- Status: 200
- Payment status updated to `COMPLETED` (if Chapa confirms success)

### Step 5: Check Logs
```bash
# Server logs
tail -f server/logs/combined.log

# Look for:
# - "Initializing Chapa payment"
# - "Chapa initialization successful"
# - "Chapa verification successful"
```

## Common Issues & Solutions

### Issue 1: "Chapa secret key is not configured"
**Cause**: `CHAPA_SECRET_KEY` not set in `.env`

**Solution**:
1. Check `server/.env` has `CHAPA_SECRET_KEY`
2. Restart server after updating `.env`
3. Verify: `echo $CHAPA_SECRET_KEY` in terminal

### Issue 2: "Payment initialization failed: 401"
**Cause**: Invalid or expired Chapa credentials

**Solution**:
1. Verify credentials in `server/.env`
2. Check Chapa dashboard for valid test keys
3. Ensure using TEST keys (not LIVE)
4. Check key format: `CHASECK_TEST-...`

### Issue 3: "Payment not found" during verification
**Cause**: `transactionId` mismatch

**Solution**:
1. Verify `transactionId` format: `TX-timestamp-random`
2. Check database for Payment record
3. Ensure using same `tx_ref` for verification
4. Check logs for initialization errors

### Issue 4: Webhook not updating payment
**Cause**: Field name mismatch or webhook not triggered

**Solution**:
1. Verify webhook uses `transactionId` (not `transactionRef`)
2. Check webhook signature validation
3. Ensure Chapa webhook URL is configured
4. Check server logs for webhook errors

### Issue 5: "Invalid amount" error
**Cause**: Amount validation failed

**Solution**:
1. Ensure amount > 0
2. Amount should be in ETB (Ethiopian Birr)
3. Check for negative or zero values
4. Verify amount is a number (not string)

## Database Schema

### Payment Table
```sql
CREATE TABLE "Payment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ETB',
  "paymentMethod" VARCHAR(50) DEFAULT 'chapa',
  status VARCHAR(50) DEFAULT 'PENDING',
  "transactionId" VARCHAR(255) UNIQUE,
  "chapaReference" VARCHAR(255),
  description TEXT,
  metadata JSONB,
  "paidAt" TIMESTAMP,
  "refundedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/payments/initialize` | Yes | Start payment process |
| GET | `/payments/verify/:tx_ref` | Yes | Verify payment status |
| POST | `/payments/webhook` | No | Chapa webhook callback |
| GET | `/payments/history` | Yes | Get user's payment history |
| GET | `/payments/subscription` | Yes | Get subscription status |
| POST | `/payments/subscription/cancel` | Yes | Cancel subscription |
| GET | `/payments/all` | Admin | Get all payments |
| POST | `/payments/:id/refund` | Admin | Refund payment |

## Debugging Checklist

- [ ] PostgreSQL is running
- [ ] Server is running (port 5000)
- [ ] Client is running (port 3000)
- [ ] `.env` has valid Chapa credentials
- [ ] User is authenticated (has valid token)
- [ ] Payment amount > 0
- [ ] Database has Payment table
- [ ] Logs show "Chapa initialization successful"
- [ ] Chapa returns valid checkout URL
- [ ] Payment record created in database
- [ ] Status is uppercase (PENDING, COMPLETED, FAILED)
- [ ] transactionId format is correct (TX-...)

## Next Steps

1. **Test Payment Flow**: Follow steps 1-5 above
2. **Monitor Logs**: Watch server logs during payment
3. **Check Database**: Verify Payment records are created
4. **Test Webhook**: Configure Chapa webhook to your server
5. **Test Verification**: Verify payment after completion
6. **Test Subscription**: Test subscription management features

## Support

For issues:
1. Check logs: `server/logs/combined.log`
2. Verify database: `psql -U postgres -d simuai_db`
3. Test endpoints with curl/Postman
4. Check Chapa dashboard for transaction status
5. Review error messages in response body
