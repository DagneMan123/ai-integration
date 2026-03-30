# Verify Interview Payment Flow - Quick Checklist

## System Status Check

### 1. PostgreSQL Database
```powershell
Get-Service -Name "postgresql-x64-15" | Select-Object Status
```
Expected: `Status : Running`

If not running:
```powershell
Start-Service -Name "postgresql-x64-15"
```

### 2. Backend Server
Check if running on port 5000:
```
http://localhost:5000/health
```
Expected: `{ "status": "OK", "timestamp": "..." }`

If not running:
```bash
cd server
npm run dev
```

### 3. Frontend Application
Check if running on port 3000:
```
http://localhost:3000
```
Expected: Application loads

If not running:
```bash
cd client
npm start
```

---

## Application Flow Check

### Step 1: Login
1. Go to http://localhost:3000
2. Login with candidate credentials
3. Expected: Dashboard loads

### Step 2: Navigate to Interviews
1. Click **Candidate Dashboard** → **My Interviews**
2. Expected: List of interviews appears

### Step 3: Check Interview Status
1. Look for interview with status "Ready to Start" or "Scheduled"
2. Expected: "Start AI Interview" button is visible

### Step 4: Click Start Interview
1. Click **"Start AI Interview"** button
2. Expected: Payment prompt modal appears

### Step 5: Check Payment Prompt
Modal should show:
- ✅ Cost: 5 ETB
- ✅ Your Balance: (current credits)
- ✅ Two buttons:
  - If balance < 1: "Pay & Start Interview"
  - If balance ≥ 1: "Start Interview Now"

### Step 6: Proceed to Payment
1. Click **"Pay & Start Interview"** (if balance < 1)
2. Expected: Redirected to Chapa payment gateway

### Step 7: Complete Payment
1. Use test card: `4200000000000000`
2. Expiry: Any future date (e.g., 12/25)
3. CVV: Any 3 digits (e.g., 123)
4. Click **"Pay"**
5. Expected: Redirected to PaymentSuccess page

### Step 8: Verify Payment Success
Page should show:
- ✅ Success message
- ✅ Amount paid: 5 ETB
- ✅ Credits added: 1
- ✅ "Continue to Interview" button

### Step 9: Start Interview
1. Click **"Continue to Interview"**
2. Expected: Interview session page loads

### Step 10: Verify Interview Started
Page should show:
- ✅ First question displayed
- ✅ Interview timer running
- ✅ Answer input field ready
- ✅ Submit button available

---

## Database Verification

### Check Wallet Balance
```sql
SELECT id, userId, balance, currency FROM wallet WHERE userId = 1;
```
Expected: balance increased by 1

### Check Payment Record
```sql
SELECT id, userId, amount, status, creditAmount FROM payment ORDER BY createdAt DESC LIMIT 1;
```
Expected: 
- amount: 5
- status: COMPLETED
- creditAmount: 1

### Check Interview Status
```sql
SELECT id, candidateId, status, startedAt FROM interview ORDER BY createdAt DESC LIMIT 1;
```
Expected:
- status: IN_PROGRESS
- startedAt: current timestamp

---

## Browser Console Check

Open browser console (F12) and look for:

### No Errors
- ✅ No red error messages
- ✅ No network errors (404, 500, etc.)
- ✅ No TypeScript errors

### Network Requests
Check Network tab for:
- ✅ POST /api/payments/initialize - Status 200
- ✅ GET /api/payments/verify/:txRef - Status 200
- ✅ POST /api/interviews/start - Status 201
- ✅ GET /api/wallet/balance - Status 200

### Console Logs
Look for:
- ✅ "Payment initialized successfully"
- ✅ "Payment verified successfully"
- ✅ "Interview started successfully"
- ✅ No error messages

---

## Backend Logs Check

In the PowerShell window where backend is running, look for:

### Expected Logs
```
✅ POST /api/payments/initialize - 200
✅ POST /api/payments/webhook - 200
✅ GET /api/payments/verify/:txRef - 200
✅ POST /api/interviews/start - 201
✅ GET /api/wallet/balance - 200
```

### Error Logs
Look for and fix:
- ❌ "Can't reach database server" - Start PostgreSQL
- ❌ "Insufficient credits" - User needs to purchase credits
- ❌ "Interview not found" - Check interview ID
- ❌ "Payment verification failed" - Check Chapa API key

---

## Common Issues and Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Payment modal doesn't appear | Browser console | Refresh page, check backend logs |
| Chapa page doesn't load | Network tab | Check CHAPA_API_KEY in .env |
| Payment fails | Backend logs | Check Chapa API response |
| Interview doesn't start | Database | Check wallet balance, interview status |
| Stuck on PaymentSuccess | Browser console | Check interview ID, try refresh |
| "Database connection lost" | PostgreSQL service | Start PostgreSQL service |

---

## Quick Test Commands

### Test Payment Initialization
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 5,
    "creditAmount": 1,
    "type": "interview",
    "description": "Test payment"
  }'
```

### Test Wallet Balance
```bash
curl -X GET http://localhost:5000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Interview Start
```bash
curl -X POST http://localhost:5000/api/interviews/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobId": 1,
    "applicationId": 1,
    "interviewMode": "text"
  }'
```

---

## Success Criteria

All of the following should be true:

- [ ] PostgreSQL is running
- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Can login as candidate
- [ ] Can navigate to interviews page
- [ ] Can see interview with "Start AI Interview" button
- [ ] Payment prompt appears when clicking button
- [ ] Can proceed to Chapa payment
- [ ] Test card payment succeeds
- [ ] Redirected to PaymentSuccess page
- [ ] Can click "Continue to Interview"
- [ ] Interview session page loads
- [ ] First question is displayed
- [ ] Wallet balance increased by 1
- [ ] Payment record created in database
- [ ] Interview status is "IN_PROGRESS"
- [ ] No errors in browser console
- [ ] No errors in backend logs

---

## If All Checks Pass ✅

The interview payment flow is working correctly!

You can now:
1. Test multiple interviews
2. Test with different payment amounts
3. Test payment failure scenarios
4. Test interview completion
5. Check payment history

---

## If Any Check Fails ❌

1. Review the specific step that failed
2. Check the troubleshooting section
3. Review backend logs
4. Review browser console
5. Check database records
6. Restart services if needed

---

## Next Steps

After verifying the flow works:

1. **Test Interview Completion**
   - Answer all questions
   - Submit answers
   - Complete interview
   - View report

2. **Test Payment History**
   - Go to Dashboard → Billing
   - Verify payment appears in history
   - Check amount and status

3. **Test Multiple Payments**
   - Apply for multiple jobs
   - Start multiple interviews
   - Complete multiple payments
   - Verify all records in database

4. **Test Edge Cases**
   - Insufficient credits
   - Payment failure
   - Network timeout
   - Database disconnect

---

## Documentation

For more details, see:
- `INTERVIEW_PAYMENT_FLOW_TEST.md` - Complete test guide
- `PAYMENT_VERIFICATION_COMPLETE.md` - Payment verification
- `INTERVIEW_PAYMENT_SYSTEM_COMPLETE.md` - System overview
- `USER_GUIDE_PAYMENT_AND_CREDITS.md` - User guide
