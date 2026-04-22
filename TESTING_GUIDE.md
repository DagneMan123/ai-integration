# Video Interview State Machine - Testing Guide

## Quick Start Testing

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Cloudinary credentials configured in `.env`
- User logged in as candidate

### Test Scenario 1: Complete Recording Flow

**Steps**:
1. Navigate to Practice Interview
2. Click "Start Recording"
   - ✅ Button changes to "Stop Recording"
   - ✅ Recording timer starts
   - ✅ Microphone volume indicator shows activity

3. Speak for 10-15 seconds
4. Click "Stop Recording"
   - ✅ Button changes to "Processing Video..."
   - ✅ Button is disabled (cannot click)
   - ✅ Console shows: "[Practice Interview] MediaRecorder stopped - creating blob"

5. Wait 1-2 seconds
   - ✅ Button changes to "Submit Response"
   - ✅ Console shows: "[Practice Interview] Blob ready for upload"
   - ✅ Console shows: "[Practice Interview] Starting Cloudinary upload"

6. Upload progress bar appears
   - ✅ Progress: 0% → 100%
   - ✅ Button shows "Uploading... X%"

7. Upload completes
   - ✅ Toast: "Response saved!"
   - ✅ Next question appears
   - ✅ Button resets to "Start Recording"
   - ✅ Console shows: "[Practice Interview] Backend sync complete"

---

### Test Scenario 2: Error Recovery

**Steps**:
1. Start recording and stop
2. Simulate network error (DevTools → Network → Offline)
3. Wait for upload to fail
   - ✅ Toast: "Upload failed: Network Error"
   - ✅ "Retry Upload" button appears
   - ✅ Blob is preserved in state

4. Go back online (DevTools → Network → Online)
5. Click "Retry Upload"
   - ✅ Upload starts again
   - ✅ Progress bar appears
   - ✅ Upload completes successfully

---

### Test Scenario 3: Token Injection

**Steps**:
1. Open DevTools → Application → Local Storage
2. Note the `token` value
3. Start recording and stop
4. Watch the upload request in DevTools → Network
5. Click on the `/save-recording` request
   - ✅ Headers include: `Authorization: Bearer {token}`
   - ✅ Token matches localStorage value
   - ✅ Content-Type: `application/json`

---

### Test Scenario 4: Multiple Questions

**Steps**:
1. Complete first question (record, upload, next)
2. Complete second question (record, upload, next)
3. Complete all questions
   - ✅ Progress bar updates: Q1/10 → Q2/10 → ... → Q10/10
   - ✅ Each response saved with correct questionId
   - ✅ Session ends after last question

---

## Console Logging Reference

### Successful Flow
```
[Practice Interview] Starting recording - chunks cleared
[Practice Interview] MediaRecorder MIME type selected: video/webm;codecs=vp9
[Practice Interview] Recording started
[Practice Interview] Stopping recording
[Practice Interview] Recording stopped - waiting for onstop event
[Practice Interview] MediaRecorder stopped - creating blob
[Practice Interview] Blob created successfully
[Practice Interview] Blob ready for upload
[Practice Interview] Blob ready - triggering auto-upload
[Practice Interview] Starting Cloudinary upload
[Practice Interview] Uploading to Cloudinary
[Practice Interview] Upload progress: 50%
[Practice Interview] Upload progress: 100%
[Practice Interview] Cloudinary upload complete: https://...
[Practice Interview] Syncing with backend
[Practice Interview] Calling backend endpoint
[Practice Interview] Backend sync complete
[Practice Interview] All questions completed
```

### Error Cases
```
[Practice Interview] No blob available
[Practice Interview] Camera not initialized
[Practice Interview] Upload error: 401 Unauthorized
[Practice Interview] Upload error: 413 Payload Too Large
[Practice Interview] Upload error: Network Error
```

---

## Backend Verification

### Check Route Registration
```bash
# In server logs, should see:
POST /api/interviews/save-recording - Route registered
```

### Check Request Handling
```bash
# In server logs, should see:
[saveRecording] Request received
[saveRecording] Found interview
[saveRecording] Response created successfully
```

### Check Database
```bash
# Query InterviewResponse table
SELECT * FROM InterviewResponse 
WHERE interviewId = {interviewId}
ORDER BY submittedAt DESC;

# Should show:
- videoUrl: https://res.cloudinary.com/...
- questionId: {questionId}
- recordingTime: {seconds}
- status: SUBMITTED
- submittedAt: {timestamp}
```

---

## Performance Metrics

### Expected Timings
- Recording start: < 100ms
- Recording stop: < 50ms
- Blob creation: < 500ms
- Cloudinary upload (1MB): 2-5 seconds
- Backend sync: < 500ms
- Total flow: 3-6 seconds

### File Sizes
- Typical 15-second recording: 500KB - 2MB
- Maximum allowed: 100MB
- Cloudinary limit: 100MB

---

## Troubleshooting

### Issue: "Cannot find name 'questionId'"
**Solution**: Already fixed. Component uses `currentQuestion.id`

### Issue: "404 on /api/interviews/save-recording"
**Solution**: Route order is correct. Check:
1. Backend is running
2. Route is registered before parameterized routes
3. Token is valid (401 vs 404)

### Issue: "Invalid Token"
**Solution**: Token is fetched at upload time. Check:
1. localStorage has 'token' key
2. Token is not expired
3. User is authenticated

### Issue: "Blob is null"
**Solution**: State machine ensures blob is ready. Check:
1. recordingState is READY_TO_UPLOAD
2. recordedVideo is not null
3. onstop event fired successfully

### Issue: "Unsupported video format"
**Solution**: MIME type detection is automatic. Check:
1. Browser supports MediaRecorder
2. MIME type is video/webm or video/mp4
3. File extension matches MIME type

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 49+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ✅ Edge 79+

### Required APIs
- MediaRecorder API
- getUserMedia API
- Blob API
- FormData API
- Fetch/Axios API

---

## Security Checklist

- ✅ Token fetched at request time (not initialization)
- ✅ Token attached to backend request
- ✅ HTTPS required for production
- ✅ CORS configured for Cloudinary
- ✅ File size validated (max 100MB)
- ✅ MIME type validated
- ✅ User ownership verified on backend

---

## Success Criteria

All of the following should be true:

1. ✅ Recording starts and stops without errors
2. ✅ Blob is created after stop
3. ✅ Auto-upload triggers when blob is ready
4. ✅ Progress bar shows upload progress
5. ✅ Backend receives videoUrl and questionId
6. ✅ InterviewResponse record created in database
7. ✅ Next question appears after upload
8. ✅ All 10 questions can be completed
9. ✅ Session ends after last question
10. ✅ Error recovery works (retry button)

---

## Production Deployment

Before deploying to production:

1. ✅ All tests pass
2. ✅ No console errors
3. ✅ No TypeScript compilation errors
4. ✅ Cloudinary credentials configured
5. ✅ Backend /save-recording route tested
6. ✅ Token injection verified
7. ✅ Error handling tested
8. ✅ Performance metrics acceptable
9. ✅ Security checklist passed
10. ✅ Database schema includes InterviewResponse table

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Check browser DevTools → Network tab
3. Check server logs for backend errors
4. Verify Cloudinary credentials
5. Verify database connection
6. Check token validity
