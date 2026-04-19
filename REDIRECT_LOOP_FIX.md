# Infinite Redirect Loop Fix - Token Expiration

## Problem
When a token expires, the frontend gets stuck in an infinite redirect loop:
1. User tries to access protected route
2. Token is invalid/expired
3. API service tries to refresh token
4. Refresh fails
5. Redirect to `/login?expired=true`
6. But stale token still in localStorage
7. Loop repeats

## Root Causes
1. **API Service**: Called `logout()` but didn't clear localStorage before redirect
2. **PrivateRoute**: Didn't check for stale tokens in localStorage
3. **Auth Store**: `logout()` only removed `auth-storage` key, not individual token keys
4. **Race Condition**: Redirect happened before localStorage was fully cleared

## Solution Implemented

### 1. API Service - Immediate localStorage Cleanup (`client/src/services/apiService.ts`)
When token refresh fails (401 error):
```typescript
// CRITICAL: Clear localStorage IMMEDIATELY before redirect
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
localStorage.removeItem('auth-storage');

// Clear auth store
useAuthStore.getState().logout();

// Redirect to login
window.location.href = '/login?expired=true';
```

**Benefits:**
- Clears all auth data BEFORE redirect
- Prevents stale token from being read
- Breaks the redirect loop immediately

### 2. PrivateRoute - Stale Token Detection (`client/src/components/PrivateRoute.tsx`)
Added check for stale tokens in localStorage:
```typescript
if (!token || !user) {
  // If no token in store but token exists in localStorage, clean it up
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    console.warn('[PrivateRoute] Stale token found, clearing...');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
  }
  
  return <Navigate to="/login" state={{ from: location }} replace />;
}
```

**Benefits:**
- Catches stale tokens that weren't cleaned up
- Prevents redirect loop if cleanup was incomplete
- Logs warning for debugging

### 3. Auth Store - Comprehensive Cleanup (`client/src/store/authStore.ts`)
Enhanced `logout()` method:
```typescript
logout: () => {
  // Clear all auth-related keys
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
  
  // Also clear any other auth-related keys
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('auth') || key.includes('token') || key.includes('user')
  );
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear state
  set({ user: null, token: null, refreshToken: null });
};
```

**Benefits:**
- Removes all auth-related keys, not just one
- Catches any custom auth keys
- Ensures complete cleanup

## Flow After Fix

### Token Expiration Scenario
1. User makes API request with expired token
2. Server returns 401
3. API Service attempts token refresh
4. Refresh fails (no valid refresh token)
5. **API Service immediately clears localStorage**
6. Auth store is cleared
7. Redirect to `/login?expired=true`
8. PrivateRoute checks for stale tokens (none found)
9. User sees login page with "Session expired" message
10. **No redirect loop**

### Edge Case: Stale Token in localStorage
1. User navigates to protected route
2. Auth store has no token (cleared)
3. PrivateRoute detects stale token in localStorage
4. **PrivateRoute clears stale token**
5. Redirect to login
6. **No redirect loop**

## Testing

### Test 1: Token Expiration
1. Login to application
2. Wait for token to expire (or manually set expired token)
3. Try to access protected route
4. Verify: Redirected to login with "Session expired" message
5. Verify: No redirect loop in console

### Test 2: Manual Logout
1. Login to application
2. Click logout button
3. Verify: Redirected to login
4. Verify: localStorage is completely cleared
5. Check DevTools: No auth-related keys in localStorage

### Test 3: Stale Token Detection
1. Login to application
2. Manually add token to localStorage: `localStorage.setItem('token', 'stale-token')`
3. Clear auth store: `localStorage.removeItem('auth-storage')`
4. Refresh page
5. Verify: Stale token is detected and cleared
6. Verify: Redirected to login

## Console Logs for Debugging

When token refresh fails:
```
[API Service] Token refresh failed, clearing auth data
```

When stale token is detected:
```
[PrivateRoute] Stale token found in localStorage, clearing...
```

## Files Modified
1. `client/src/services/apiService.ts` - Clear localStorage before redirect
2. `client/src/components/PrivateRoute.tsx` - Detect and clear stale tokens
3. `client/src/store/authStore.ts` - Comprehensive logout cleanup

## Security Implications
- **Improved**: All auth data is cleared immediately on expiration
- **Improved**: No stale tokens left in localStorage
- **Improved**: Prevents unauthorized access through stale tokens
- **Improved**: Cleaner session management

## Performance Impact
- **Minimal**: Only adds localStorage cleanup operations
- **Beneficial**: Reduces memory usage by clearing stale data
- **No API calls**: All cleanup is local

## Backward Compatibility
- **Fully compatible**: No breaking changes
- **Existing logins**: Continue to work normally
- **Existing logouts**: Work the same way, just more thorough

## Future Improvements
1. Add session timeout warning before expiration
2. Implement automatic token refresh before expiration
3. Add "Remember me" functionality with secure refresh tokens
4. Implement session storage for sensitive operations
5. Add audit logging for token expiration events
