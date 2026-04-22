# MediaRecorder Lifecycle - Quick Reference

## State Management

### New State Variable
```typescript
const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
```

**Purpose**: Stores the finalized blob after recording stops

## Recording Lifecycle

### 1. Start Recording
```typescript
startRecording() {
  // CLEANUP: Clear previous data
  chunksRef.current = [];
  setRecordedVideo(null);
  
  // Create MediaRecorder
  const mediaRecorder = new MediaRecorder(stream);
  
  // Setup event handlers
  mediaRecorder.ondataavailable = (event) => {
    // DATA COLLECTION: Push chunks
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };
  
  mediaRecorder.onstop = () => {
    // BLOB CREATION: Create and save blob
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    setRecordedVideo(blob);
  };
  
  mediaRecorder.start();
}
```

### 2. Stop Recording
```typescript
stopRecording() {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    // onstop event will fire and create blob
  }
}
```

### 3. Submit Response
```typescript
submitResponse() {
  // VALIDATION GUARD: Check blob exists
  if (!recordedVideo) {
    toast.error('Recording is still processing. Please wait a second.');
    return;
  }
  
  // Additional validation
  if (recordedVideo.size === 0) {
    toast.error('Video recording is empty. Please record again.');
    return;
  }
  
  // Create file from blob
  const videoFile = new File([recordedVideo], name, type);
  
  // Upload to Cloudinary
  uploadVideoDirectToCloudinary(videoFile);
  
  // CLEANUP: Clear for next recording
  chunksRef.current = [];
  setRecordedVideo(null);
}
```

## Event Handlers

### ondataavailable
**When**: Fires periodically during recording
**What**: Receives audio/video data chunks
**Action**: Push chunk to chunksRef.current

```typescript
mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    chunksRef.current.push(event.data);
  }
};
```

### onstop
**When**: Fires when recording stops
**What**: Recording has ended
**Action**: Create blob and save to state

```typescript
mediaRecorder.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: 'video/webm' });
  setRecordedVideo(blob);
};
```

### onerror
**When**: Fires on recording error
**What**: Error occurred during recording
**Action**: Log error and show message

```typescript
mediaRecorder.onerror = (event) => {
  console.error('Recording error:', event.error);
  toast.error(`Recording error: ${event.error}`);
};
```

## Validation Checks

### Check 1: Chunks Exist
```typescript
if (chunksRef.current.length === 0) {
  console.error('No chunks recorded');
  return;
}
```

### Check 2: Blob Exists
```typescript
if (!recordedVideo) {
  console.error('Blob not created');
  return;
}
```

### Check 3: Blob Has Content
```typescript
if (recordedVideo.size === 0) {
  console.error('Blob is empty');
  return;
}
```

### Check 4: File Created
```typescript
if (!videoFile || videoFile.size === 0) {
  console.error('File creation failed');
  return;
}
```

## Cleanup Steps

### After Successful Upload
```typescript
// Clear chunks array
chunksRef.current = [];

// Clear recorded video state
setRecordedVideo(null);

// Reset recording time
setRecordingTime(0);

// Ready for next recording
```

## Common Issues & Solutions

### Issue: "Recording is still processing"
**Cause**: recordedVideo is null
**Solution**: Wait 1 second for onstop event to fire

### Issue: "Video recording is empty"
**Cause**: recordedVideo.size === 0
**Solution**: Record again, ensure audio/video is captured

### Issue: Upload fails after recording
**Cause**: Blob not properly created
**Solution**: Check console logs for onstop event

### Issue: Can't record second question
**Cause**: Cleanup didn't happen
**Solution**: Verify cleanup code runs after upload

## Debugging Checklist

- [ ] ondataavailable fires during recording
- [ ] Chunks are added to chunksRef.current
- [ ] onstop fires when recording stops
- [ ] Blob is created in onstop
- [ ] recordedVideo state is updated
- [ ] Validation guard passes
- [ ] File is created from blob
- [ ] Upload succeeds
- [ ] Cleanup runs after upload
- [ ] Next recording works

## Console Logs to Check

### Recording Started
```
[Practice Interview] Recording started
```

### Chunks Being Collected
```
[Practice Interview] Chunk added to array
  chunkSize: "64.00KB"
  totalChunks: 1
```

### Recording Stopped
```
[Practice Interview] Recording stopped - waiting for onstop event
```

### Blob Created
```
[Practice Interview] Blob created successfully
  blobSize: "5.23MB"
  blobType: "video/webm"
```

### Blob Saved to State
```
[Practice Interview] Recorded video saved to state
```

### Validation Passed
```
[Practice Interview] Validation passed - proceeding with upload
```

### Upload Complete
```
[Practice Interview] Video uploaded to Cloudinary: https://...
```

### Cleanup Done
```
[Practice Interview] Cleanup complete - ready for next recording
```

## Key Points

1. **Chunks are collected** in `ondataavailable` event
2. **Blob is created** in `onstop` event
3. **Blob is saved** to `recordedVideo` state
4. **Validation checks** if blob exists before upload
5. **Cleanup happens** after successful upload
6. **Next recording** starts with clean state

## State Flow

```
Initial State:
  recordedVideo = null
  chunksRef.current = []

After startRecording():
  recordedVideo = null (waiting for onstop)
  chunksRef.current = [] (cleared)

During Recording:
  recordedVideo = null
  chunksRef.current = [chunk1, chunk2, ...]

After stopRecording():
  recordedVideo = null (waiting for onstop event)
  chunksRef.current = [chunk1, chunk2, ...]

After onstop Event:
  recordedVideo = Blob (finalized)
  chunksRef.current = [chunk1, chunk2, ...]

After submitResponse():
  recordedVideo = null (cleared)
  chunksRef.current = [] (cleared)

Ready for Next Recording:
  recordedVideo = null
  chunksRef.current = []
```

---

**Last Updated**: April 19, 2026
**Status**: PRODUCTION READY
