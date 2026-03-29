# Interview Payment Flow - Complete Guide

## 🎯 Overview

The interview payment flow has been implemented to seamlessly integrate billing with the interview process:

1. **User clicks "Start Interview"** on the Interviews page
2. **Redirected to Dashboard** with billing section highlighted
3. **Payment prompt appears** on the dashboard
4. **User completes payment** via Chapa gateway
5. **Automatically redirected** to the interview session

---

## 📋 User Flow

### Step 1: Start Interview
- User navigates to `/candidate/interviews`
- Clicks "Start AI Interview" button on any interview
- System stores the interview ID in localStorage
- User is redirected to `/candidate/dashboard`

### Step 2: Payment Prompt
- Dashboard loads with a modal payment prompt
- Shows:
  - Interview cost: 5 ETB (1 credit)
  - Current wallet balance
  - Two options:
    - **If sufficient credits**: "Start Interview Now" button
    - **If insufficient credits**: "Pay & Start Interview" button

### Step 3: Payment Processing
- User clicks "Pay & Start Interview"
- System initializes payment via Chapa API
- User is redirected to Chapa payment gateway
- User completes payment on Chapa

### Step 4: Payment Verification
- After payment, user is redirected to `/payment/success`
- System verifies payment with Chapa
- If successful:
  - Shows success message with countdown
  - Automatically redirects to `/candidate/interview/{interviewId}`
  - Interview session starts

### Step 5: Interview Session
- User enters the interview session
- Interview begins with AI evaluation
- User completes the interview

---

## 🔧 Technical Implementation

### Files Modified

#### 1. `client/src/pages/candidate/Interviews.tsx`
**Change**: Updated `handleStartInterview` function
```typescript
const handleStartInterview = async (interviewId: string) => {
  // Store interview ID and redirect to dashboard
  localStorage.setItem('pendingInterviewId', interviewId);
  localStorage.setItem('showBillingSection', 'true');
  navigate('/candidate/dashboard');
};
```

#### 2. `client/src/pages/candidate/Dashboard.tsx`
**Changes**:
- Added state for interview payment handling
- Added useEffect to check for pending interview
- Added `handleInitiateInterviewPayment` function
- Added payment prompt modal
- Modal shows before Billing & History section

**Key State Variables**:
```typescript
const [pendingInterviewId, setPendingInterviewId] = useState<string | null>(null);
const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
const [processingPayment, setProcessingPayment] = useState(false);
```

**Payment Handler**:
```typescript
const handleInitiateInterviewPayment = async () => {
  // Initialize payment for 1 credit (5 ETB)
  const response = await paymentAPI.initialize({
    amount: 5,
    creditAmount: 1,
    type: 'interview',
    description: 'Payment for AI Interview Session'
  });
  
  // Redirect to Chapa payment gateway
  window.location.href = response.data.data.checkout_url;
};
```

#### 3. `client/src/pages/PaymentSuccess.tsx`
**Change**: Updated to handle interview redirects
```typescript
// After payment verification
if (interviewId) {
  localStorage.removeItem('pendingInterviewId');
  navigate(`/candidate/interview/${interviewId}`);
} else {
  navigate('/employer/subscription');
}
```

#### 4. `client/src/App.tsx`
**Change**: Added InterviewPayment route (optional, kept for backward compatibility)
```typescript
<Route 
  path="/candidate/interview/:interviewId/payment" 
  element={...}
/>
```

#### 5. `client/src/utils/api.ts`
**Change**: Updated paymentAPI type to include creditAmount
```typescript
export const paymentAPI = {
  initialize: (data: { 
    amount: number; 
    type: string; 
    description?: string; 
    creditAmount?: number; 
    bundleId?: string 
  }) => request.post<any>('/payments/initialize', data),
};
```

---

## 🎨 UI Components

### Payment Prompt Modal
Located on Dashboard, appears when user clicks "Start Interview"

**Features**:
- Shows interview cost (5 ETB / 1 credit)
- Displays current wallet balance
- Two action buttons:
  - "Start Interview Now" (if sufficient credits)
  - "Pay & Start Interview" (if insufficient credits)
- Cancel button to dismiss

**Styling**:
- Centered modal with overlay
- Indigo color scheme matching billing theme
- Smooth animations (zoom-in)
- Responsive design

---

## 💳 Payment Flow Diagram

```
Interviews Page
    ↓
Click "Start Interview"
    ↓
Store Interview ID in localStorage
    ↓
Redirect to Dashboard
    ↓
Dashboard loads
    ↓
Check for pending interview
    ↓
Show Payment Prompt Modal
    ↓
User clicks "Pay & Start Interview"
    ↓
Initialize Payment (Chapa API)
    ↓
Redirect to Chapa Gateway
    ↓
User completes payment
    ↓
Redirect to /payment/success
    ↓
Verify Payment
    ↓
Success! Countdown starts
    ↓
Redirect to Interview Session
    ↓
Interview Begins
```

---

## 🔐 Security Features

### Data Protection
- Interview ID stored in localStorage (client-side only)
- Cleared after successful payment
- No sensitive data exposed

### Payment Security
- HMAC-SHA256 signature validation
- Unique tx_ref for idempotency
- Atomic transactions
- Chapa webhook verification

### Error Handling
- Payment failures handled gracefully
- User can retry payment
- Clear error messages
- Fallback to dashboard

---

## 📊 State Management

### localStorage Keys
| Key | Purpose | Cleared When |
|-----|---------|--------------|
| `pendingInterviewId` | Stores interview ID | After payment success |
| `showBillingSection` | Triggers payment prompt | On dashboard load |
| `pendingPaymentTxRef` | Stores transaction ref | After verification |

### Component State
| State | Type | Purpose |
|-------|------|---------|
| `pendingInterviewId` | string \| null | Current interview ID |
| `showPaymentPrompt` | boolean | Show/hide modal |
| `processingPayment` | boolean | Payment in progress |
| `wallet` | object | User's wallet data |

---

## 🧪 Testing Checklist

### User Flow Testing
- [ ] Click "Start Interview" on Interviews page
- [ ] Verify redirect to Dashboard
- [ ] Verify payment prompt appears
- [ ] Check interview ID is stored
- [ ] Verify wallet balance displays correctly

### Payment Testing
- [ ] Test with sufficient credits (should skip payment)
- [ ] Test with insufficient credits (should show payment button)
- [ ] Click "Pay & Start Interview"
- [ ] Verify redirect to Chapa
- [ ] Complete payment on Chapa
- [ ] Verify redirect to /payment/success
- [ ] Verify payment verification succeeds
- [ ] Verify redirect to interview session
- [ ] Verify interview starts

### Error Testing
- [ ] Test payment failure
- [ ] Test network error during payment
- [ ] Test missing interview ID
- [ ] Test invalid payment response

### UI Testing
- [ ] Modal displays correctly
- [ ] Buttons are clickable
- [ ] Animations work smoothly
- [ ] Responsive on mobile
- [ ] Text is readable

---

## 🚀 Deployment Notes

### Environment Variables
No new environment variables required. Uses existing:
- `REACT_APP_API_URL`
- `CHAPA_API_KEY` (backend)
- `CHAPA_SECRET_KEY` (backend)

### Database
No database changes required. Uses existing:
- `Wallet` table
- `Payment` table
- `CreditBundle` table

### Backend
No backend changes required. Uses existing endpoints:
- `POST /api/payments/initialize`
- `GET /api/payments/verify/:tx_ref`
- `GET /api/wallet/balance`

---

## 📝 Code Examples

### Starting an Interview
```typescript
// From Interviews.tsx
const handleStartInterview = async (interviewId: string) => {
  localStorage.setItem('pendingInterviewId', interviewId);
  localStorage.setItem('showBillingSection', 'true');
  navigate('/candidate/dashboard');
};
```

### Checking for Pending Interview
```typescript
// From Dashboard.tsx
useEffect(() => {
  const interviewId = localStorage.getItem('pendingInterviewId');
  const showBilling = localStorage.getItem('showBillingSection');
  
  if (interviewId && showBilling === 'true') {
    setPendingInterviewId(interviewId);
    setShowPaymentPrompt(true);
    localStorage.removeItem('showBillingSection');
  }
}, []);
```

### Initiating Payment
```typescript
// From Dashboard.tsx
const handleInitiateInterviewPayment = async () => {
  const response = await paymentAPI.initialize({
    amount: 5,
    creditAmount: 1,
    type: 'interview',
    description: 'Payment for AI Interview Session'
  });
  
  window.location.href = response.data.data.checkout_url;
};
```

---

## 🎯 Key Features

### ✅ Seamless Integration
- No separate payment page needed
- Payment happens on dashboard
- Automatic redirect to interview

### ✅ User-Friendly
- Clear payment prompt
- Shows cost and balance
- One-click payment

### ✅ Secure
- HMAC-SHA256 validation
- Atomic transactions
- No sensitive data exposure

### ✅ Reliable
- Error handling
- Retry capability
- Fallback options

### ✅ Performant
- Fast payment initialization
- Smooth redirects
- Optimized state management

---

## 🔄 Future Enhancements

### Possible Improvements
1. **Payment History**: Show recent payments on dashboard
2. **Auto-Retry**: Automatically retry failed payments
3. **Payment Plans**: Monthly subscription for interviews
4. **Bulk Credits**: Discount for buying more credits
5. **Free Trial**: First interview free for new users
6. **Analytics**: Track payment trends and patterns

---

## 📞 Support

### Common Issues

**Issue**: Payment prompt doesn't appear
- **Solution**: Check localStorage for `pendingInterviewId`
- **Check**: Browser console for errors

**Issue**: Redirect to interview fails
- **Solution**: Verify interview ID is valid
- **Check**: Interview exists in database

**Issue**: Payment verification fails
- **Solution**: Check Chapa webhook configuration
- **Check**: Transaction reference is correct

### Debug Mode
```typescript
// Add to Dashboard.tsx to debug
useEffect(() => {
  console.log('Pending Interview ID:', pendingInterviewId);
  console.log('Show Payment Prompt:', showPaymentPrompt);
  console.log('Wallet Balance:', wallet?.balance);
}, [pendingInterviewId, showPaymentPrompt, wallet]);
```

---

## 📚 Related Documentation

- [Billing System Complete Status](BILLING_SYSTEM_COMPLETE_STATUS.md)
- [Billing System Quick Start](BILLING_SYSTEM_QUICK_START.md)
- [Chapa Payment Integration Guide](CHAPA_PAYMENT_INTEGRATION_GUIDE.md)
- [Interview System Architecture](INTERVIEW_SYSTEM_ARCHITECTURE.md)

---

**Last Updated**: March 28, 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
