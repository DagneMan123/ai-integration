# Manual Chapa Payment Flow - User Enters Card Details

## Status: ✅ READY

The system is set up for users to manually enter Chapa payment details.

---

## Complete Flow

```
STEP 1: Click "Start AI Interview"
  ↓
STEP 2: Payment Prompt Modal Appears
  - Shows: Cost 5 ETB
  - Shows: Your Balance 0 Credits
  - Button: "Pay & Start Interview"
  ↓
STEP 3: User Clicks "Pay & Start Interview"
  ↓
STEP 4: Redirected to Chapa Payment Gateway
  - URL: https://checkout.chapa.co/checkout/payment/...
  - Chapa page loads
  ↓
STEP 5: User Manually Enters Card Details
  - Card Number: 4200000000000000
  - Expiry: 12/25
  - CVV: 123
  - Name: Any name
  ↓
STEP 6: User Clicks "Pay" Button on Chapa
  ↓
STEP 7: Chapa Processes Payment
  - Shows: "Processing..."
  - Takes 5-10 seconds
  ↓
STEP 8: Payment Succeeds
  ↓
STEP 9: Chapa Redirects to PaymentSuccess Page
  - URL: /payment/success?tx_ref=...
  ↓
STEP 10: PaymentSuccess Page Verifies Payment
  - Shows: "Verifying Payment..."
  - Calls backend to verify with Chapa
  ↓
STEP 11: Payment Verified Successfully
  - Shows: "✅ Payment Confirmed!"
  - Shows: Amount Paid: 5 ETB
  - Shows: Countdown "Redirecting in 5s..."
  ↓
STEP 12: After 5 Seconds, Redirected to Interview
  - URL: /candidate/interview/{id}?paymentVerified=true
  ↓
STEP 13: Interview Page Loads
  - First question displayed
  - Answer input field ready
  - Timer running
  ↓
STEP 14: Interview Starts
  - User can answer questions
  - User can submit answers
  - User can complete interview
```

---

## Key Points

### ✅ User Manually Enters Card Details
- NOT auto-filled
- User types card number: 4200000000000000
- User types expiry: 12/25
- User types CVV: 123

### ✅ User Clicks "Pay" on Chapa
- NOT auto-submitted
- User manually clicks "Pay" button
- Chapa processes payment

### ✅ After Payment Succeeds
- Chapa redirects to PaymentSuccess page
- Backend verifies payment
- Interview page appears automatically

### ✅ No Direct Completion
- Payment is NOT auto-completed
- User must manually enter details
- User must manually click "Pay"
- System waits for Chapa response

---

## Test Steps

### Prerequisites
- [ ] PostgreSQL running
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Logged in as candidate
- [ ] Have interview scheduled

### Manual Payment Test

**STEP 1: Navigate to Interviews**
1. Open: http://localhost:3000
2. Click: Dashboard → My Interviews
3. Find interview with "Ready to Start" status

**STEP 2: Click "Start AI Interview"**
1. Click green "Start AI Interview" button
2. Payment prompt modal appears

**STEP 3: Click "Pay & Start Interview"**
1. Modal shows: Cost 5 ETB, Balance 0 Credits
2. Click: "Pay & Start Interview" button
3. Redirected to Chapa checkout page

**STEP 4: Chapa Page Loads**
1. URL: https://checkout.chapa.co/checkout/payment/...
2. Chapa payment form appears
3. Shows: Amount 5 ETB

**STEP 5: Manually Enter Card Details**
1. Click: Card Number field
2. Type: 4200000000000000
3. Click: Expiry field
4. Type: 12/25
5. Click: CVV field
6. Type: 123
7. Click: Name field (optional)
8. Type: Any name

**STEP 6: Click "Pay" Button**
1. Click: "Pay" button on Chapa
2. Chapa shows: "Processing..."
3. Wait 5-10 seconds

**STEP 7: Payment Processes**
1. Chapa processes payment
2. Shows: Processing indicator
3. Takes 5-10 seconds

**STEP 8: Redirected to PaymentSuccess**
1. URL: /payment/success?tx_ref=...
2. Page shows: "Verifying Payment..."
3. Backend verifies with Chapa

**STEP 9: Payment Verified**
1. Shows: "✅ Payment Confirmed!"
2. Shows: Amount Paid: 5 ETB
3. Shows: Ref Number: ...
4. Shows: Countdown "Redirecting in 5s..."

**STEP 10: Redirected to Interview**
1. After 5 seconds, redirected to interview
2. URL: /candidate/interview/{id}?paymentVerified=true
3. Interview page loads

**STEP 11: Interview Starts**
1. First question displayed
2. Answer input field ready
3. Timer running
4. Can answer questions

---

## Expected Behavior

### Chapa Payment Page
```
┌─────────────────────────────────────┐
│  Chapa Payment Gateway              │
│                                     │
│  Amount: 5 ETB                      │
│                                     │
│  Card Number: [________________]    │
│  Expiry: [____]  CVV: [___]        │
│  Name: [________________]           │
│                                     │
│  [Pay]  [Cancel]                   │
│                                     │
└─────────────────────────────────────┘
```

### PaymentSuccess Page
```
┌─────────────────────────────────────┐
│  ✅ Payment Confirmed!              │
│                                     │
│  Payment successful! Starting your  │
│  interview...                       │
│                                     │
│  Amount Paid: 5 ETB                │
│  Ref Number: TXN123456789...       │
│                                     │
│  [Go to Dashboard]                 │
│                                     │
│  Redirecting in 5s...              │
│                                     │
└─────────────────────────────────────┘
```

### Interview Page
```
┌─────────────────────────────────────┐
│  SimuAI Assessment      Step 1/10    │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│  Question 1 of 10                   │
│  ─────────────────────────────────  │
│                                     │
│  "Tell us about your experience..." │
│                                     │
│  [Your answer here...]              │
│                                     │
│  [Submit Answer]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## Test Card Details

| Field | Value |
|-------|-------|
| Card Number | 4200000000000000 |
| Expiry | 12/25 |
| CVV | 123 |
| Name | Any name |
| Amount | 5 ETB |

---

## Verification Checklist

- [ ] Click "Start AI Interview"
- [ ] Payment prompt appears
- [ ] Click "Pay & Start Interview"
- [ ] Redirected to Chapa
- [ ] Chapa page loads
- [ ] Manually enter card: 4200000000000000
- [ ] Manually enter expiry: 12/25
- [ ] Manually enter CVV: 123
- [ ] Click "Pay" button on Chapa
- [ ] Payment processes (5-10 seconds)
- [ ] Redirected to PaymentSuccess
- [ ] See "Payment Confirmed!" message
- [ ] See countdown timer
- [ ] After 5 seconds, redirected to interview
- [ ] Interview page loads
- [ ] First question displayed
- [ ] Can answer questions
- [ ] Wallet balance increased by 1
- [ ] Payment record created
- [ ] No errors in logs

---

## Backend Verification

Check backend logs for:
```
✅ Generating Chapa payment URL
✅ Chapa response status: 200
✅ Chapa payment URL generated
✅ Payment verified successfully
✅ Wallet updated: balance increased by 1
✅ Interview started: status=IN_PROGRESS
```

---

## Database Verification

### Check Wallet Balance
```sql
SELECT balance FROM wallet WHERE userId = 1;
```
Expected: 1 (was 0)

### Check Payment Record
```sql
SELECT status, amount FROM payment ORDER BY createdAt DESC LIMIT 1;
```
Expected: status=COMPLETED, amount=5

### Check Interview Status
```sql
SELECT status FROM interview ORDER BY createdAt DESC LIMIT 1;
```
Expected: status=IN_PROGRESS

---

## Troubleshooting

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
1. Wait for countdown to complete (5 seconds)
2. Or click "Go to Dashboard"
3. Check browser console for errors
4. Check backend logs

### Problem: Interview doesn't load
**Solution**:
1. Check wallet balance increased
2. Check payment status in database
3. Check backend logs
4. Try refreshing page

---

## Summary

The complete manual payment flow:

1. ✅ User clicks "Pay" button
2. ✅ Chapa page opens
3. ✅ User manually enters card details
4. ✅ User clicks "Pay" on Chapa
5. ✅ Payment processes
6. ✅ PaymentSuccess page shows
7. ✅ After 5 seconds, redirected to interview
8. ✅ Interview page appears
9. ✅ User can start answering questions

**NOT auto-completed - user manually enters all details!** ✅

Ready to test! 🚀
