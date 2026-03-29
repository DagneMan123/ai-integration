# Interview Payment Check - Implementation Guide

## 🎯 Feature Overview

When a candidate clicks "Start AI Interview" button, the system now checks if they have sufficient credits before allowing the interview to start. If they don't have credits, they're redirected to the dashboard to top up their wallet.

---

## 📋 What Changed

### File Modified
- `client/src/pages/candidate/Interviews.tsx`

### Changes Made

#### 1. Added Imports
```typescript
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { CreditCard } from 'lucide-react';
```

#### 2. Added State
```typescript
const [checkingPayment, setCheckingPayment] = useState<string | null>(null);
```
- Tracks which interview is being checked for payment
- Used to show loading state on the button

#### 3. Added Payment Check Function
```typescript
const handleStartInterview = async (interviewId: string) => {
  try {
    setCheckingPayment(interviewId);
    
    // Check if user has sufficient credits (1 credit required per interview)
    const response = await api.get('/wallet/check-credits?requiredCredits=1');
    
    if (!response.data.hasSufficientCredits) {
      toast.error('Insufficient credits. Please top up your wallet first.');
      navigate('/candidate/dashboard');
      return;
    }
    
    // If payment check passes, navigate to interview
    navigate(`/candidate/interview/${interviewId}`);
  } catch (err: any) {
    console.error('Payment check error:', err);
    toast.error('Please top up your wallet to start an interview');
    navigate('/candidate/dashboard');
  } finally {
    setCheckingPayment(null);
  }
};
```

#### 4. Updated Button
Changed from `<Link>` to `<button>` with payment check:
```typescript
<button
  onClick={() => handleStartInterview(interviewId)}
  disabled={checkingPayment === interviewId}
  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
    checkingPayment === interviewId
    ? 'bg-gray-400 text-white cursor-not-allowed'
    : statusNormalized === 'IN_PROGRESS' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-emerald-600 text-white hover:bg-emerald-700'
  }`}
>
  {checkingPayment === interviewId ? (
    <>
      <Clock className="w-5 h-5 animate-spin" />
      Checking...
    </>
  ) : statusNormalized === 'IN_PROGRESS' ? (
    <>
      Continue Interview
      <ChevronRight className="w-5 h-5" />
    </>
  ) : (
    <>
      Start AI Interview
      <PlayCircle className="w-5 h-5" />
    </>
  )}
</button>
```

---

## 🔄 User Flow

### Scenario 1: User Has Sufficient Credits
1. User clicks "Start AI Interview" button
2. Button shows "Checking..." with loading spinner
3. System calls `/wallet/check-credits?requiredCredits=1`
4. API returns `hasSufficientCredits: true`
5. User is navigated to interview session
6. Interview starts normally

### Scenario 2: User Has Insufficient Credits
1. User clicks "Start AI Interview" button
2. Button shows "Checking..." with loading spinner
3. System calls `/wallet/check-credits?requiredCredits=1`
4. API returns `hasSufficientCredits: false`
5. Toast error: "Insufficient credits. Please top up your wallet first."
6. User is redirected to `/candidate/dashboard`
7. User can see Billing & History section to top up

### Scenario 3: Payment Check Error
1. User clicks "Start AI Interview" button
2. Button shows "Checking..." with loading spinner
3. System calls `/wallet/check-credits?requiredCredits=1`
4. API call fails (network error, server error, etc.)
5. Toast error: "Please top up your wallet to start an interview"
6. User is redirected to `/candidate/dashboard`

---

## 💳 Credit System

### Credit Requirements
- **1 Credit** = Required to start an interview
- **1 Credit** = 5 ETB (Ethiopian Birr)

### Wallet Balance Check
The system checks:
```
GET /wallet/check-credits?requiredCredits=1
```

Response:
```json
{
  "success": true,
  "hasSufficientCredits": true,
  "balance": 10,
  "requiredCredits": 1,
  "message": "Sufficient credits available"
}
```

---

## 🎨 UI/UX Features

### Button States

#### 1. Ready to Start (Green)
```
Status: SCHEDULED
Button: "Start AI Interview" (Emerald Green)
```

#### 2. Continue Interview (Blue)
```
Status: IN_PROGRESS
Button: "Continue Interview" (Blue)
```

#### 3. Checking Payment (Gray)
```
Status: Any (while checking)
Button: "Checking..." (Gray, disabled)
Icon: Spinning clock
```

#### 4. Completed (Report Link)
```
Status: COMPLETED
Button: "Report" (Dark Gray)
Shows: Final Score
```

---

## 🔐 Security

### Authentication
- All wallet endpoints require JWT token
- Token automatically included in API calls via interceptor

### Validation
- Server validates credit balance
- Prevents double-spending with atomic transactions
- Idempotent operations

---

## 📊 API Endpoints Used

### Check Credits
```
GET /wallet/check-credits?requiredCredits=1
Auth: JWT Token
Response: { hasSufficientCredits, balance, requiredCredits, message }
```

### Get Balance
```
GET /wallet/balance
Auth: JWT Token
Response: { balance, currency }
```

### Top Up Wallet
```
POST /payments/initialize
Auth: JWT Token
Body: { bundleId, amount, creditAmount }
Response: { txRef, checkout_url, amount, creditAmount }
```

---

## 🧪 Testing

### Test Case 1: Sufficient Credits
1. Create user with 10 credits
2. Click "Start AI Interview"
3. Verify: Interview starts successfully

### Test Case 2: Insufficient Credits
1. Create user with 0 credits
2. Click "Start AI Interview"
3. Verify: Error toast appears
4. Verify: Redirected to dashboard
5. Verify: Billing section visible

### Test Case 3: Network Error
1. Disable network
2. Click "Start AI Interview"
3. Verify: Error toast appears
4. Verify: Redirected to dashboard

### Test Case 4: Multiple Interviews
1. Create user with 2 credits
2. Start first interview (1 credit deducted)
3. Complete first interview
4. Start second interview (1 credit deducted)
5. Verify: Both interviews work correctly

---

## 🐛 Troubleshooting

### Issue: "Insufficient credits" but user has credits
**Solution:**
1. Check wallet balance: `/wallet/balance`
2. Verify credit amount is correct
3. Check if credits were deducted for previous interview
4. Refresh page and try again

### Issue: Button stuck on "Checking..."
**Solution:**
1. Check browser console for errors
2. Verify API endpoint is responding
3. Check network tab for failed requests
4. Refresh page

### Issue: User redirected but no error message
**Solution:**
1. Check browser console for errors
2. Verify toast notifications are enabled
3. Check if error occurred during API call
4. Check server logs

---

## 📈 Future Enhancements

### Possible Improvements
1. Show credit cost before starting interview
2. Display remaining credits on button
3. Offer quick top-up from interview page
4. Show credit history in interview details
5. Implement credit refund for incomplete interviews
6. Add credit packages recommendation

---

## 📝 Code Reference

### File Location
`client/src/pages/candidate/Interviews.tsx`

### Key Functions
- `handleStartInterview()` - Main payment check function
- `getStatusConfig()` - Status badge styling
- `getModeIcon()` - Interview mode icon
- `getJobData()` - Job details retrieval

### State Variables
- `interviews` - List of user's interviews
- `jobsMap` - Map of job details
- `loading` - Initial load state
- `error` - Error message
- `checkingPayment` - Current payment check state

---

## ✅ Verification Checklist

- [x] Payment check implemented
- [x] Button shows loading state
- [x] Error handling implemented
- [x] User redirected to dashboard on error
- [x] Toast notifications working
- [x] No TypeScript errors
- [x] No runtime errors
- [x] API endpoints working
- [x] Credit system integrated
- [x] UI/UX polished

---

## 🎯 Summary

The interview payment check feature ensures that candidates have sufficient credits before starting an interview. This prevents wasted resources and ensures a smooth user experience with clear feedback about payment requirements.

**Status:** ✅ Production Ready

---

**Last Updated:** March 28, 2026
**Version:** 1.0.0
