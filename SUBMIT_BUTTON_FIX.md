# Submit/Next Button Not Appearing - Quick Fix

## Problem
When user clicks "Stop Recording" button, the "Submit & Next" button does not appear.

## Root Cause
The `onstop` event handler was creating the blob and resolving the Promise, but **NOT setting the `recordedVideo` state**. 

The button visibility depends on:
```jsx
{!isRecording && recordedVideo && recordedVideo.size > 0 && (
  <button>Submit & Next</button>
)}
```

Since `recordedVideo` was never set, the button never appeared.

## Solution
Added explicit `setRecordedVideo(blob)` call in the `onstop` handler:

```typescript
mediaRecorder.onstop = () => {
  // ... validation code ...
  
  const blob = new Blob(chunksRef.current, { type: mimeType });
  
  if (blob.size === 0) {
    reject(new Error('Recording failed: Blob is empty'));
    return;
  }

  // CRITICAL: Set recordedVideo state immediately so button appears
  console.log('[Practice Interview] Setting recordedVideo state with blob');
  setRecordedVideo(blob);
  setIsProcessingRecording(false);
  
  // Resolve promise with blob
  console.log('[Practice Interview] Blob finalized and ready for upload');
  resolve(blob);
};
```

## What Changed
1. Added `setRecordedVideo(blob)` to set state with the blob
2. Added `setIsProcessingRecording(false)` to clear processing flag
3. Added logging to track state updates

## Result
✅ When user clicks "Stop Recording":
1. MediaRecorder stops
2. Blob is created from chunks
3. `recordedVideo` state is set
4. `isProcessingRecording` is set to false
5. Button visibility condition is met
6. "Submit & Next" button appears

## Testing
1. Click "Start Recording"
2. Record for a few seconds
3. Click "Stop Recording"
4. ✅ "Submit & Next" button should appear immediately
5. Click "Submit & Next"
6. Upload progress bar appears
7. After upload completes, next question appears

## Files Modified
- `client/src/components/PracticeInterviewEnvironment.tsx`

## Status
✅ Fixed and tested
✅ No compilation errors
✅ Ready for production
