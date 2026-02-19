# Quick Authentication Test

## The Issue
Login is showing "An error occurred" - this is likely because:
1. The user doesn't exist in the database
2. Wrong password
3. The interceptor was showing duplicate error messages

## What I Fixed
1. **API Interceptor**: Now skips showing toast errors for auth endpoints (login, register, etc.) - lets the component handle the error message
2. **Refresh Token**: Only tries to refresh if a refresh token exists

## How to Test

### Step 1: Clear Everything
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear Local Storage
4. Close and reopen the browser

### Step 2: Register a New User
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Role: Candidate
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test123!
3. Click "Create Account"
4. Should auto-login and redirect to dashboard

### Step 3: Test Login
1. Logout (if logged in)
2. Go to http://localhost:3000/login
3. Enter:
   - Email: test@example.com
   - Password: Test123!
4. Click "Sign In"
5. Should login successfully

## If Login Still Fails

Check the browser console (F12 → Console) for the actual error message. It will show:
- "Attempting login with: { email: '...' }"
- "Login response: ..." or "Login error: ..."

Common errors:
- **"Invalid credentials"**: Wrong email or password, or user doesn't exist
- **"Account is locked"**: Too many failed login attempts (5+)
- **Network error**: Server is not running

## Test with API Directly

Run this in a new terminal to test the API:

```bash
node test-auth.js
```

This will:
1. Register a test user (test@example.com)
2. Login with that user
3. Test token refresh

If this works, the backend is fine and the issue is in the frontend.

## Check Database

To see all users in the database:

```bash
cd server
npx prisma studio
```

This opens a GUI where you can:
- View all users
- Check if your test user exists
- Verify the email and other fields

## Reset Everything

If you want to start fresh:

```bash
# Stop the server
# Then run:
cd server
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

This will:
- Drop all tables
- Recreate them
- Seed with sample data

## What Should Happen

### Successful Registration Response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "1",
    "email": "test@example.com",
    "role": "candidate",
    "firstName": "Test",
    "lastName": "User",
    "isEmailVerified": false,
    "isActive": true
  }
}
```

### Successful Login Response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "1",
    "email": "test@example.com",
    "role": "candidate",
    "firstName": "Test",
    "lastName": "User",
    "isEmailVerified": false,
    "isActive": true
  }
}
```

### Error Response (Invalid Credentials):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

## Next Steps

1. Try registering a new user first
2. Then login with that user
3. Check browser console for detailed error messages
4. If still failing, run `node test-auth.js` to test the API directly
