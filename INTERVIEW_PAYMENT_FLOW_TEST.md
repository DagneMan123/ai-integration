# Interview Payment Flow - Complete Test Guide

## Overview
This guide walks through the complete flow:
1. Click "Start Interview" button
2. Payment process (Chapa)
3. Successfully start the interview

---

## Prerequisites

✅ PostgreSQL is running
✅ Backend is running (`npm run dev` in server folder)
✅ Frontend is running (`npm start` in client folder)
✅ You are logged in as a candidate
✅ You have an interview scheduled (applied for a job)

---

## Step-by-Step Flow

### Step 1: Navigate to Interviews Page
1. Login to the application
2. Go to **Candidate Dashboard** → **My Interviews**
3. You should see a list of interviews with status "Ready to Start" or "Scheduled"

### Step 2: Click "Start AI Interview" Button
1. Find an interview with status "Ready to Start"
2. Click the **"Start AI Interview"** button (green button with play icon)
3. A payment prompt modal will appear

### Step 3: Payment Prompt Modal
The modal shows:
- **Cost**: 5 ETB (1 credit)
- **Your Balance**: Current credits available
- **Two scenarios**:

#### Scenario A: You Have Enough Credits (Balance ≥ 1)
- Button: **"Start Interview Now"** (green)
- Click it to start the interview immediately
- No payment needed

#### Scenario B: Insufficient Credits (Balance < 1)
- Button: **"Pay & Start Interview"** (blue)
- Click it to proceed to payment

### Step 4: Payment Process (Chapa)
1. Click **"Pay & Start Interview"**
2. You'll be redirected to Chapa payment gateway
3. Chapa shows:
   - Amount: 5 ETB
   - Payment method options (card, mobile money, etc.)
4. Complete the payment:
   - Use test card: `4200000000000000`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
5. Click **"Pay"**

### Step 5: Payment Success
1. After successful payment, you're redirected to **PaymentSuccess** page
2. Page shows:
   - ✅ Payment successful
   - Amount paid: 5 ETB
   - Credits added: 1
3. Click **"Continue to Interview"** button
4. You're redirected to the interview session

### Step 6: Interview Starts
1. Interview page loads with:
   - First question displayed
   - Interview timer started
   - Answer input field ready
2. You can now answer questions and complete the interview

---

## Expected Behavior at Each Step

### Interviews Page
```
✅ Shows list of interviews
✅ Each interview has status badge (Ready to Start, In Progress, Completed)
✅ "Start AI Interview" button is clickable
✅ Button shows loading state while checking payment
```

### Payment Prompt Modal
```
✅ Modal appears after clicking "Start AI Interview"
✅ Shows cost (5 ETB) and current balance
✅ If balance < 1: Shows "Pay & Start Interview" button
✅ If balance ≥ 1: Shows "Start Interview Now" button
✅ Cancel button closes modal
```

### Chapa Payment Gateway
```
✅ Redirects to Chapa checkout page
✅ Shows amount: 5 ETB
✅ Payment methods available
✅ Test card works: 4200000000000000
✅ After payment, redirects to PaymentSuccess page
```

### Payment Success Page
```
✅ Shows success message
✅ Displays amount paid (5 ETB)
✅ Shows credits added (1)
✅ "Continue to Interview" button works
✅ Redirects to interview session
```

### Interview Session
```
✅ Interview page loads
✅ First question is displayed
✅ Timer is running
✅ Answer input field is ready
✅ Can submit answers
```

---

## Troubleshooting

### Problem: "Insufficient credits" error when clicking Start
**Solution**: 
- You need at least 1 credit
- Click "Pay & Start Interview" to purchase credits
- Complete the Chapa payment

### Problem: Payment modal doesn't appear
**Solution**:
- Check browser console for errors (F12)
- Verify backend is running
- Check network tab to see if API calls are successful
- Try refreshing the page

### Problem: Chapa payment page doesn't load
**Solution**:
- Check if `CHAPA_API_KEY` is set in `server/.env`
- Verify `USE_MOCK_CHAPA=false` in `.env`
- Check backend logs for Chapa API errors
- Try using test card: `4200000000000000`

### Problem: After payment, stuck on PaymentSuccess page
**Solution**:
- Check browser console for errors
- Verify backend is running
- Check if interview ID is stored correctly
- Try clicking "Continue to Interview" button again
- If still stuck, manually navigate to `/candidate/interviews`

### Problem: Interview doesn't start after payment
**Solution**:
- Check if wallet balance was updated (should be 1 credit less)
- Verify interview was created in database
- Check backend logs for errors
- Try refreshing the page
- Check if you have enough credits

### Problem: "Database connection lost" error
**Solution**:
- PostgreSQL is not running
- Start PostgreSQL: `Start-Service -Name "postgresql-x64-15"`
- Restart backend: `npm run dev`
- Try again

---

## API Endpoints Used

### 1. Check Wallet Balance
```
GET /api/wallet/balance
Response: { balance: 1, currency: 'ETB' }
```

### 2. Initialize Payment
```
POST /api/payments/initialize
Body: {
  amount: 5,
  creditAmount: 1,
  type: 'interview',
  description: 'Payment for AI Interview Session'
}
Response: { checkout_url: 'https://chapa.co/...' }
```

### 3. Start Interview
```
POST /api/interviews/start
Body: {
  jobId: 1,
  applicationId: 1,
  interviewMode: 'text'
}
Response: { interviewId: 1, currentQuestion: {...} }
```

### 4. Verify Payment
```
GET /api/payments/verify/:txRef
Response: { status: 'COMPLETED', amount: 5, creditAmount: 1 }
```

---

## Database Changes During Flow

### Before Payment
```
Wallet:
  - balance: 0
  - currency: 'ETB'

Interview:
  - status: 'SCHEDULED'
  - startedAt: null
```

### After Payment
```
Wallet:
  - balance: 1 (increased by 1 credit)
  - currency: 'ETB'

Payment:
  - status: 'COMPLETED'
  - amount: 5 ETB
  - creditAmount: 1
  - paidAt: current timestamp

Interview:
  - status: 'IN_PROGRESS'
  - startedAt: current timestamp
  - questions: [generated questions]
```

---

## Testing Checklist

- [ ] PostgreSQL is running
- [ ] Backend is running
- [ ] Frontend is running
- [ ] Logged in as candidate
- [ ] Have an interview scheduled
- [ ] Click "Start AI Interview" button
- [ ] Payment prompt appears
- [ ] Click "Pay & Start Interview"
- [ ] Redirected to Chapa
- [ ] Use test card: 4200000000000000
- [ ] Complete payment
- [ ] Redirected to PaymentSuccess page
- [ ] Click "Continue to Interview"
- [ ] Interview session starts
- [ ] First question is displayed
- [ ] Can submit answers

---

## Test Data

### Test Card (Chapa)
- Card Number: `4200000000000000`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Amount: 5 ETB

### Test User
- Email: test@example.com
- Password: (your test password)
- Role: candidate

### Test Job
- Title: Any job you've applied for
- Company: Any company
- Location: Any location

---

## Key Files

### Frontend
- `client/src/pages/candidate/Interviews.tsx` - Interview list page
- `client/src/pages/candidate/Dashboard.tsx` - Payment prompt modal
- `client/src/pages/PaymentSuccess.tsx` - Payment success page
- `client/src/pages/candidate/InterviewSession.tsx` - Interview session page

### Backend
- `server/controllers/interviewController.js` - Interview logic
- `server/controllers/paymentController.js` - Payment logic
- `server/services/paymentService.js` - Payment service
- `server/services/chapaService.js` - Chapa integration

### Database
- `Wallet` table - User credits
- `Payment` table - Payment records
- `Interview` table - Interview records

---

## Success Indicators

✅ Payment prompt appears when clicking "Start Interview"
✅ Chapa payment gateway loads
✅ Test card payment succeeds
✅ Wallet balance increases by 1 credit
✅ Interview status changes to "IN_PROGRESS"
✅ Interview session page loads
✅ First question is displayed
✅ Can submit answers

---

## Next Steps

After successful interview payment:
1. Answer interview questions
2. Submit answers
3. Complete interview
4. View interview report
5. Check payment history in dashboard

---

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check backend logs
3. Check database logs
4. Review troubleshooting section above
5. Check relevant documentation files

---

## Documentation References

- `PAYMENT_VERIFICATION_COMPLETE.md` - Payment verification details
- `INTERVIEW_PAYMENT_SYSTEM_COMPLETE.md` - Interview payment system
- `CHAPA_SETUP_GUIDE.md` - Chapa configuration
- `USER_GUIDE_PAYMENT_AND_CREDITS.md` - User guide for payments
