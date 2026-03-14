# ✅ Prisma Field Fix - Avatar to ProfilePicture

## Issue Fixed

**Error**: `Unknown field 'avatar' for select statement on model 'User'`

**Location**: 
- `server/controllers/applicationController.js` line 201
- `server/controllers/userController.js` line 145

**Root Cause**: Code was referencing `avatar` field which doesn't exist in the User model. The correct field name is `profilePicture`.

---

## Changes Made

### 1. applicationController.js (Line 201)
**Before**:
```javascript
include: {
  candidate: {
    select: { firstName: true, lastName: true, email: true, avatar: true }
  }
}
```

**After**:
```javascript
include: {
  candidate: {
    select: { firstName: true, lastName: true, email: true, profilePicture: true }
  }
}
```

### 2. userController.js (Line 145)
**Before**:
```javascript
await prisma.user.update({
  where: { id: req.user.id },
  data: { avatar: avatarUrl }
});
```

**After**:
```javascript
await prisma.user.update({
  where: { id: req.user.id },
  data: { profilePicture: avatarUrl }
});
```

---

## Verification

The User model in `server/prisma/schema.prisma` defines:
```prisma
profilePicture  String?  @map("profile_picture")
```

There is no `avatar` field in the User model.

---

## Status

✅ **FIXED** - All avatar field references have been corrected to use `profilePicture`

The application should now work without Prisma field errors.

---

**Date**: March 13, 2026
**Version**: 1.0.0

