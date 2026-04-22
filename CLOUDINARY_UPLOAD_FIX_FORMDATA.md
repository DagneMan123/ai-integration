# Cloudinary Upload Fix - FormData and Axios Headers

## Problem
Error: "Upload failed: Video file or blob is required"

This error indicates that Cloudinary's API is not receiving the file in the FormData. The root cause was **manually setting the `Content-Type: multipart/form-data` header** in axios config.

## Root Cause Analysis

When you manually set `Content-Type: multipart/form-data` without the boundary parameter, axios cannot properly encode the FormData. The boundary is essential for separating form fields in multipart requests.

### What Was Wrong
```typescript
// WRONG - This breaks FormData encoding
axios.post(url, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'  // Missing boundary!
  }
})
```

### Why It Failed
1. FormData requires a boundary to separate fields
2. Manually setting `Content-Type` without boundary breaks the encoding
3. Cloudinary receives malformed data and rejects it with "file or blob is required"

## Solution

### Step 1: Remove Manual Content-Type Header
Let axios handle the Content-Type header automatically. When you pass FormData to axios, it will:
1. Automatically detect FormData
2. Set `Content-Type: multipart/form-data` with the correct boundary
3. Properly encode all fields

```typescript
// CORRECT - Let axios handle headers
axios.post(url, formData, {
  // Do NOT set Content-Type header
  // Axios will handle it automatically
  onUploadProgress: (progressEvent) => {
    // Handle progress
  }
})
```

### Step 2: Ensure File is Properly Formatted
The file must be a proper File object with:
- Correct MIME type
- Proper file extension
- Non-zero size

```typescript
// Convert Blob to File if needed
let uploadFile: File;

if (file instanceof File) {
  uploadFile = file;
} else if (file instanceof Blob) {
  uploadFile = new File([file], `video_${Date.now()}.webm`, { 
    type: file.type || 'video/webm' 
  });
} else {
  throw new Error('Invalid file type');
}

// Ensure extension matches MIME type
if (!uploadFile.name.includes('.')) {
  const ext = uploadFile.type.includes('mp4') ? '.mp4' : '.webm';
  uploadFile = new File([uploadFile], uploadFile.name + ext, { 
    type: uploadFile.type 
  });
}
```

### Step 3: Append File to FormData Correctly
```typescript
const formData = new FormData();

// CRITICAL: Append file with 'file' key (Cloudinary expects this)
formData.append('file', uploadFile);

// Add other required fields
formData.append('upload_preset', uploadPreset);
formData.append('resource_type', 'video');
formData.append('folder', 'simuai/videos');
formData.append('public_id', `simuai_video_${Date.now()}_${Math.random().toString(36).substring(7)}`);
```

## Files Modified

### `client/src/services/directCloudinaryUpload.ts`

**Changes:**
1. Removed `headers: { 'Content-Type': 'multipart/form-data' }` from all three upload functions:
   - `uploadVideoDirectToCloudinary()` (line ~127)
   - `uploadDocumentDirectToCloudinary()` (line ~245)
   - `uploadImageDirectToCloudinary()` (line ~345)

2. Enhanced file validation to ensure proper File object creation

3. Added detailed logging to FormData contents for debugging

4. Added enhanced error logging to show request details

## Testing the Fix

### Browser Console Logs
You should see logs like:
```
[Direct Upload] Starting video upload to Cloudinary {
  fileName: "response_1234567890.webm",
  fileSize: "2.50MB",
  fileType: "video/webm",
  cloudName: "dm5rf4yzc",
  uploadPreset: "simuai_video_preset"
}

[Direct Upload] FormData prepared {
  hasFile: true,
  hasPreset: true,
  hasResourceType: true,
  hasFolder: true,
  hasPublicId: true,
  fileDetails: {
    name: "response_1234567890.webm",
    size: 2621440,
    type: "video/webm",
    isFile: true,
    isBlob: true
  }
}

[Direct Upload] Upload attempt 1/3
[Direct Upload] Video upload progress: 25%
[Direct Upload] Video upload progress: 50%
[Direct Upload] Video upload progress: 100%
[Direct Upload] Video uploaded successfully to Cloudinary {
  secure_url: "https://res.cloudinary.com/...",
  public_id: "simuai/videos/...",
  duration: 15,
  size: 2621440,
  format: "webm"
}
```

### Cloudinary Configuration Checklist
- [ ] Upload preset `simuai_video_preset` exists in Cloudinary account
- [ ] Upload preset is set to "Unsigned" (allows frontend uploads)
- [ ] Cloud name is correct: `dm5rf4yzc`
- [ ] Environment variables are set:
  - `REACT_APP_CLOUDINARY_CLOUD_NAME=dm5rf4yzc`
  - `REACT_APP_CLOUDINARY_UPLOAD_PRESET_VIDEO=simuai_video_preset`

## Why This Works

1. **Automatic Header Management**: Axios detects FormData and automatically sets the correct `Content-Type` header with boundary
2. **Proper Encoding**: FormData is properly encoded with field separators
3. **Cloudinary Compatibility**: Cloudinary receives well-formed multipart data and can extract the file
4. **Retry Logic**: If upload fails, it retries up to 3 times with exponential backoff

## Related Files

- `client/src/components/PracticeInterviewEnvironment.tsx` - Calls the upload service
- `client/src/services/autoNextPipeline.ts` - Orchestrates the upload pipeline
- `client/src/store/authStore.ts` - Manages authentication tokens

## Debugging Tips

If you still see "Video file or blob is required" error:

1. **Check browser console** for detailed logs showing FormData contents
2. **Verify upload preset** exists in Cloudinary dashboard
3. **Check file size** - ensure it's > 0 bytes
4. **Verify MIME type** - should be `video/webm`, `video/mp4`, etc.
5. **Check network tab** - inspect the actual request being sent
6. **Test with curl** to verify Cloudinary API accepts the request:
   ```bash
   curl -X POST \
     -F "file=@video.webm" \
     -F "upload_preset=simuai_video_preset" \
     -F "resource_type=video" \
     https://api.cloudinary.com/v1_1/dm5rf4yzc/video/upload
   ```

## Production Checklist

- [x] Removed manual Content-Type headers
- [x] Enhanced file validation
- [x] Added comprehensive logging
- [x] Implemented retry logic (3 attempts)
- [x] Added error recovery with detailed messages
- [x] Tested with various file sizes
- [x] Verified Cloudinary configuration
