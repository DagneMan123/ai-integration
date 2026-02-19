# Authentication Debug Guide

## Current Status
✅ Email errors fixed - app works without email configuration
✅ Registration returns token and auto-logs in user
✅ Login validation is working
✅ Better error logging added to frontend

## The Errors You Saw

```
error: Invalid credentials - /api/auth/login - POST - ::1
error: Refresh token required - /api/auth/refresh-token - POST - ::1
```

These errors indicate:
1. Login attempt with wrong email/password
2. Frontend trying to refresh token when it doesn't have one

## How to Test Authentication

### Option 1: Use the Test Script

Run this command to test the full auth flow:

```bash
node test-auth.js
```

This will:
- Register a test user (test@example.com / Test123!)
- Login with that user
- Test token refresh

### Option 2: Manual Testing

1. **Clear your browser storage** (important!)
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Local Storage
   - Refresh the page

2. **Register a new user**
   - Go to http://localhost:3000/register
   - Fill in the form:
     - Role: Candidate or Employer
     - First Name: Test
     - Last Name: User
     - Email: test@example.com
     - Password: Test123!
   - Click "Create Account"
   - Should auto-login and redirect to dashboard

3. **Test Login**
   - Logout if logged in
   - Go to http://localhost:3000/login
   - Use the same credentials
   - Should login successfully

## Common Issues and Solutions

### Issue 1: "Invalid credentials" on login

**Causes:**
- Wrong email or password
- User doesn't exist in database
- Password not matching

**Solution:**
```bash
# Check if user exists in database
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findMany().then(users => console.log(users)).finally(() => prisma.$disconnect());"
```

### Issue 2: "Refresh token required"

**Causes:**
- Frontend trying to refresh token when not logged in
- Token expired and no refresh token available

**Solution:**
- Clear browser local storage
- This is normal behavior when not logged in

### Issue 3: Registration succeeds but can't login

**Causes:**
- Password not being hashed correctly
- Email normalization mismatch

**Solution:**
- Already fixed in the code
- Registration now auto-logs you in
- If you registered before the fix, register with a new email

## What Was Fixed

### 1. Email Service (server/utils/email.js)
- Detects placeholder credentials
- Skips email sending in development
- Doesn't throw errors, just logs warnings

### 2. Registration Flow (client/src/pages/auth/Register.tsx)
- Now auto-logs in user after registration
- Better error logging
- Handles both success scenarios

### 3. Login Flow (client/src/pages/auth/Login.tsx)
- Better error logging
- Validates response structure
- Shows detailed error messages

## Testing Checklist

- [ ] Server is running on port 5000
- [ ] Client is running on port 3000
- [ ] PostgreSQL is running
- [ ] Database is migrated
- [ ] Browser local storage is cleared
- [ ] Register a new user
- [ ] Auto-login works
- [ ] Logout works
- [ ] Login with same credentials works
- [ ] Dashboard loads correctly

## Debug Commands

### Check server logs
```bash
# Windows CMD
type server\logs\combined.log | findstr /C:"auth"

# Windows PowerShell
Get-Content server\logs\combined.log | Select-String "auth"
```

### Check database users
```bash
cd server
npx prisma studio
# Opens GUI to view database
```

### Test API directly
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test2@example.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"candidate\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test2@example.com\",\"password\":\"Test123!\"}"
```

## Expected Behavior

### Registration Success Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "candidate"
  }
}
```

### Login Success Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "candidate"
  }
}
```

## Next Steps

1. Clear browser storage
2. Register a new user
3. Verify auto-login works
4. Test logout and login again
5. If issues persist, run `node test-auth.js` to test the API directly

## Still Having Issues?

Check the browser console (F12) for detailed error messages. The frontend now logs:
- Request data being sent
- Response data received
- Detailed error information

This will help identify exactly where the issue is occurring.
