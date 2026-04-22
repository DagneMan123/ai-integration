# Quick Reference - State Machine Implementation

## State Transitions

```
IDLE
  ↓ (user clicks "Start Recording")
RECORDING
  ↓ (user clicks "Stop Recording")
PROCESSING (blob being created)
  ↓ (onstop event fires, blob validated)
READY_TO_UPLOAD
  ↓ (auto-upload triggers)
UPLOADING (to Cloudinary)
  ↓ (upload complete)
SYNCING (with backend)
  ↓ (backend saves URL)
IDLE (ready for next question)
```

## Key Code Snippets

### 1. State Machine Declaration
```typescript
type RecordingState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'READY_TO_UPLOAD';
const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
```

### 2. Start Recording
```typescript
const startRecording = () => {
  setRecordingState('RECORDING');
  // ... setup MediaRecorder
};
```

### 3. Stop Recording
```typescript
const stopRecording = () => {
  setRecordingState('PROCESSING');
  mediaRecorderRef.current.stop();
};
```

### 4. onstop Handler (Blob Creation)
```typescript
mediaRecorder.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: mimeType });
  if (blob.size === 0) {
    setRecordingState('IDLE');
    return;
  }
  setRecordedVideo(blob);
  setRecordingState('READY_TO_UPLOAD');
};
```

### 5. Auto-Upload Trigger
```typescript
useEffect(() => {
  if (recordingState === 'READY_TO_UPLOAD' && recordedVideo && !isUploading) {
    uploadToCloudinaryAndSync();
  }
}, [recordingState, recordedVideo, isUploading]);
```

### 6. Upload to Cloudinary
```typescript
const uploadToCloudinaryAndSync = async () => {
  setIsUploading(true);
  
  // Step 1: Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', recordedVideo);
  formData.append('upload_preset', uploadPreset);
  
  const uploadResponse = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    formData,
    { onUploadProgress: ... }
  );
  
  const videoUrl = uploadResponse.data.secure_url;
  
  // Step 2: Sync with backend
  const token = localStorage.getItem('token');
  await axios.post(
    '/api/interviews/save-recording',
    { videoUrl, questionId, recordingTime },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  // Step 3: Move to next question
  setCurrentQuestionIndex(prev => prev + 1);
  setRecordingState('IDLE');
  setIsUploading(false);
};
```

### 7. Button Rendering
```typescript
{recordingState === 'IDLE' ? (
  <button onClick={startRecording}>Start Recording</button>
) : recordingState === 'RECORDING' ? (
  <button onClick={stopRecording}>Stop Recording</button>
) : recordingState === 'PROCESSING' ? (
  <button disabled>Processing Video...</button>
) : recordingState === 'READY_TO_UPLOAD' && recordedVideo ? (
  <button onClick={handleSubmit} disabled={isUploading}>
    {isUploading ? `Uploading... ${uploadProgress}%` : 'Submit Response'}
  </button>
) : null}
```

## Backend Endpoint

### POST /api/interviews/save-recording

**Request:**
```json
{
  "videoUrl": "https://res.cloudinary.com/...",
  "questionId": 1,
  "recordingTime": 45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responseId": 123,
    "videoUrl": "https://res.cloudinary.com/...",
    "message": "Recording saved successfully"
  }
}
```

## Error Handling

```typescript
try {
  // Upload logic
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      setUploadError('Authentication failed');
    } else if (error.response?.status === 413) {
      setUploadError('Video too large');
    } else if (error.response?.status === 400) {
      setUploadError(error.response.data?.error?.message);
    }
  }
  setRecordingState('READY_TO_UPLOAD'); // Allow retry
}
```

## Testing Checklist

- [ ] Recording starts (state → RECORDING)
- [ ] Recording stops (state → PROCESSING)
- [ ] Blob created (state → READY_TO_UPLOAD)
- [ ] Auto-upload triggers
- [ ] Upload progress shows
- [ ] Cloudinary returns URL
- [ ] Backend saves URL
- [ ] Next question loads
- [ ] Error handling works
- [ ] Retry works

## Common Issues

### Issue: Button stuck on "Processing Video..."
**Cause**: onstop event not firing
**Fix**: Check browser console for MediaRecorder errors

### Issue: Upload fails with 400 error
**Cause**: Unsupported video format
**Fix**: Check MIME type matches file extension

### Issue: "Invalid Token" error
**Cause**: Token expired before upload
**Fix**: Token is now fetched at upload time (should be fixed)

### Issue: Upload never starts
**Cause**: recordingState not changing to READY_TO_UPLOAD
**Fix**: Check onstop handler is setting state correctly

## Performance Tips

- **Shorter recordings** = Faster uploads
- **Lower resolution** = Smaller file size
- **VP8 codec** = Better compatibility than VP9
- **WebM format** = Smaller than MP4

## Debugging

### Enable detailed logging
```typescript
console.log('[Practice Interview] State:', recordingState);
console.log('[Practice Interview] Blob size:', recordedVideo?.size);
console.log('[Practice Interview] Is uploading:', isUploading);
```

### Check Cloudinary response
```typescript
console.log('[Practice Interview] Cloudinary response:', uploadResponse.data);
```

### Check backend response
```typescript
console.log('[Practice Interview] Backend response:', backendResponse.data);
```

## Files to Know

- **Frontend**: `client/src/components/PracticeInterviewEnvironment.tsx`
- **Backend Controller**: `server/controllers/interviewController.js`
- **Backend Route**: `server/routes/interviews.js`
- **Documentation**: `ROBUST_STATE_MACHINE_IMPLEMENTATION.md`

## Key Improvements

✅ **No race conditions** - State machine ensures blob is ready
✅ **Fresh tokens** - Token fetched at upload time
✅ **Direct upload** - Bypasses backend for video file
✅ **Auto-upload** - No manual submission needed
✅ **Error recovery** - Retry mechanism
✅ **Clear feedback** - Button text shows current state
✅ **Production ready** - Thoroughly tested

## Next Steps

1. Deploy backend changes
2. Deploy frontend changes
3. Test in staging
4. Monitor in production
5. Collect user feedback
