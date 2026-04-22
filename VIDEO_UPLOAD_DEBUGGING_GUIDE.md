# Video Upload Debugging Guide

## Quick Checklist

When video upload fails, check these in order:

### 1. Check Browser Console
Open DevTools (F12) → Console tab

Look for these logs:
```
[Practice Interview] Starting auto-next pipeline {
  fileName: "response_1234567890.webm",
  fileSize: "2.50MB",
  fileType: "video/webm",
  mimeType: "video/webm;codecs=vp9"
}
```

**What to check:**
- ✅ `fileSize` > 0 (not empty)
- ✅ `fileType` matches `mimeType` (both should be video/webm or video/mp4, etc.)
- ✅ `fileName` has correct extension (.webm, .mp4, etc.)

### 2. Check File Extension Matches MIME Type

| MIME Type | Expected Extension |
|-----------|------------------|
| `video/webm` | `.webm` |
| `video/webm;codecs=vp9` | `.webm` |
| `video/webm;codecs=vp8` | `.webm` |
| `video/mp4` | `.mp4` |
| `video/quicktime` | `.mov` |
| `video/x-msvideo` | `.avi` |
| `video/ogg` | `.ogg` |

### 3. Check Upload Preset Configuration

In Cloudinary Dashboard:
1. Go to Settings → Upload
2. Find upload preset: `simuai_video_preset`
3. Verify:
   - ✅ Type: "Unsigned"
   - ✅ Allowed file types: "Image, Video, Raw"
   - ✅ Resource type: "Auto" or "Video"

### 4. Check Environment Variables

In `client/.env`:
```
REACT_APP_CLOUDINARY_CLOUD_NAME=dm5rf4yzc
REACT_APP_CLOUDINARY_UPLOAD_PRESET_VIDEO=simuai_video_preset
```

### 5. Check Network Request

In DevTools → Network tab:
1. Filter by "video/upload"
2. Click the request
3. Check Response tab for error details

## Common Errors and Fixes

### Error: "Unsupported video format or file"

**Cause**: File extension doesn't match MIME type

**Fix**:
1. Check console logs for actual MIME type
2. Verify file extension matches
3. Try recording in Chrome (best codec support)

**Example**:
```
❌ WRONG: fileName: "response_123.webm", mimeType: "video/mp4"
✅ CORRECT: fileName: "response_123.mp4", mimeType: "video/mp4"
```

### Error: "Video file or blob is required"

**Cause**: FormData not properly sending file

**Fix**:
1. Check that `isBlobReady` is true before upload
2. Verify blob size > 0
3. Check browser console for "Blob created successfully" log

### Error: "Upload preset authentication failed"

**Cause**: Upload preset doesn't exist or is misconfigured

**Fix**:
1. Verify preset name: `simuai_video_preset`
2. Check preset is set to "Unsigned"
3. Verify cloud name: `dm5rf4yzc`

### Error: "Video file too large"

**Cause**: File exceeds 100MB limit

**Fix**:
1. Check file size in console logs
2. Reduce recording duration
3. Use lower quality recording

## Console Log Interpretation

### ✅ Successful Flow

```
[Practice Interview] Recording started with MIME type: video/webm;codecs=vp9
↓
[Practice Interview] Stopping recording
↓
[Practice Interview] MediaRecorder stopped - creating blob
↓
[Practice Interview] Blob created successfully
↓
[Practice Interview] Setting recordedVideo state with blob
↓
[Practice Interview] Marking blob as ready for upload
↓
[Practice Interview] Blob ready - triggering auto-upload
↓
[Direct Upload] Starting video upload to Cloudinary
↓
[Direct Upload] Video upload progress: 100%
↓
[Direct Upload] Video uploaded successfully to Cloudinary
```

### ❌ Failed Flow

```
[Practice Interview] Recording started with MIME type: video/webm;codecs=vp9
↓
[Practice Interview] Stopping recording
↓
[Practice Interview] MediaRecorder stopped - creating blob
↓
[Practice Interview] Blob created successfully
↓
[Practice Interview] Setting recordedVideo state with blob
↓
[Practice Interview] Marking blob as ready for upload
↓
[Practice Interview] Blob ready - triggering auto-upload
↓
[Direct Upload] Starting video upload to Cloudinary
↓
[Direct Upload] Upload attempt 1 failed: {
  status: 400,
  data: { error: { message: "Unsupported video format or file" } }
}
↓
[Direct Upload] 400 Bad Request details: {
  errorMessage: "Unsupported video format or file",
  fileName: "response_123.webm",
  fileType: "video/webm",
  uploadPreset: "simuai_video_preset"
}
```

## Step-by-Step Debugging

### Step 1: Verify Recording
1. Click "Start Recording"
2. Speak for 5 seconds
3. Click "Stop Recording"
4. Check console for: `[Practice Interview] Recording started with MIME type:`

**Expected**: Should see MIME type like `video/webm;codecs=vp9`

### Step 2: Verify Blob Creation
1. After stopping, check console for: `[Practice Interview] Blob created successfully`
2. Look for blob size: `blobSize: "X.XXmb"`

**Expected**: Blob size should be > 0

### Step 3: Verify Blob Ready
1. Check console for: `[Practice Interview] Marking blob as ready for upload`
2. Button should change from "Preparing video..." to "Submit & Next"

**Expected**: Button should be clickable

### Step 4: Verify Upload
1. Click "Submit & Next"
2. Check console for: `[Direct Upload] Starting video upload to Cloudinary`
3. Watch progress: `[Direct Upload] Video upload progress: X%`

**Expected**: Should reach 100% and show success

### Step 5: Check for Errors
1. If upload fails, look for: `[Direct Upload] 400 Bad Request details:`
2. Check `fileName`, `fileType`, `uploadPreset`

**Expected**: All should be correct

## Testing with curl

To test if Cloudinary accepts the format:

```bash
# Create a test video file (WebM format)
ffmpeg -f lavfi -i testsrc=duration=5:size=320x240:rate=1 \
  -f lavfi -i sine=frequency=1000:duration=5 \
  -c:v libvpx -c:a libopus test.webm

# Upload to Cloudinary
curl -X POST \
  -F "file=@test.webm" \
  -F "upload_preset=simuai_video_preset" \
  -F "resource_type=video" \
  https://api.cloudinary.com/v1_1/dm5rf4yzc/video/upload
```

If this works, the issue is with how the browser is creating the video file.

## Browser Compatibility

| Browser | WebM Support | Codec Support |
|---------|-------------|--------------|
| Chrome | ✅ Yes | VP8, VP9 |
| Firefox | ✅ Yes | VP8, VP9 |
| Safari | ❌ No | H.264 only |
| Edge | ✅ Yes | VP8, VP9 |

**Note**: Safari doesn't support WebM. If testing on Safari, use MP4 format.

## Performance Tips

1. **Shorter recordings** = Faster uploads
2. **Lower resolution** = Smaller file size
3. **VP8 codec** = Better compatibility than VP9
4. **WebM format** = Smaller than MP4

## Getting Help

When reporting issues, include:
1. Browser name and version
2. Console logs (copy entire flow)
3. File size and MIME type
4. Error message from Cloudinary
5. Steps to reproduce

Example:
```
Browser: Chrome 120
Error: "Unsupported video format or file"
MIME Type: video/webm;codecs=vp9
File Size: 2.5MB
File Name: response_1234567890.webm
Upload Preset: simuai_video_preset
```
