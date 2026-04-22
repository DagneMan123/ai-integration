# Cloudinary Video Corruption - Debugging Guide

## Issue
Video uploads to Cloudinary are being rejected with "Video file is corrupted. Please record again."

## Recent Fixes Applied

### 1. MediaRecorder Lifecycle (PracticeInterviewEnvironment.tsx)
- ✅ Added explicit MIME type detection using `MediaRecorder.isTypeSupported()`
- ✅ Fallback chain: vp9 → vp8 → webm → mp4
- ✅ Blob created with same MIME type used during recording
- ✅ Added `requestData()` call in `stopRecording()` to flush all chunks
- ✅ Validation guard ensures blob exists and has size > 0 before upload

### 2. Upload Service (directCloudinaryUpload.ts)
- ✅ Added proper file extension matching MIME type
- ✅ Retry logic with 3 attempts (1s, 2s delays between attempts)
- ✅ Better error handling for different HTTP status codes
- ✅ Comprehensive logging at each step

## Debugging Steps

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab and look for:
- `[Practice Interview] Recording started with MIME type: video/webm;codecs=vp9` (or similar)
- `[Practice Interview] Blob created successfully` with blob size
- `[Direct Upload] Starting video upload to Cloudinary` with file details
- `[Direct Upload] Video uploaded successfully` or error details

### Step 2: Verify Cloudinary Configuration
Check `client/.env`:
```
REACT_APP_CLOUDINARY_CLOUD_NAME=dm5rf4yzc
REACT_APP_CLOUDINARY_UPLOAD_PRESET_VIDEO=simuai_video_preset
```

**Action Required**: Verify in Cloudinary Dashboard:
1. Go to Settings → Upload
2. Confirm upload preset `simuai_video_preset` exists
3. Check if it's set to "Unsigned" (for upload_preset auth)
4. Verify video resource type is enabled

### Step 3: Test with Different Recording Lengths
- Try recording 5-10 seconds
- Try recording 30+ seconds
- Check if corruption happens at specific durations

### Step 4: Check Network Tab
In DevTools → Network tab:
1. Record a video and submit
2. Look for POST request to `api.cloudinary.com/v1_1/dm5rf4yzc/video/upload`
3. Check:
   - Request Headers: `Content-Type: multipart/form-data`
   - Request Payload: Should show `file` field with video data
   - Response: Should show `secure_url` or error details

### Step 5: Possible Root Causes

#### A. Upload Preset Not Configured
**Symptom**: 401/403 error or "authentication failed"
**Fix**: Create/verify upload preset in Cloudinary Dashboard

#### B. MIME Type Mismatch
**Symptom**: 400 error with "Invalid video format"
**Fix**: Check console logs for MIME type being used
- Should be one of: `video/webm;codecs=vp9`, `video/webm;codecs=vp8`, `video/webm`, `video/mp4`

#### C. Blob Not Fully Finalized
**Symptom**: File appears valid but Cloudinary rejects it
**Fix**: Already implemented `requestData()` call in stopRecording()
- Ensures all chunks are flushed before upload

#### D. File Extension Missing
**Symptom**: Cloudinary can't determine file type
**Fix**: Already implemented - adds `.webm` or `.mp4` extension if missing

#### E. Network/Timeout Issue
**Symptom**: Upload fails after 10+ seconds
**Fix**: Retry logic now handles this with 3 attempts

## Next Steps if Issue Persists

### Option 1: Check Cloudinary Logs
1. Go to Cloudinary Dashboard → Media Library
2. Look for recent uploads
3. Check if files are being uploaded but marked as corrupted
4. Check upload history for error details

### Option 2: Test Direct Upload
Use curl to test Cloudinary directly:
```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/dm5rf4yzc/video/upload \
  -F "file=@test_video.webm" \
  -F "upload_preset=simuai_video_preset"
```

### Option 3: Use Signed Upload (Fallback)
If upload_preset continues to fail, implement signed upload using API key:
```typescript
// Instead of upload_preset, use signature
const signature = generateSignature(timestamp, apiSecret);
formData.append('api_key', apiKey);
formData.append('timestamp', timestamp);
formData.append('signature', signature);
```

### Option 4: Check Browser Compatibility
Test in different browsers:
- Chrome/Edge (Chromium-based)
- Firefox
- Safari

Different browsers may support different codecs.

## Console Output to Collect

When reporting the issue, collect this from browser console:
1. Full `[Practice Interview] Recording started with MIME type:` log
2. Full `[Practice Interview] Blob created successfully` log
3. Full `[Direct Upload] Starting video upload to Cloudinary` log
4. Full error response from Cloudinary (if any)
5. Network tab response from Cloudinary API

## Files Modified
- `client/src/components/PracticeInterviewEnvironment.tsx` - MediaRecorder lifecycle
- `client/src/services/directCloudinaryUpload.ts` - Upload service with retry logic
