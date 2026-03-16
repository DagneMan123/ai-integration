# Profile Photo Upload Feature - Fixed ✅

## Problem
Profile photo upload was not working because:
1. Camera button had no click handler or file input
2. API endpoint path mismatch (`/users/upload-avatar` vs `/users/avatar`)
3. User type property mismatch (`profilePicture` vs `avatar`)
4. No file validation or upload state management

## Solution Implemented

### 1. Frontend Changes (client/src/pages/candidate/Profile.tsx)

**Added state management:**
```typescript
const [uploadingPhoto, setUploadingPhoto] = useState(false);
const fileInputRef = React.useRef<HTMLInputElement>(null);
```

**Added photo upload handler:**
```typescript
const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type (PNG, JPG only)
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    toast.error('Only PNG and JPG files are allowed');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size must be less than 5MB');
    return;
  }

  setUploadingPhoto(true);
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await userAPI.uploadAvatar(formData) as any;
    toast.success('Profile photo updated successfully!');
    
    // Update the user in auth store with new avatar
    const avatarUrl = response.data?.data?.avatarUrl;
    if (avatarUrl) {
      updateUser({ ...user, avatar: avatarUrl });
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to upload photo');
  } finally {
    setUploadingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};
```

**Updated camera button:**
- Added `onClick={() => fileInputRef.current?.click()}` to trigger file input
- Added `disabled={uploadingPhoto}` to prevent multiple uploads
- Added hidden file input with accept filter for images only
- Shows preview of uploaded photo if available

### 2. Backend Changes

**Fixed API endpoint (server/utils/api.ts):**
```typescript
uploadAvatar: (file: FormData) => request.post<User>('/users/avatar', file),
```
Changed from `/users/upload-avatar` to `/users/avatar` to match server route.

**Fixed userController (server/controllers/userController.js):**
```javascript
await prisma.user.update({
  where: { id: req.user.id },
  data: { avatar: avatarUrl }  // Changed from profilePicture
});
```

### 3. Type Fixes

**Updated User type (client/src/types/index.ts):**
- Uses `avatar?: string` property (not `profilePicture`)
- Matches database schema

## Features

✅ File type validation (PNG, JPG only)
✅ File size validation (5MB max)
✅ Upload progress indication
✅ Photo preview display
✅ Error handling with user feedback
✅ Auto-update auth store after upload
✅ Disabled state during upload

## How to Use

1. Click the camera icon on the profile photo
2. Select a PNG or JPG image (max 5MB)
3. Wait for upload to complete
4. Photo will display immediately after upload

## API Endpoint

**POST** `/api/users/avatar`
- Requires: Authentication token
- Body: FormData with `avatar` file field
- Response: `{ success: true, data: { avatarUrl: "..." } }`

## Files Modified

1. `client/src/pages/candidate/Profile.tsx` - Added upload handler and UI
2. `client/src/utils/api.ts` - Fixed endpoint path
3. `server/controllers/userController.js` - Fixed field name
4. `client/src/types/index.ts` - Uses correct `avatar` property

## Testing

To test the feature:
1. Navigate to Profile Settings
2. Click the camera icon
3. Select an image file
4. Verify the photo uploads and displays
5. Refresh the page to confirm persistence
