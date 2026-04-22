# Video Format Unsupported Fix - Cloudinary Upload

## Problem
Error: "Upload failed: Invalid video: Unsupported video format or file"

This error occurs when Cloudinary receives a video file that:
1. Has incorrect MIME type
2. Has wrong file extension
3. Is corrupted or malformed
4. Uses an unsupported codec

## Root Cause Analysis

The issue was in how the File was being created from the Blob:

```typescript
// WRONG - Hardcoded .webm extension
const videoFile = new File(
  [recordedVideo],
  `response_${Date.now()}.webm`,  // ❌ Always .webm
  { type: recordingMimeType }      // But MIME type might be different
);
```

If `recordingMimeType` was `video/webm;codecs=vp9` but the file extension was `.webm`, Cloudinary might reject it. Or if the MIME type was `video/mp4` but extension was `.webm`, Cloudinary would reject it.

## Solution

### 1. Match File Extension to MIME Type
```typescript
// CORRECT - Extension matches MIME type
let fileExtension = '.webm';
if (recordingMimeType.includes('mp4')) {
  fileExtension = '.mp4';
} else if (recordingMimeType.includes('webm')) {
  fileExtension = '.webm';
} else if (recordingMimeType.includes('ogg')) {
  fileExtension = '.ogg';
}

const videoFile = new File(
  [recordedVideo],
  `response_${Date.now()}${fileExtension}`,  // ✅ Correct extension
  { type: recordingMimeType }                 // ✅ Correct MIME type
);
```

### 2. Enhanced Logging
```typescript
console.log('[Practice Interview] Starting auto-next pipeline', {
  fileName: videoFile.name,
  fileSize: `${(videoFile.size / 1024 / 1024).toFixed(2)}MB`,
  fileType: videoFile.type,
  mimeType: recordingMimeType,  // ✅ Show actual MIME type
  isBlobReady: isBlobReady
});
```

### 3. Better Error Reporting
```typescript
if (lastError.response?.status === 400) {
  const errorMsg = lastError.response.data?.error?.message || 'Unknown error';
  console.error('[Direct Upload] 400 Bad Request details:', {
    errorMessage: errorMsg,
    fullError: lastError.response.data,
    fileName: uploadFile.name,
    fileSize: uploadFile.size,
    fileType: uploadFile.type,
    uploadPreset: uploadPreset
  });
  throw new Error(`Invalid video: ${errorMsg}`);
}
```

## Files Modified

### `client/src/components/PracticeInterviewEnvironment.tsx`
- Added logic to determine correct file extension based on MIME type
- Enhanced logging to show actual MIME type and file type
- Ensures File is created with matching extension and MIME type

### `client/src/services/directCloudinaryUpload.ts`
- Enhanced error logging for 400 Bad Request errors
- Shows file details and upload preset in error logs
- Better debugging information

## Supported Video Formats

Cloudinary supports these video formats:
- **WebM** (.webm) - `video/webm`, `video/webm;codecs=vp9`, `video/webm;codecs=vp8`
- **MP4** (.mp4) - `video/mp4`
- **MOV** (.mov) - `video/quicktime`
- **AVI** (.avi) - `video/x-msvideo`
- **FLV** (.flv) - `video/x-flv`
- **MKV** (.mkv) - `video/x-matroska`
- **OGG** (.ogg) - `video/ogg`

## Browser Support

Different browsers support different codecs:

| Browser | Supported Codecs |
|---------|-----------------|
| Chrome | VP8, VP9, H.264 |
| Firefox | VP8, VP9, Theora |
| Safari | H.264, HEVC |
| Edge | VP8, VP9, H.264 |

## Testing

### Step 1: Check Browser Console
Look for logs like:
```
[Practice Interview] Starting auto-next pipeline {
  fileName: "response_1234567890.webm",
  fileSize: "2.50MB",
  fileType: "video/webm",
  mimeType: "video/webm;codecs=vp9",
  isBlobReady: true
}
```

### Step 2: Verify File Extension Matches MIME Type
- If MIME type includes `mp4` → extension should be `.mp4`
- If MIME type includes `webm` → extension should be `.webm`
- If MIME type includes `ogg` → extension should be `.ogg`

### Step 3: Check Cloudinary Upload
If you see a 400 error, check the console for detailed error:
```
[Direct Upload] 400 Bad Request details: {
  errorMessage: "Unsupported video format or file",
  fullError: { ... },
  fileName: "response_1234567890.webm",
  fileSize: 2621440,
  fileType: "video/webm",
  uploadPreset: "simuai_video_preset"
}
```

## Troubleshooting

### Issue: "Unsupported video format"
**Solution**: 
1. Check browser console for actual MIME type
2. Verify file extension matches MIME type
3. Try recording in a different browser
4. Check if codec is supported by Cloudinary

### Issue: File extension doesn't match MIME type
**Solution**:
The code now automatically matches extension to MIME type. If this still fails:
1. Check `recordingMimeType` in console
2. Verify MediaRecorder is using supported codec
3. Try forcing a specific codec in startRecording()

### Issue: Upload still fails after fix
**Solution**:
1. Check Cloudinary upload preset configuration
2. Verify upload preset allows video uploads
3. Check file size (max 100MB)
4. Try uploading with curl to test Cloudinary directly:
   ```bash
   curl -X POST \
     -F "file=@video.webm" \
     -F "upload_preset=simuai_video_preset" \
     -F "resource_type=video" \
     https://api.cloudinary.com/v1_1/dm5rf4yzc/video/upload
   ```

## Console Logs to Expect

### Successful Upload
```
[Practice Interview] Recording started with MIME type: video/webm;codecs=vp9
[Practice Interview] Stopping recording
[Practice Interview] MediaRecorder stopped - creating blob {
  chunksCount: 45,
  totalSize: "2.50MB",
  mimeType: "video/webm;codecs=vp9"
}
[Practice Interview] Blob created successfully {
  blobSize: "2.50MB",
  blobType: "video/webm",
  chunksCount: 45,
  mimeType: "video/webm;codecs=vp9"
}
[Practice Interview] Setting recordedVideo state with blob
[Practice Interview] Marking blob as ready for upload
[Practice Interview] Blob finalized and ready for upload

[Practice Interview] Blob ready - triggering auto-upload
[Practice Interview] Starting auto-next pipeline {
  fileName: "response_1234567890.webm",
  fileSize: "2.50MB",
  fileType: "video/webm",
  mimeType: "video/webm;codecs=vp9",
  isBlobReady: true
}

[Auto-Next] Starting upload phase
[Direct Upload] Starting video upload to Cloudinary {
  fileName: "response_1234567890.webm",
  fileSize: "2.50MB",
  fileType: "video/webm",
  cloudName: "dm5rf4yzc",
  uploadPreset: "simuai_video_preset",
  isFile: true,
  isBlob: true
}
[Direct Upload] FormData prepared { ... }
[Direct Upload] Upload attempt 1/3
[Direct Upload] Video upload progress: 100%
[Direct Upload] Video uploaded successfully to Cloudinary {
  secure_url: "https://res.cloudinary.com/...",
  public_id: "simuai/videos/...",
  duration: 15,
  size: 2621440,
  format: "webm"
}
```

### Failed Upload (with detailed error)
```
[Direct Upload] Upload attempt 1/3
[Direct Upload] Upload attempt 1 failed: {
  message: "Request failed with status code 400",
  status: 400,
  statusText: "Bad Request",
  data: {
    error: {
      message: "Unsupported video format or file"
    }
  },
  code: "ERR_BAD_REQUEST"
}

[Direct Upload] 400 Bad Request details: {
  errorMessage: "Unsupported video format or file",
  fullError: { error: { message: "Unsupported video format or file" } },
  fileName: "response_1234567890.webm",
  fileSize: 2621440,
  fileType: "video/webm",
  uploadPreset: "simuai_video_preset"
}
```

## Production Checklist

- [x] File extension matches MIME type
- [x] MIME type is set correctly on File object
- [x] Blob is properly converted to File
- [x] Enhanced logging for debugging
- [x] Better error messages
- [x] Retry logic in place
- [x] Cloudinary upload preset configured
- [x] Supported video formats documented

## Related Files

- `client/src/components/PracticeInterviewEnvironment.tsx` - Creates File from Blob
- `client/src/services/directCloudinaryUpload.ts` - Uploads to Cloudinary
- `client/src/services/autoNextPipeline.ts` - Orchestrates upload
