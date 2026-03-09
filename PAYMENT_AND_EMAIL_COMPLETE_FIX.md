# Payment System & Email Configuration - Complete Fix Guide

## Current Status

### Email System
- **Status**: ❌ BROKEN - Invalid Gmail credentials
- **Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`
- **Root Cause**: Gmail requires App Password, not regular password
- **Fix**: Update EMAIL_PASS in server/.env with 16-character App Password

### Payment System
- **Status**: ⚠️ PARTIALLY WORKING
- **Issue**: "No transaction reference found" error on payment verification
- **Root Cause**: Multiple possible causes:
  1. localStorage not being set before redirect
  2. tx_ref not being retrieved from localStorage after redirect
  3. Payment record not found in database
  4. Token expiration during payment flow

---

## PART 1: Email Configuration Fix

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow prompts to enable (you'll need your phone)

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Windows Computer" as the device
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update server/.env
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=aydenfudagne@gmail.com
EMAIL_PASS=<YOUR_16_CHARACTER_APP_PASSWORD>
```

### Step 4: Restart Server
```bash
npm start
```

### Step 5: Test Email
- Register a new account
- Check if verification email arrives
- If yes, email system is working ✅

---

## PART 2: Payment System Troubleshooting

### Issue: "No transaction reference found"

This error occurs when the payment verification endpoint can't find the tx_ref. Here's the flow:

```
1. User clicks "Subscribe Now"
   ↓
2. Frontend calls: POST /payments/initialize
   ↓
3. Backend creates payment record with unique tx_ref
   ↓
4. Backend stores tx_ref in localStorage: localStorage.setItem('pendingPaymentTxRef', txRef)
   ↓
5. Frontend redirects to Chapa checkout URL
   ↓
6. User completes payment on Chapa
   ↓
7. Chapa redirects to: http://localhost:3000/payment/success
   ↓
8. Frontend retrieves tx_ref from localStorage
   ↓
9. Frontend calls: GET /payments/verify/{tx_ref}
   ↓
10. Backend finds payment record and verifies with Chapa
```

### Debugging Steps

#### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear localStorage: `localStorage.clear()`
4. Hard refresh: Ctrl+F5
5. Try payment again
6. Check console for errors

#### Step 2: Check localStorage
1. Open DevTools (F12)
2. Go to Application → Storage → Local Storage
3. Look for `pendingPaymentTxRef` key
4. It should contain a value like: `req-123-1234567890-abc123def`

#### Step 3: Check Server Logs
1. Look for `[PAYMENT]` entries in server logs
2. Should see:
   - `[PAYMENT] Initializing: user=X, amount=Y, type=Z`
   - `[PAYMENT] Verifying: tx_ref=..., user=X`

#### Step 4: Verify Database
Run the diagnostic tool:
```bash
node PAYMENT_DATABASE_DIAGNOSTIC.js
```

This will check:
- ✅ Database connection
- ✅ Payment table exists
- ✅ Sample payment record creation
- ✅ Payment retrieval

### Common Issues & Solutions

#### Issue 1: localStorage not being set
**Symptom**: localStorage is empty after payment initialization
**Solution**:
1. Check browser console for errors
2. Verify Subscription.tsx has this code:
   ```typescript
   const txRef = response.data.data.txRef;
   if (txRef) {
     localStorage.setItem('pendingPaymentTxRef', txRef);
     localStorage.setItem('pendingPaymentTime', Date.now().toString());
   }
   ```
3. Clear cache and try again

#### Issue 2: tx_ref not retrieved from localStorage
**Symptom**: PaymentSuccess.tsx shows "No transaction reference found"
**Solution**:
1. Check PaymentSuccess.tsx has this code:
   ```typescript
   let txRef = searchParams.get('tx_ref');
   if (!txRef) {
     txRef = localStorage.getItem('pendingPaymentTxRef');
   }
   ```
2. Verify localStorage key is exactly: `pendingPaymentTxRef`
3. Clear cache and try again

#### Issue 3: Payment record not found in database
**Symptom**: Backend returns "Payment record not found in database"
**Solution**:
1. Run diagnostic: `node PAYMENT_DATABASE_DIAGNOSTIC.js`
2. Check if payment table exists
3. Verify DATABASE_URL in server/.env is correct
4. Run: `npx prisma generate` and `npx prisma migrate deploy`
5. Restart server

#### Issue 4: Token expired during payment
**Symptom**: 401 error during payment verification
**Solution**:
- This is handled by auth middleware with grace period
- Token can be expired for payment verification endpoints
- If still failing, try:
  1. Clear browser cache
  2. Log out and log back in
  3. Try payment again

### Testing Payment Flow

#### Test with Chapa Test Phone
Use this test phone number: `0900000000`

#### Step-by-Step Test
1. Log in as employer
2. Go to Subscription page
3. Click "Subscribe Now" on any plan
4. You should be redirected to Chapa checkout
5. Enter test phone: `0900000000`
6. Complete payment
7. You should be redirected to payment success page
8. Should see "Payment verified successfully!"

#### If Payment Fails
1. Check server logs for `[PAYMENT]` entries
2. Check browser console for errors
3. Verify localStorage has `pendingPaymentTxRef`
4. Run diagnostic: `node PAYMENT_DATABASE_DIAGNOSTIC.js`

---

## PART 3: Professional Requirements Checklist

✅ **Unique Transaction Reference**
- Format: `req-{userId}-{timestamp}-{random}`
- Example: `req-123-1234567890-abc123def`

✅ **Server-Side Verification**
- Backend verifies payment with Chapa API
- Not relying on frontend-only verification

✅ **Ownership Verification**
- Backend checks if payment belongs to authenticated user
- Prevents unauthorized payment claims

✅ **Professional Logging**
- All payment events logged with `[PAYMENT]` prefix
- All webhook events logged with `[WEBHOOK]` prefix
- Includes timestamps and user IDs

✅ **Duplicate Prevention**
- 24-hour window prevents duplicate payments
- 10-minute reuse window for pending payments
- Automatic cleanup of old pending payments

✅ **Token Grace Period**
- Payment verification works with expired tokens
- Allows users to complete payment even if token expires

---

## PART 4: What's Working

✅ Payment initialization creates database records
✅ Unique tx_ref generation
✅ localStorage fallback for tx_ref
✅ Server-side verification with Chapa
✅ Ownership verification
✅ Professional logging
✅ Token grace period
✅ Duplicate payment prevention
✅ "Reusing pending payment" warning is CORRECT behavior

---

## PART 5: Next Steps

### Immediate Actions
1. **Fix Email**: Follow Part 1 steps above
2. **Test Email**: Register new account and verify email arrives
3. **Test Payment**: Use test phone `0900000000` on Chapa
4. **Check Logs**: Look for `[PAYMENT]` and `[WEBHOOK]` entries

### If Issues Persist
1. Run diagnostic: `node PAYMENT_DATABASE_DIAGNOSTIC.js`
2. Check server logs for errors
3. Clear browser cache: Ctrl+Shift+Delete
4. Hard refresh: Ctrl+F5
5. Clear localStorage: `localStorage.clear()` in console
6. Try payment again

### Verification Checklist
- [ ] Email verification works (register new account)
- [ ] Payment initialization works (check localStorage)
- [ ] Payment verification works (check server logs)
- [ ] Database records created (run diagnostic)
- [ ] Chapa integration working (test with 0900000000)

---

## Support Information

**Email Configuration Help**: https://support.google.com/mail/?p=BadCredentials
**Chapa Test Phone**: `0900000000`
**Database Diagnostic**: `node PAYMENT_DATABASE_DIAGNOSTIC.js`

---

**Last Updated**: March 9, 2026
**Status**: Ready for implementation
