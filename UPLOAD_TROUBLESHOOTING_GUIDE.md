# Cloudinary Upload - Troubleshooting Guide

## Quick Diagnostics

### Issue: "Please record an answer first"
**Cause**: No video chunks recorded
**Solution**:
1. Click "Start Recording"
2. Speak clearly for at least 5 seconds
3. Click "Stop Recording"
4. Click "Submit & Next"

**Check in Console**:
```javascript
// Should show chunks
console.log(chunksRef.current.length) // Should be > 0
```

---

### Issue: "Video recording failed. Please try again."
**Cause**: Blob is empty or invalid
**Solution**:
1. Check browser console for error details
2. Try recording again
3. Ensure microphone is working
4. Check browser permissions for camera/microphone

**Check in Console**:
```javascript
// Should show blob size > 0
console.log('Blob size:', recordedVideoBlob.size)
console.log('Blob type:', recordedVideoBlob.type)
```

---

### Issue: "Video file is missing or empty"
**Cause**: File object creation failed
**Solution**:
1. Check if blob was created successfully
2. Try recording again
3. Check browser console for detailed error

**Check in Console**:
```javascript
// Should show file details
console.log('File name:', videoFile.name)
console.log('File size:', videoFile.size)
console.log('File type:', videoFile.type)
```

---

### Issue: "Invalid video: ..."
**Cause**: Video format not supported by Cloudinary
**Solution**:
1. Ensure browser supports WebM codec
2. Try different browser (Chrome, Firefox, Edge)
3. Check video format in console

**Supported Formats**:
- ✅ WebM (vp9 codec)
- ✅ MP4
- ✅ MOV
- ✅ AVI

**Check in Console**:
```javascript
// Should show video/webm
console.log('Video type:', recordedVideoBlob.type)
```

---

### Issue: "Video file too large. Maximum size is 100MB"
**Cause**: Video exceeds 100MB limit
**Solution**:
1. Record shorter video (< 5 minutes)
2. Use lower resolution camera
3. Check file size in console

**Check in Console**:
```javascript
// Should be < 100MB
console.log('File size MB:', videoFile.size / 1024 / 1024)
```

---

### Issue: "Upload timeout. Please try again with a smaller file"
**Cause**: Network timeout or very large file
**Solution**:
1. Check internet connection
2. Try with smaller video
3. Try again later
4. Check network tab in DevTools

**Check in DevTools**:
1. Open DevTools (F12)
2. Go to Network tab
3. Look for upload request
4. Check if it times out

---

### Issue: Upload stuck at 0%
**Cause**: Network issue or FormData problem
**Solution**:
1. Check internet connection
2. Refresh page and try again
3. Check browser console for errors

**Check in Console**:
```javascript
// Should show upload progress
// [Direct Upload] Video upload progress: 25%
// [Direct Upload] Video upload progress: 50%
// etc.
```

---

### Issue: Upload completes but video not saved
**Cause**: Backend save failed
**Solution**:
1. Check if token is valid
2. Check backend logs
3. Verify database connection

**Check in Console**:
```javascript
// Should show successful save
// [Practice Interview] Video uploaded to Cloudinary: https://...
```

---

## Debug Checklist

### Before Recording
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Browser supports WebM (Chrome, Firefox, Edge)
- [ ] Internet connection working

### During Recording
- [ ] Recording indicator shows (red dot)
- [ ] Recording time increases
- [ ] Microphone volume bar shows activity

### After Recording
- [ ] Stop button clicked
- [ ] Submit button appears
- [ ] Console shows blob created

### During Upload
- [ ] Upload progress shows (0% → 100%)
- [ ] Console shows upload progress
- [ ] Network tab shows POST request

### After Upload
- [ ] Success toast appears
- [ ] Video URL in console
- [ ] Next question loads
- [ ] Database shows response

---

## Console Logging Guide

### Enable Detailed Logging
Open browser console (F12) and look for these logs:

**Recording Phase**:
```
[Practice Interview] Video blob created successfully
  blobSize: "5.23MB"
  blobType: "video/webm"
  chunksCount: 42

[Practice Interview] File object created
  fileName: "response_1713607200000.webm"
  fileSize: "5.23MB"
  fileType: "video/webm"
```

**Upload Phase**:
```
[Direct Upload] Starting video upload to Cloudinary
  fileName: "response_1713607200000.webm"
  fileSize: "5.23MB"
  cloudName: "dm5rf4yzc"
  uploadPreset: "simuai_video_preset"

[Direct Upload] FormData prepared with file key
  hasFile: true
  hasPreset: true
  hasResourceType: true

[Direct Upload] Video upload progress: 25%
[Direct Upload] Video upload progress: 50%
[Direct Upload] Video upload progress: 75%
[Direct Upload] Video upload progress: 100%

[Direct Upload] Video uploaded successfully to Cloudinary
  secure_url: "https://res.cloudinary.com/..."
  public_id: "simuai/videos/..."
  duration: 45
  size: 5485568
```

**Save Phase**:
```
[Practice Interview] Video uploaded to Cloudinary: https://res.cloudinary.com/...
```

---

## Network Debugging

### Check Upload Request
1. Open DevTools (F12)
2. Go to Network tab
3. Start recording
4. Click "Submit & Next"
5. Look for POST request to `api.cloudinary.com`

**Expected Request**:
```
POST https://api.cloudinary.com/v1_1/dm5rf4yzc/video/upload
Content-Type: multipart/form-data

Form Data:
- file: (binary)
- upload_preset: simuai_video_preset
- resource_type: video
- folder: simuai/videos
- public_id: simuai_video_...
```

**Expected Response**:
```
Status: 200 OK
{
  "secure_url": "https://res.cloudinary.com/...",
  "public_id": "simuai/videos/...",
  "duration": 45,
  "bytes": 5485568,
  "format": "webm",
  "resource_type": "video"
}
```

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ Safari 14.1+

### Not Supported
- ❌ Internet Explorer
- ❌ Opera Mini
- ❌ Very old mobile browsers

**Check Browser Support**:
```javascript
// In browser console
console.log('MediaRecorder:', typeof MediaRecorder)
console.log('getUserMedia:', typeof navigator.mediaDevices?.getUserMedia)
console.log('AudioContext:', typeof (window.AudioContext || window.webkitAudioContext))
```

---

## Performance Tips

### Optimize Recording
1. Use good lighting
2. Speak clearly
3. Avoid background noise
4. Keep video under 5 minutes
5. Use 720p resolution (not 1080p)

### Optimize Upload
1. Check internet speed (> 5 Mbps recommended)
2. Close other apps using bandwidth
3. Use wired connection if possible
4. Try during off-peak hours

### Check Performance
```javascript
// In browser console
// Measure upload time
const start = performance.now()
// ... upload ...
const end = performance.now()
console.log('Upload time:', (end - start) / 1000, 'seconds')
```

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check video format, try again |
| 401 | Unauthorized | Check upload preset, check token |
| 413 | Payload Too Large | Reduce video size |
| 429 | Too Many Requests | Wait and try again |
| 500 | Server Error | Try again later |
| 503 | Service Unavailable | Try again later |
| TIMEOUT | Request Timeout | Check internet, try smaller file |

---

## Contact Support

If issue persists:
1. Collect console logs (copy all [Direct Upload] and [Practice Interview] logs)
2. Note browser and OS
3. Note video size and duration
4. Note internet speed
5. Contact support with this information

---

**Last Updated**: April 19, 2026
**Status**: PRODUCTION READY
