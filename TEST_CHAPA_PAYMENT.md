# Test Chapa Payment - Step by Step

## Complete Testing Guide

---

## Prerequisites

✅ PostgreSQL is running
✅ Backend is running on port 5000
✅ Frontend is running on port 3000
✅ Logged in as candidate
✅ Have an interview scheduled

---

## Step 1: Navigate to Interviews

1. Open http://localhost:3000
2. Login with candidate credentials
3. Click: **Dashboard** → **My Interviews**
4. You should see a list of interviews

---

## Step 2: Find Interview to Test

Look for an interview with status: **"Ready to Start"**

If you don't have one:
1. Go to **Explore Jobs**
2. Find a job
3. Click **Apply**
4. Interview will be created automatically

---

## Step 3: Click "Start AI Interview"

1. Find interview with "Ready to Start" status
2. Click the green **"Start AI Interview"** button
3. You should see a payment prompt modal

---

## Step 4: Payment Prompt Modal

The modal should show:
- 💳 **Start Your Interview**
- **Cost**: 5 ETB
- **Your Balance**: 0 Credits (or current balance)
- **Button**: "Pay & Start Interview"

Click: **"Pay & Start Interview"**

---

## Step 5: Redirected to Chapa

You should be redirected to Chapa checkout page:
- URL: `https://checkout.chapa.co/checkout/payment/...`
- Shows: Payment form
- Shows: Amount: 5 ETB

---

## Step 6: Enter Test Card Details

Fill in the payment form:

| Field | Value |
|-------|-------|
| Card Number | `4200000000000000` |
| Expiry | `12/25` |
| CVV | `123` |
| Name | Any name |

---

## Step 7: Click "Pay"

1. Click the **"Pay"** button
2. Chapa processes the payment
3. Should show: "Processing..."
4. After a few seconds, should redirect

---

## Step 8: Redirected to PaymentSuccess

You should see:
- ✅ **Payment Confirmed!**
- **Amount Paid**: 5 ETB
- **Ref Number**: Transaction reference
- **Button**: "Go to Dashboard"
- **Countdown**: "Redirecting in 5s..."

---

## Step 9: Redirected to Interview

After countdown, you should be redirected to:
- URL: `/candidate/interview/{id}?paymentVerified=true`
- Page: Interview session
- Shows: First question

---

## Step 10: Interview Starts

You should see:
- ✅ Interview session page
- ✅ First question displayed
- ✅ Answer input field
- ✅ Submit button
- ✅ Timer running

---

## Verification

### Check Backend Logs

In your backend terminal, you should see:

```
✅ Generating Chapa payment URL: txRef=..., amount=5
✅ Chapa request payload: {...}
✅ Calling Chapa API at https://api.chapa.co/v1/transaction/initialize
✅ Chapa response status: 200
✅ Chapa payment URL generated: https://checkout.chapa.co/checkout/payment/...
✅ Payment verified successfully
✅ Wallet updated: balance increased by 1
✅ Interview started: status=IN_PROGRESS
```

### Check Browser Console

Open browser console (F12) and look for:
- ✅ No red error messages
- ✅ Network requests successful (200 status)
- ✅ Payment verification successful

### Check Database

Verify payment was recorded:

```sql
SELECT id, userId, amount, status, creditAmount FROM payment ORDER BY createdAt DESC LIMIT 1;
```

Should show:
- amount: 5
- status: COMPLETED
- creditAmount: 1

---

## Success Checklist

- [ ] Payment prompt appears
- [ ] Redirected to Chapa
- [ ] Chapa page loads
- [ ] Test card accepted
- [ ] Payment processes
- [ ] Redirected to PaymentSuccess
- [ ] Success message shown
- [ ] Countdown timer visible
- [ ] Redirected to interview
- [ ] Interview page loads
- [ ] First question displayed
- [ ] Wallet balance increased
- [ ] Payment record created
- [ ] No errors in logs

---

## Troubleshooting

### Problem: Payment prompt doesn't appear
**Solution**:
1. Refresh page
2. Check browser console (F12)
3. Check backend logs
4. Verify backend is running

### Problem: Chapa page doesn't load
**Solution**:
1. Check internet connection
2. Check CHAPA_API_KEY in server/.env
3. Check backend logs for Chapa errors
4. Try again in a few moments

### Problem: Test card rejected
**Solution**:
1. Use exact card: 4200000000000000
2. Use any future expiry: 12/25
3. Use any 3-digit CVV: 123
4. Ensure amount is 5 ETB

### Problem: Stuck on PaymentSuccess
**Solution**:
1. Wait for countdown to complete
2. Or click "Go to Dashboard"
3. Check browser console for errors
4. Check backend logs

### Problem: Interview doesn't start
**Solution**:
1. Check wallet balance increased
2. Check payment status in database
3. Check backend logs
4. Try refreshing page

---

## Test Scenarios

### Scenario 1: First Time Payment
- User has 0 credits
- Clicks "Start AI Interview"
- Completes payment
- Interview starts
- ✅ EXPECTED: Success

### Scenario 2: Sufficient Credits
- User has 1+ credits
- Clicks "Start AI Interview"
- Shows "Start Interview Now" button
- Clicks button
- Interview starts immediately
- ✅ EXPECTED: No payment needed

### Scenario 3: Multiple Payments
- User applies for multiple jobs
- Each interview costs 1 credit
- User can purchase multiple credits
- Can start multiple interviews
- ✅ EXPECTED: All payments succeed

---

## Performance Metrics

### Expected Times
- Payment initialization: < 2 seconds
- Redirect to Chapa: < 1 second
- Chapa page load: < 3 seconds
- Payment processing: 5-10 seconds
- Redirect to PaymentSuccess: < 1 second
- Payment verification: < 2 seconds
- Redirect to interview: < 1 second
- **Total time**: ~15-20 seconds

---

## Next Steps

After successful payment test:

1. **Test Multiple Payments**
   - Apply for another job
   - Start another interview
   - Complete another payment

2. **Test Interview Completion**
   - Answer all questions
   - Submit answers
   - Complete interview
   - View report

3. **Test Payment History**
   - Go to Dashboard → Billing
   - Verify payment appears
   - Check amount and status

4. **Monitor Production**
   - Track payment success rate
   - Monitor Chapa API performance
   - Check error logs regularly

---

## Support

For issues:
1. Check browser console (F12)
2. Check backend logs
3. Review troubleshooting section
4. Check Chapa documentation

---

## Summary

This guide walks through the complete Chapa payment flow:

1. ✅ Click "Start AI Interview"
2. ✅ Payment prompt appears
3. ✅ Click "Pay & Start Interview"
4. ✅ Redirected to Chapa
5. ✅ Enter test card details
6. ✅ Click "Pay"
7. ✅ Payment processes
8. ✅ Redirected to PaymentSuccess
9. ✅ Redirected to interview
10. ✅ Interview starts

All steps should complete successfully!

Ready to test! 🚀
