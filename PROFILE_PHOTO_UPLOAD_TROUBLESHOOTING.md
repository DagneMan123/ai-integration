# Profile Photo Upload - Troubleshooting & Fix

## Issue
Error: "Please upload a file" when trying to upload profile photo

## Root Cause
The axios instance was forcing `Content-Type: application/json` header for all requests, including FormData uploads. When sending FormData, the browser needs to set `Content-Type: multipart/form-data` automatically with the boundary parameter.

## Solution Applied

### 1. Fixed Request Interceptor (client/src/utils/api.ts)
```typescript
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2. Added Debug Logging (client/src/pages/candidate/Profile.tsx)
Added console logs to help debug file upload issues:
- File selection confirmation
- File details (name, type, size)
- FormData creation confirmation
- Upload response logging
- Error logging

## How to Test

1. **Open Browser DevTools** (F12)
2. **Go to Profile Settings**
3. **Click Camera Icon**
4. **Select a PNG or JPG image**
5. **Check Console for logs:**
   - "File selected: [filename] [type] [size]"
   - "FormData created, sending to server..."
   - "Upload response: [response data]"

## Expected Flow

```
User clicks camera icon
    ↓
File input dialog opens
    ↓
User selects image
    ↓
handlePhotoUpload triggered
    ↓
File validation (type & size)
    ↓
FormData created with file
    ↓
API call with FormData
    ↓
Request interceptor removes Content-Type header
    ↓
Browser sets multipart/form-data header
    ↓
Server receives file via multer
    ↓
File uploaded to cloud storage
    ↓
Avatar URL returned
    ↓
User store updated
    ↓
Photo displays in profile

```

## Server-Side (Already Configured)

**Route:** `POST /api/users/avatar`
**Middleware:** `upload.single('avatar')`
**Storage:** Memory storage (multer)
**File Filter:** JPEG, JPG, PNG only
**Size Limit:** 5MB

## Common Issues & Solutions

### Issue: "Please upload a file"
**Cause:** File not being sent in FormData
**Solution:** 
- Check browser console for logs
- Verify file is selected
- Check network tab to see if file is in request body

### Issue: "Invalid file type"
**Cause:** File is not PNG or JPG
**Solution:**
- Only select PNG or JPG files
- Check file extension and MIME type

### Issue: "File size must be less than 5MB"
**Cause:** Selected file is too large
**Solution:**
- Compress image before uploading
- Use online image compressor

### Issue: Photo doesn't display after upload
**Cause:** Avatar URL not being saved to auth store
**Solution:**
- Check console for upload response
- Verify avatarUrl is in response
- Check if updateUser is being called

## Files Modified

1. **client/src/utils/api.ts**
   - Added FormData detection in request interceptor
   - Removes Content-Type header for FormData

2. **client/src/pages/candidate/Profile.tsx**
   - Added debug console logs
   - Improved error handling

## Testing Checklist

- [ ] File input accepts only PNG/JPG
- [ ] File size validation works (5MB limit)
- [ ] Console shows file selection logs
- [ ] Console shows FormData creation
- [ ] Network tab shows multipart/form-data request
- [ ] Server receives file without "Please upload a file" error
- [ ] Avatar URL is returned in response
- [ ] Photo displays in profile after upload
- [ ] Photo persists after page refresh

## Next Steps

1. Test the upload with a valid image file
2. Check browser console for debug logs
3. Check network tab to verify request format
4. If still failing, check server logs for multer errors
5. Verify cloud storage configuration (currently using mock URLs)

## Production Considerations

The current implementation uses mock cloud storage URLs. For production:
1. Configure AWS S3, Cloudinary, or similar
2. Update `server/utils/cloudStorage.js` with real upload logic
3. Ensure proper error handling for cloud storage failures
4. Add retry logic for failed uploads
5. Implement image optimization/compression
