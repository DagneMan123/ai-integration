# Interview Payment Check - Quick Reference

## 🎯 What Was Done

Added payment verification before starting an interview. Candidates must have at least 1 credit to start an interview.

---

## 📍 Where It Works

**File:** `client/src/pages/candidate/Interviews.tsx`

**Button:** "Start AI Interview" button on the Interviews page

---

## 🔄 How It Works

```
User clicks "Start AI Interview"
         ↓
Button shows "Checking..." spinner
         ↓
System checks: GET /wallet/check-credits?requiredCredits=1
         ↓
    ┌────┴────┐
    ↓         ↓
Has Credits  No Credits
    ↓         ↓
  Start    Show Error
Interview  & Redirect
           to Dashboard
```

---

## 💳 Credit Cost

- **1 Credit** = 1 Interview
- **1 Credit** = 5 ETB

---

## 🎨 Button States

| State | Text | Color | Icon |
|-------|------|-------|------|
| Ready | Start AI Interview | Green | Play |
| Checking | Checking... | Gray | Spinner |
| In Progress | Continue Interview | Blue | Arrow |
| Completed | Report | Dark | None |

---

## 📱 User Experience

### If User Has Credits ✅
1. Click "Start AI Interview"
2. Button shows "Checking..."
3. Interview starts
4. User can proceed

### If User Has No Credits ❌
1. Click "Start AI Interview"
2. Button shows "Checking..."
3. Error message appears: "Insufficient credits. Please top up your wallet first."
4. Redirected to dashboard
5. Can see Billing & History section to top up

---

## 🔧 Technical Details

### Function
```typescript
const handleStartInterview = async (interviewId: string) => {
  // Check credits
  // If sufficient: navigate to interview
  // If insufficient: show error & redirect to dashboard
}
```

### API Call
```
GET /wallet/check-credits?requiredCredits=1
```

### Response
```json
{
  "hasSufficientCredits": true/false,
  "balance": 10,
  "requiredCredits": 1
}
```

---

## ✅ Status

- [x] Implemented
- [x] Tested
- [x] No errors
- [x] Production ready

---

## 📚 Documentation

- Full Guide: `INTERVIEW_PAYMENT_CHECK_GUIDE.md`
- Implementation: `INTERVIEW_PAYMENT_CHECK_IMPLEMENTATION.md`
- Billing System: `BILLING_SYSTEM_QUICK_START.md`

---

**Last Updated:** March 28, 2026
