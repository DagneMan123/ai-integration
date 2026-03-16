# Profile Photo Upload - Final Fix ✅

## Issues Fixed

### 1. Database Schema Mismatch
**Problem:** Code was using `avatar` field but Prisma schema defines `profilePicture`
**Solution:** Updated all references to use `profilePicture` (the correct field name)

### 2. FormData Content-Type Header
**Problem:** Axios was forcing `Content-Type: application/json` on FormData requests
**Solution:** Request interceptor now detects FormData and removes the header, allowing browser to set `multipart/form-data`

### 3. Type Definition Mismatch
**Problem:** Frontend types defined `avatar` but database uses `profilePicture`
**Solution:** Updated User interface to use `profilePicture?: string`

## Files Modified

### Backend
1. **server/controllers/userController.js**
   - Changed `data: { avatar: avatarUrl }` → `data: { profilePicture: avatarUrl }`

### Frontend
1. **client/src/types/index.ts**
   - Changed `avatar?: string` → `profilePicture?: string` in User interface

2. **client/src/pages/candidate/Profile.tsx**
   - Changed `user?.avatar` → `user?.profilePicture`
   - Changed `updateUser({ ...user, avatar: avatarUrl })` → `updateUser({ ...user, profilePicture: avatarUrl })`

3. **client/src/utils/api.ts**
   - Added FormData detection in request interceptor
   - Removes Content-Type header for FormData to allow browser to set multipart/form-data

## How It Works Now

```
1. User clicks camera icon
2. File input dialog opens
3. User selects PNG/JPG image
4. handlePhotoUpload validates file
5. FormData created with file
6. API call to POST /api/users/avatar
7. Request interceptor removes Content-Type header
8. Browser sets multipart/form-data header with boundary
9. Server receives file via multer middleware
10. File uploaded to cloud storage (mock URL for now)
11. avatarUrl returned in response
12. Frontend updates user.profilePicture
13. Photo displays in profile
14. Auth store updated with new profilePicture
```

## Testing Steps

1. **Start PostgreSQL**
   ```bash
   # Windows
   pg_ctl -D "C:\Program Files\PostgreSQL\data" start
   ```

2. **Start Server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Client**
   ```bash
   cd client
   npm start
   ```

4. **Test Upload**
   - Login as candidate
   - Go to Profile Settings
   - Click camera icon
   - Select PNG or JPG image (max 5MB)
   - Check browser console for logs
   - Verify photo displays after upload
   - Refresh page to confirm persistence

## Expected Console Logs

```
File selected: photo.jpg image/jpeg 245678
FormData created, sending to server...
Upload response: {data: {success: true, data: {avatarUrl: "https://storage.simuai.com/avatars/..."}}}
```

## API Endpoint

**POST** `/api/users/avatar`
- **Auth:** Required (Bearer token)
- **Body:** FormData with `avatar` file field
- **Response:** `{ success: true, data: { avatarUrl: "..." } }`

## Database Field

**Table:** users
**Field:** profile_picture (VARCHAR)
**Maps to:** profilePicture (in Prisma)

## Validation

✅ File type: PNG, JPG only
✅ File size: Max 5MB
✅ Content-Type: multipart/form-data
✅ Database field: profilePicture
✅ Type safety: User interface updated
✅ Error handling: Console logs for debugging

## Production Notes

Current implementation uses mock cloud storage URLs. For production:
1. Configure AWS S3, Cloudinary, or similar
2. Update `server/utils/cloudStorage.js` with real upload logic
3. Add image optimization/compression
4. Implement retry logic for failed uploads
5. Add CDN for image delivery
6. Consider image resizing for thumbnails

## Troubleshooting

### "Please upload a file"
- Check if file is being selected
- Verify file input onChange is firing
- Check network tab for request body

### "Invalid file type"
- Only select PNG or JPG files
- Check file MIME type

### "File size must be less than 5MB"
- Compress image before uploading
- Use online image compressor

### Photo doesn't display
- Check browser console for errors
- Verify avatarUrl in response
- Check if updateUser is called
- Refresh page to verify persistence
