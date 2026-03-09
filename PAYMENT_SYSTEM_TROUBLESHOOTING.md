# Payment System Troubleshooting Guide

## Overview

Your payment system has been professionally implemented with:
- ✅ Server-side verification with Chapa
- ✅ Unique transaction references
- ✅ Ownership verification
- ✅ Session expiration handling (grace period for payment endpoints)
- ✅ Duplicate payment prevention (24-hour window)
- ✅ Professional logging

---

## Error 1: PaymentDebug is not defined

### Root Cause
This is a **webpack hot module reload cache issue**, not an actual code problem.

### Solution

**Step 1: Stop the client server**
```bash
# In the client terminal, press Ctrl+C
```

**Step 2: Clear the webpack cache**
```bash
cd client
rmdir /s /q node_modules\.cache
```

**Step 3: Restart the client**
```bash
npm start
```

**Step 4: Clear browser cache**
- Press `Ctrl+Shift+Delete`
- Select "All time"
- Check:
  - ☑ Cookies and other site data
  - ☑ Cached images and files
- Click "Clear data"

**Step 5: Hard refresh the page**
- Press `Ctrl+F5` (or `Cmd+Shift+R` on Mac)

---

## Error 2: Unable to connect to the database

### Root Cause
PostgreSQL service is not running on port 5432.

### Solution

#### Windows

**Option 1: Using Services GUI**
1. Press `Win+R`
2. Type: `services.msc`
3. Find "postgresql-x64-15" (or similar version)
4. Right-click → "Start"
5. Wait for status to show "Running"

**Option 2: Using Command Line (Admin)**
```bash
# Open Command Prompt as Administrator
net start postgresql-x64-15
```

**Option 3: Using PowerShell (Admin)**
```powershell
Start-Service -Name postgresql-x64-15
```

#### Mac
```bash
brew services start postgresql
```

#### Linux
```bash
sudo systemctl start postgresql
```

### Verify PostgreSQL is Running

```bash
# Test connection
psql -U postgres -d simuai_db -c "SELECT 1"

# Should output:
# ?column?
# ----------
#        1
```

---

## Error 3: Session expired / Payment already paid

### Root Cause
This was caused by JWT token expiration during the payment process and lack of duplicate payment checks.

### Solution Status: ✅ ALREADY FIXED

**What was implemented**:

1. **Token Grace Period** (`server/middleware/auth.js`)
   - Expired tokens are accepted for payment verification endpoints
   - Only applies to `/payments/verify` and `/payments/webhook`
   - Other endpoints still require valid tokens

2. **Duplicate Payment Prevention** (`server/controllers/paymentController.js`)
   - Checks for existing pending payments
   - Blocks duplicate payments within 24-hour window
   - Reuses existing pending payment if found

3. **Professional Transaction References**
   - Format: `req-${userId}-${Date.now()}-${random}`
   - Ensures uniqueness and traceability

### How It Works

**Payment Flow**:
```
1. User clicks "Subscribe Now"
   ↓
2. Frontend calls POST /payments/initialize
   ↓
3. Backend checks for existing pending payment
   ↓
4. If found, reuses it; if not, creates new payment
   ↓
5. Backend calls Chapa API (server-side, with SECRET_KEY)
   ↓
6. Returns checkout URL to frontend
   ↓
7. User redirected to Chapa checkout page
   ↓
8. User completes payment on Chapa
   ↓
9. Chapa redirects to /payment/success?tx_ref=XXX&status=success
   ↓
10. Frontend calls GET /payments/verify/{tx_ref}
    (Token can be expired - grace period applies)
   ↓
11. Backend verifies payment with Chapa directly
   ↓
12. If verified, updates payment status to COMPLETED
   ↓
13. Frontend shows success message
```

---

## Testing the Payment System

### Prerequisites
- PostgreSQL running
- Server running: `npm start` (in server folder)
- Client running: `npm start` (in client folder)

### Test Steps

1. **Login as Employer**
   - Email: `employer@example.com`
   - Password: `password123`

2. **Navigate to Subscription**
   - Click "Employer Dashboard"
   - Click "Subscription & Credits"

3. **Start Payment**
   - Click "Subscribe Now" on any plan
   - You'll be redirected to Chapa checkout

4. **Use Test Credentials**
   - Phone: `0900000000`
   - Amount: Any amount (e.g., 999 ETB)
   - Complete the payment

5. **Verify Payment**
   - You'll be redirected to `/payment/success`
   - Backend verifies with Chapa
   - Success page shows confirmation

### Expected Behavior

**Success Case**:
```
✅ Payment initialized
✅ Unique tx_ref generated
✅ Redirected to Chapa checkout
✅ Payment completed on Chapa
✅ Redirected to /payment/success
✅ Backend verifies with Chapa
✅ Payment status updated to COMPLETED
✅ Success message displayed
```

**Duplicate Payment Case**:
```
❌ User tries to pay again within 24 hours
✅ Backend detects existing payment
✅ Returns error: "Payment already completed. Please wait 24 hours..."
```

**Session Expired Case**:
```
⏱️ User takes long time to complete payment
✅ JWT token expires during payment
✅ Grace period allows verification endpoint to work
✅ Backend verifies payment with Chapa
✅ Payment status updated successfully
```

---

## Monitoring Payment Issues

### Check Server Logs

```bash
# View error logs
tail -f server/logs/error.log

# View combined logs
tail -f server/logs/combined.log
```

### Look for These Log Entries

**Successful Payment**:
```
[PAYMENT] Initializing: user=1, amount=999, type=subscription
[PAYMENT] Record created: 1, tx_ref=req-1-1709977200000-abc123
[PAYMENT] Chapa initialized: https://checkout.chapa.co/...
[PAYMENT] Verifying: tx_ref=req-1-1709977200000-abc123, user=1
[PAYMENT] Calling Chapa verify API for: req-1-1709977200000-abc123
[PAYMENT] Payment verified: 1
```

**Duplicate Payment**:
```
[PAYMENT] Reusing pending payment: 1
```

**Session Expired (But Still Works)**:
```
[PAYMENT] Verifying: tx_ref=req-1-1709977200000-abc123, user=1
[PAYMENT] Calling Chapa verify API for: req-1-1709977200000-abc123
[PAYMENT] Payment verified: 1
```

---

## Common Issues & Solutions

### Issue: "Payment not found"
**Cause**: tx_ref doesn't match any payment in database
**Solution**: 
- Check that payment was created successfully
- Verify tx_ref in URL matches database
- Check server logs for initialization errors

### Issue: "Unauthorized" on payment verification
**Cause**: User trying to verify someone else's payment
**Solution**:
- Ensure you're logged in with correct account
- Check that tx_ref belongs to your payment
- Don't share payment links with other users

### Issue: "Payment verification failed"
**Cause**: Chapa verification returned failure status
**Solution**:
- Check Chapa dashboard for payment status
- Verify payment was actually completed on Chapa
- Check server logs for Chapa API errors

### Issue: "Reusing pending payment" message
**Cause**: Previous payment is still pending
**Solution**:
- Complete the pending payment
- Or wait for it to expire (24 hours)
- Check Chapa dashboard for payment status

---

## Quick Start Checklist

- [ ] PostgreSQL is running
- [ ] Database `simuai_db` exists
- [ ] Server is running on port 5000
- [ ] Client is running on port 3000
- [ ] Client cache cleared
- [ ] Browser cache cleared
- [ ] Hard refresh (Ctrl+F5)
- [ ] Logged in as employer
- [ ] Ready to test payment

---

## Environment Variables

Ensure these are set in `server/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/simuai_db

# JWT
JWT_SECRET=your_jwt_secret_key

# Chapa
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_WEBHOOK_SECRET=your_webhook_secret

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Port
PORT=5000
```

---

## Support

If issues persist:

1. **Check all logs**:
   - `server/logs/error.log`
   - `server/logs/combined.log`
   - Browser console (F12)

2. **Verify database**:
   ```bash
   psql -U postgres -d simuai_db
   SELECT * FROM "Payment" LIMIT 5;
   ```

3. **Test Chapa connection**:
   - Check CHAPA_SECRET_KEY in `.env`
   - Verify Chapa account is active
   - Check Chapa dashboard for test transactions

4. **Restart everything**:
   - Stop server (Ctrl+C)
   - Stop client (Ctrl+C)
   - Restart PostgreSQL
   - Start server
   - Start client

