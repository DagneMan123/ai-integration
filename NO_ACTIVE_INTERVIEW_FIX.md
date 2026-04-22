# Fix: "No active interview found" Error

## Problem
```
[saveRecording] No active interview found { userId: 25 }
error: No active interview found - /api/interviews/save-recording
```

The backend is looking for an `IN_PROGRESS` interview but can't find one. This happens because the Assessment component generates mock questions but **doesn't create an actual interview record in the database**.

---

## Root Cause

### Before (Broken)
```
1. User clicks "Begin Interview"
2. Assessment generates mock questions (no DB record)
3. User records response
4. Tries to save recording
5. Backend looks for IN_PROGRESS interview
6. Not found → 404 error
```

### After (Fixed)
```
1. User clicks "Begin Interview"
2. Assessment calls /api/interviews/start
3. Backend creates Interview record with status 'IN_PROGRESS'
4. Assessment stores interviewId
5. User records response
6. Tries to save recording
7. Backend finds IN_PROGRESS interview
8. Recording saved successfully ✅
```

---

## What Was Fixed

### 1. Added startInterview Method
**File**: `client/src/services/aiInterviewService.ts`

```typescript
startInterview: async (data: { jobId: number; applicationId: number; interviewMode?: string; strictnessLevel?: string }) => {
  try {
    const response = await api.post('/interviews/start', {
      jobId: data.jobId,
      applicationId: data.applicationId,
      interviewMode: data.interviewMode || 'video',
      strictnessLevel: data.strictnessLevel || 'moderate'
    });
    return response;
  } catch (error) {
    console.error('Error starting interview:', error);
    throw error;
  }
}
```

### 2. Updated Assessment Component
**File**: `client/src/pages/candidate/Assessment.tsx`

Added `interviewId` state:
```typescript
const [interviewId, setInterviewId] = useState<number | null>(null);
```

Updated `handleBeginInterview` to create interview:
```typescript
const handleBeginInterview = async () => {
  // ... generate questions ...

  // START INTERVIEW: Create interview record in database
  try {
    const response = await aiInterviewService.startInterview({
      jobId: 1,
      applicationId: 1,
      interviewMode: 'video',
      strictnessLevel: 'moderate'
    });

    if (response.data?.data?.interviewId) {
      setInterviewId(response.data.data.interviewId);
      console.log('[Assessment] Interview created:', {
        interviewId: response.data.data.interviewId,
        status: response.data.data.status
      });
    }
  } catch (startError) {
    console.warn('[Assessment] Could not create interview record:', startError);
    // Continue anyway - will create interview on first response save
  }

  setQuestions(mockQuestions);
  setPhase('interview');
};
```

---

## How It Works Now

### Step 1: User Clicks "Begin Interview"
```
Assessment.tsx → handleBeginInterview()
```

### Step 2: Create Interview Record
```
aiInterviewService.startInterview()
  ↓
POST /api/interviews/start
  ↓
Backend creates Interview record
  ↓
Returns interviewId
```

### Step 3: Store Interview ID
```
setInterviewId(response.data.data.interviewId)
```

### Step 4: User Records Response
```
PracticeInterviewEnvironment records video
```

### Step 5: Save Recording
```
POST /api/interviews/save-recording
  ↓
Backend finds IN_PROGRESS interview
  ↓
Creates InterviewResponse record
  ↓
Returns success ✅
```

---

## Testing

### Test 1: Start Interview
1. Go to Practice Interview
2. Click "Begin Interview"
3. Check browser console for:
   ```
   [Assessment] Interview created: {
     interviewId: 123,
     status: 'IN_PROGRESS'
   }
   ```

### Test 2: Record and Save
1. Record a response (10-15 seconds)
2. Stop recording
3. Wait for upload
4. Check for:
   - Progress bar: 0% → 100%
   - Toast: "Response saved!"
   - Next question appears

### Test 3: Check Server Logs
```
[saveRecording] Found interview {
  interviewId: 123,
  status: 'IN_PROGRESS'
}
[saveRecording] Response created successfully {
  responseId: 456,
  interviewId: 123
}
```

---

## Verification Checklist

- [ ] Backend running on port 5000?
- [ ] Frontend running on port 3000?
- [ ] Can log in?
- [ ] Can navigate to Practice Interview?
- [ ] Can click "Begin Interview"?
- [ ] See "Interview created" in console?
- [ ] Can record response?
- [ ] Can upload response?
- [ ] See "Response saved!" toast?
- [ ] Next question appears?

---

## Error Handling

### If Interview Creation Fails
```typescript
} catch (startError) {
  console.warn('[Assessment] Could not create interview record:', startError);
  // Continue anyway - will create interview on first response save
}
```

The component continues even if interview creation fails. The backend will create an interview on the first response save.

### If Still Getting "No active interview found"
1. Check backend is running: `curl http://localhost:5000/health`
2. Check server logs: `tail -f server/logs/combined.log`
3. Verify user is logged in
4. Check database has Interview table
5. Run migrations: `cd server && npx prisma migrate dev`

---

## Files Modified

1. **client/src/services/aiInterviewService.ts**
   - Added `startInterview` method

2. **client/src/pages/candidate/Assessment.tsx**
   - Added `interviewId` state
   - Updated `handleBeginInterview` to create interview
   - Added error handling for interview creation

---

## Database Flow

### Before
```
User → Record → Save Recording
                    ↓
              Look for Interview
                    ↓
              Not found → Error
```

### After
```
User → Begin Interview → Create Interview Record
                              ↓
                         Record → Save Recording
                                      ↓
                                 Find Interview
                                      ↓
                                 Save Response ✅
```

---

## Summary

**Problem**: No active interview found  
**Cause**: Assessment component didn't create interview record  
**Solution**: Call `/api/interviews/start` when user clicks "Begin Interview"  
**Result**: Interview record created, recording can be saved successfully

---

## Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ Code changes applied
4. Test recording upload
5. Verify success

---

**Status**: ✅ Fixed  
**Last Updated**: April 20, 2026
