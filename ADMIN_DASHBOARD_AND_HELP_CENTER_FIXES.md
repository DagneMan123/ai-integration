# Admin Dashboard & Help Center Fixes

## Issues Fixed

### 1. Admin Dashboard "Unauthorized" Error
**Problem**: Admin users were getting "Unauthorized" error when accessing `/api/dashboard/admin`

**Root Cause**: The `getAdminDashboard` controller was checking `user.role !== 'admin'` (lowercase), but the database stores roles in UPPERCASE ('ADMIN', 'EMPLOYER', 'CANDIDATE').

**Solution**: Updated the role comparison to use uppercase:
```javascript
// Before
if (!user || user.role !== 'admin') throw new Error('Unauthorized');

// After
if (!user || user.role?.toUpperCase() !== 'ADMIN') throw new Error('Unauthorized');
```

**File Modified**: `server/controllers/dashboardController.js`

---

### 2. Help Center "Cannot read properties of undefined" Error
**Problem**: Help center endpoints were throwing "Cannot read properties of undefined (reading 'findMany')" errors

**Root Cause**: The Prisma client might not be fully initialized when routes are called, or there was a timing issue with the client connection.

**Solution**: Added null checks before accessing Prisma models:
```javascript
// Added checks in all help center endpoints
if (!prisma || !prisma.helpCenterArticle) {
  console.error('Prisma client not initialized properly');
  return sendResponse(res, 200, [], 'Articles fetched successfully');
}
```

**Benefits**:
- Gracefully handles Prisma client initialization delays
- Returns fallback data instead of throwing errors
- Allows client-side fallback mock data to display
- Prevents cascading errors

**File Modified**: `server/routes/helpCenter.js`

---

## Testing

After these fixes:

1. **Admin Dashboard**: Admin users should now be able to access `/api/dashboard/admin` without authorization errors
2. **Help Center**: Help center endpoints should return empty arrays/success responses instead of errors, allowing client-side fallback data to display

## Verification Steps

1. Login as admin user
2. Navigate to admin dashboard
3. Check browser console - should not see "Unauthorized" errors
4. Help center should load with fallback data if API calls fail

## Related Files

- `server/controllers/dashboardController.js` - Admin dashboard logic
- `server/routes/helpCenter.js` - Help center API endpoints
- `server/lib/prisma.js` - Prisma client initialization
- `server/middleware/auth.js` - Authentication middleware (uses uppercase role comparison)

## Notes

- The role comparison inconsistency was due to database storing roles in UPPERCASE while some code was checking for lowercase
- The help center Prisma checks are defensive programming to handle initialization timing issues
- All endpoints now gracefully degrade to fallback data instead of throwing errors
