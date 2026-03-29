# Quick Test Guide - Interview Payment System

## 🚀 Start Testing in 5 Minutes

### Prerequisites
- PostgreSQL running
- Server: `npm run dev` (from `server/`)
- Client: `npm start` (from `client/`)
- Mock mode enabled in `.env`

---

## Test Scenario 1: Payment Flow with Insufficient Credits

### Step 1: Login
```
Navigate to: http://localhost:3000/login
Email: test@example.com
Password: Test@123
```

### Step 2: Go to Interviews
```
Click: "My Interviews" in sidebar
Or navigate to: http://localhost:3000/candidate/interviews
```

### Step 3: Start Interview
```
Click: "Start AI Interview" button on any interview
Expected: Redirected to Dashboard
```

### Step 4: Payment Modal Appears
```
Expected to see:
- "Start Your Interview" modal
- Cost: 5 ETB
- Your Balance: 0 Credits (or less than 1)
- Button: "Pay & Start Interview"
```

### Step 5: Initiate Payment
```
Click: "Pay & Start Interview"
Expected: 
- Loading state appears
- Redirected to mock Chapa checkout URL
- URL format: https://checkout.chapa.co/checkout/payment/tx_XXXXX
```

### Step 6: Verify Payment
```
Expected:
- Redirected to /payment/success
- Shows "Payment Confirmed!" message
- Shows transaction details
- Countdown: "Redirecting in 5s"
- Auto-redirects to interview session
```

### Step 7: Interview Starts
```
Expected:
- Interview session page loads
- Questions displayed
- Wallet balance updated (1 credit deducted)
```

---

## Test Scenario 2: Payment Flow with Sufficient Credits

### Step 1-2: Same as above

### Step 3: Start Interview
```
Click: "Start AI Interview"
Expected: Redirected to Dashboard
```

### Step 4: Payment Modal with Sufficient Credits
```
Expected to see:
- "Start Your Interview" modal
- Cost: 5 ETB
- Your Balance: 1+ Credits
- Button: "Start Interview Now" (green)
- Alternative: "Pay & Start Interview" (if balance < 1)
```

### Step 5: Start Without Payment
```
Click: "Start Interview Now"
Expected:
- Modal closes
- Redirected to interview session
- Interview starts immediately
- No payment required
```

---

## Test Scenario 3: View Billing History

### Step 1: Go to Dashboard
```
Navigate to: http://localhost:3000/candidate/dashboard
```

### Step 2: Scroll to Billing Section
```
Expected to see:
- "Billing & History" section
- Current Balance card
- Total Spent card
- Successful Transactions card
- Average Value card
```

### Step 3: View Recent Transactions
```
Expected to see:
- List of recent transactions
- Each transaction shows:
  - Credit amount
  - Date/time
  - Status (COMPLETED, FAILED, PENDING)
  - Payment method
  - Amount in ETB
```

### Step 4: Filter Transactions
```
Click: "Filter" button
Select: "Completed" or "Failed"
Expected: List updates to show only selected status
```

### Step 5: Export History
```
Click: "Export CSV" button
Expected:
- CSV file downloads
- Filename: billing_history_YYYY-MM-DD.csv
- Contains all transaction data
```

---

## Test Scenario 4: Wallet Balance Updates

### Step 1: Check Initial Balance
```
Go to Dashboard
Note: Current Balance in Billing section
```

### Step 2: Complete Payment
```
Follow Test Scenario 1 steps 1-6
```

### Step 3: Verify Balance Updated
```
Expected:
- Balance increased by 1 credit
- New balance = Old balance + 1
- Transaction appears in history
```

### Step 4: Start Interview
```
Click "Start Interview Now"
Expected:
- Interview starts
- Balance decreases by 1 credit
- New balance = Previous balance - 1
```

---

## Test Scenario 5: Error Handling

### Test 5A: Cancel Payment
```
Step 1: Click "Pay & Start Interview"
Step 2: Click "Cancel" button in modal
Expected:
- Modal closes
- Redirected to Dashboard
- No payment initiated
- Balance unchanged
```

### Test 5B: Invalid Interview ID
```
Step 1: Manually set localStorage:
  localStorage.setItem('pendingInterviewId', 'invalid-id')
Step 2: Navigate to Dashboard
Step 3: Click "Pay & Start Interview"
Step 4: Complete payment
Expected:
- Payment succeeds
- Error when redirecting to interview
- Graceful error message
```

### Test 5C: Network Error
```
Step 1: Open DevTools (F12)
Step 2: Go to Network tab
Step 3: Throttle to "Offline"
Step 4: Try to initialize payment
Expected:
- Error message appears
- "Failed to initialize payment"
- User can retry
```

---

## Verification Checklist

### Payment Flow
- [ ] Payment modal appears when starting interview
- [ ] Correct cost displayed (5 ETB)
- [ ] Current balance displayed correctly
- [ ] "Pay & Start Interview" button works
- [ ] Redirects to mock Chapa checkout
- [ ] Payment success page shows
- [ ] Auto-redirects to interview

### Wallet System
- [ ] Balance updates after payment
- [ ] Transaction appears in history
- [ ] Balance decreases when starting interview
- [ ] CSV export works
- [ ] Filter by status works

### Error Handling
- [ ] Cancel button works
- [ ] Network errors handled gracefully
- [ ] Invalid interview ID handled
- [ ] Insufficient credits message shown

### UI/UX
- [ ] Modal is responsive
- [ ] Loading states visible
- [ ] Success/error messages clear
- [ ] Countdown timer works
- [ ] All buttons clickable

---

## Expected API Calls

### Payment Initialization
```
POST /api/payments/initialize
Headers: Authorization: Bearer {token}
Body: {
  "amount": 5,
  "creditAmount": 1,
  "type": "interview",
  "description": "Payment for AI Interview Session"
}
Response: 200 OK with checkout_url
```

### Payment Verification
```
GET /api/payments/verify/{txRef}
Headers: Authorization: Bearer {token}
Response: 200 OK with payment status
```

### Wallet Balance
```
GET /api/wallet/balance
Headers: Authorization: Bearer {token}
Response: 200 OK with current balance
```

### Payment History
```
GET /api/payments/history?page=1&limit=5
Headers: Authorization: Bearer {token}
Response: 200 OK with transaction list
```

---

## Debugging Tips

### Check Browser Console
```
F12 → Console tab
Look for:
- API errors
- localStorage values
- Network errors
```

### Check Server Logs
```
Terminal where server is running
Look for:
- Payment initialization logs
- Chapa service logs
- Database errors
```

### Check Network Tab
```
F12 → Network tab
Monitor:
- /api/payments/initialize
- /api/payments/verify
- /api/wallet/balance
- /api/payments/history
```

### Check localStorage
```
F12 → Application → localStorage
Look for:
- pendingInterviewId
- showBillingSection
- pendingPaymentTxRef
```

---

## Common Issues & Solutions

### Issue: Payment modal not appearing
**Solution:**
1. Check localStorage for `pendingInterviewId`
2. Verify interview ID is valid
3. Check browser console for errors
4. Refresh page and try again

### Issue: Stuck on payment success page
**Solution:**
1. Check if interview ID is valid
2. Check server logs for errors
3. Manually navigate to interview: `/candidate/interview/{id}`

### Issue: Balance not updating
**Solution:**
1. Refresh page
2. Check server logs for payment processing errors
3. Verify payment status is "COMPLETED"
4. Check database directly

### Issue: Mock checkout URL not working
**Solution:**
1. This is expected - mock mode doesn't have real checkout
2. Verify you're redirected to `/payment/success`
3. Check that payment verification works

---

## Performance Testing

### Measure Payment Initialization Time
```
1. Open DevTools → Network tab
2. Click "Pay & Start Interview"
3. Check time for /api/payments/initialize
Expected: < 2 seconds
```

### Measure Balance Update Time
```
1. Complete payment
2. Check time for /api/wallet/balance
Expected: < 5 seconds
```

### Measure Transaction Query Time
```
1. Go to Dashboard
2. Check time for /api/payments/history
Expected: < 1 second
```

---

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ All API calls return 200 OK
✅ Balance updates correctly
✅ Transactions appear in history
✅ CSV export works
✅ Error handling works
✅ Performance targets met

---

## Next Steps After Testing

1. **If all tests pass:**
   - System is ready for production
   - Get real Chapa credentials
   - Update `.env` with production credentials
   - Set `USE_MOCK_CHAPA=false`
   - Test with real payments

2. **If issues found:**
   - Check error messages
   - Review server logs
   - Check database state
   - Verify API endpoints
   - Test individual components

---

**Happy Testing! 🎉**
