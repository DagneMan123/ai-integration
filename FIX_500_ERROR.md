# Fix: 500 Error on Recording Upload

## Problem
```
Upload failed: Request failed with status code 500
```

**Root Cause**: The `saveRecording` function was trying to create an `InterviewResponse` record with fields that don't exist in the Prisma schema.

---

## What Was Wrong

### Before (Broken)
```javascript
const response = await prisma.interviewResponse.create({
  data: {
    interviewId: interview.id,        // ❌ Field doesn't exist
    questionId: parseInt(questionId),
    videoUrl,
    recordingTime: parseInt(recordingTime) || 0,
    status: 'SUBMITTED',              // ❌ Wrong status value
    submittedAt: new Date()           // ❌ Field doesn't exist
  }
});
```

### After (Fixed)
```javascript
const response = await prisma.interviewResponse.create({
  data: {
    sessionId: interview.id,          // ✅ Correct field name
    questionId: parseInt(questionId),
    userId: userId,                   // ✅ Required field
    videoUrl: videoUrl,
    videoPath: videoUrl,              // ✅ Required field
    recordingTime: parseInt(recordingTime) || 0,
    status: 'completed'               // ✅ Correct status value
  }
});
```

---

## Schema vs Code

### InterviewResponse Schema
```prisma
model InterviewResponse {
  id            Int       @id @default(autoincrement())
  sessionId     Int       @map("session_id")      // ← Use this, not interviewId
  questionId    Int       @map("question_id")
  userId        Int       @map("user_id")         // ← Required
  videoPath     String    @map("video_path")      // ← Required
  videoUrl      String?   @map("video_url")
  videoSize     Int?      @map("video_size")
  recordingTime Int?      @map("recording_time")
  status        String    @default("processing")  // ← Use 'completed', not 'SUBMITTED'
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
}
```

---

## What Was Fixed

**File**: `server/controllers/interviewController.js`

Changed the `saveRecording` function to use correct schema fields:
- `interviewId` → `sessionId`
- Added `userId` (required field)
- Added `videoPath` (required field)
- `status: 'SUBMITTED'` → `status: 'completed'`
- Removed `submittedAt` (doesn't exist in schema)

---

## How to Test

1. **Restart backend** (to apply changes):
   ```bash
   # In Terminal 1 (Backend), press Ctrl+C
   # Then:
   npm start
   ```

2. **Test recording upload**:
   - Go to Practice Interview
   - Click "Begin Interview"
   - Record a response
   - Stop recording
   - Wait for upload

3. **Expected result**:
   - Progress bar: 0% → 100%
   - Toast: "Response saved!"
   - Next question appears
   - No 500 error ✅

---

## Verification

### Browser Console
Should see:
```
[Practice Interview] Backend sync complete: {
  success: true,
  data: {
    responseId: 123,
    videoUrl: "https://res.cloudinary.com/...",
    message: "Recording saved successfully"
  }
}
```

### Server Logs
Should see:
```
[saveRecording] Found interview {
  interviewId: 123,
  status: 'IN_PROGRESS'
}

[saveRecording] Response created successfully {
  responseId: 456,
  interviewId: 123
}

[saveRecording] Recording saved successfully {
  responseId: 456,
  interviewId: 123,
  userId: 25
}
```

---

## Summary

**Problem**: 500 error on recording upload  
**Cause**: Schema mismatch - code using wrong field names  
**Solution**: Update saveRecording to use correct schema fields  
**Result**: Recording upload should work! ✅

---

**Status**: ✅ Fixed  
**Last Updated**: April 20, 2026
