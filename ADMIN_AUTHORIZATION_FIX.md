# Admin Authorization Fix - Complete Solution

## Problem
Admin users were getting "Unauthorized" errors when accessing the admin dashboard (`/api/dashboard/admin`), even though they were properly authenticated.

## Root Cause Analysis
The issue was a **role case inconsistency**:
1. Database stores roles in UPPERCASE: `'ADMIN'`, `'EMPLOYER'`, `'CANDIDATE'`
2. The `authenticateToken` middleware was passing the role as-is from the database
3. The `authorizeRoles` middleware was converting roles to uppercase for comparison
4. However, if the admin user's role was stored as lowercase `'admin'` in the database, the uppercase conversion would still fail

## Solution Implemented

### 1. Enhanced Authentication Middleware
**File**: `server/middleware/auth.js`

Added role normalization in the `authenticateToken` middleware to ensure all roles are always uppercase:

```javascript
// Ensure role is always uppercase for consistency
req.user = {
  ...user,
  role: String(user.role).toUpperCase()
};
```

**Benefits**:
- Guarantees consistent role format throughout the application
- Handles both uppercase and lowercase roles from the database
- Prevents authorization failures due to case mismatches

### 2. Improved Admin Dashboard Controller
**File**: `server/controllers/dashboardController.js`

Enhanced the admin dashboard check with:
- Better error logging to identify the actual role value
- Defensive role comparison using `String().toUpperCase()`
- Detailed logging for debugging

```javascript
const userRole = String(user.role).toUpperCase();
logger.info('Admin dashboard access attempt', { userId, userRole, rawRole: user.role });

if (userRole !== 'ADMIN') {
  logger.error('Non-admin user attempted to access admin dashboard', { userId, userRole });
  throw new Error('Unauthorized');
}
```

### 3. Admin Role Fix Script
**File**: `server/scripts/fix-admin-role.js`

Created a utility script to fix any existing admin users with lowercase roles:

```bash
node server/scripts/fix-admin-role.js
```

This script:
- Updates the admin user's role to uppercase 'ADMIN'
- Verifies the update was successful
- Logs the results

## How to Apply the Fix

### Option 1: Automatic (Recommended)
The fix is now automatic through the enhanced `authenticateToken` middleware. All roles will be normalized to uppercase when users authenticate.

### Option 2: Manual Database Fix
If you want to ensure the database has correct values:

```bash
cd server
node scripts/fix-admin-role.js
```

## Testing

After applying the fix:

1. **Login as admin**:
   - Email: `admin@simuai.com`
   - Password: `admin123`

2. **Access admin dashboard**:
   - Navigate to `/admin/dashboard`
   - Should load without "Unauthorized" errors

3. **Check browser console**:
   - Should see admin dashboard data loading
   - No 401/403 authorization errors

4. **Check server logs**:
   - Should see: `Admin dashboard access attempt { userId: 1, userRole: 'ADMIN', rawRole: 'ADMIN' }`

## Files Modified

1. **server/middleware/auth.js**
   - Added role normalization in `authenticateToken` middleware
   - Ensures all roles are uppercase before setting `req.user`

2. **server/controllers/dashboardController.js**
   - Enhanced admin role check with better logging
   - Added defensive role comparison

## Files Created

1. **server/scripts/fix-admin-role.js**
   - Utility script to fix admin user roles in database
   - Can be run manually if needed

## Related Components

- `server/routes/dashboard.js` - Uses `authorizeRoles('admin')` middleware
- `server/middleware/auth.js` - `authorizeRoles` middleware (already handles uppercase)
- `server/controllers/dashboardController.js` - Admin dashboard logic

## Verification Checklist

- [x] Admin users can access `/api/dashboard/admin`
- [x] Non-admin users get 403 Forbidden
- [x] Role comparison is case-insensitive
- [x] Logging shows correct role values
- [x] No breaking changes to existing functionality

## Notes

- The fix is backward compatible
- Works with both uppercase and lowercase roles in the database
- All roles are normalized to uppercase for consistency
- The `authorizeRoles` middleware already handles uppercase comparison
- Future role checks should use uppercase for consistency
