# Registration Issue - FIXED

## What Was Wrong

1. **Validation Mismatch**: The validation middleware expected `first_name` and `last_name` (snake_case), but the frontend was sending `firstName` and `lastName` (camelCase).

2. **Email Failure Blocking Registration**: If email sending failed, the entire registration would fail.

## What Was Fixed

### 1. Updated Validation Middleware
Changed `server/middleware/validation.js`:
- `first_name` → `firstName`
- `last_name` → `lastName`

### 2. Made Email Sending Non-Blocking
Updated `server/controllers/authController.js`:
- Wrapped email sending in try-catch
- Registration succeeds even if email fails
- Email failure is logged but doesn't stop registration

### 3. Added Generic sendEmail Function
Updated `server/utils/email.js`:
- Added `sendEmail()` function
- Checks if email is configured before sending
- Gracefully handles missing email configuration

### 4. Removed Deprecated Dependencies
Updated `server/package.json`:
- Removed Sequelize (no longer used)
- Removed pg and pg-hstore (Prisma has its own driver)
- Removed crypto (built-in Node.js module)

## How to Test

### Option 1: Use Test Script
```bash
node test-registration.js
```

### Option 2: Use Frontend
1. Make sure server is running: `cd server && npm run dev`
2. Make sure frontend is running: `cd client && npm start`
3. Go to: http://localhost:3000/register
4. Fill in the form:
   - Email: test@example.com
   - Password: Test@123 (must have uppercase, lowercase, and number)
   - First Name: Test
   - Last Name: User
   - Role: Candidate or Employer
5. Click Register

### Option 3: Use cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "role": "candidate"
  }'
```

## Expected Result

### Success Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "role": "candidate"
  }
}
```

## Password Requirements

Password must:
- Be at least 6 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)

Examples of valid passwords:
- `Test@123`
- `Password1`
- `MyPass123`

Examples of invalid passwords:
- `test123` (no uppercase)
- `TEST123` (no lowercase)
- `TestPass` (no number)
- `Test1` (too short)

## Troubleshooting

### "Validation failed"
Check the error details. Common issues:
- Password doesn't meet requirements
- Email format is invalid
- First/Last name too short (min 2 characters)

### "Email already registered"
The email is already in the database. Use a different email or login with existing account.

### "Database connection error"
PostgreSQL is not running. Start it:
```bash
net start postgresql-x64-16
```

### "Cannot reach server"
Server is not running. Start it:
```bash
cd server
npm run dev
```

## Database Tables

After successful registration, check the database:

```bash
psql -U postgres -d simuai_db
```

Then:
```sql
-- View all users
SELECT id, email, role, "firstName", "lastName", "isEmailVerified" FROM "User";

-- View candidate profiles
SELECT * FROM "CandidateProfile";

-- View companies
SELECT * FROM "Company";
```

## Next Steps After Registration

1. **Login**: Use the registered email and password
2. **Dashboard**: You'll be redirected to role-specific dashboard
3. **Email Verification**: Check email for verification link (if email is configured)
4. **Complete Profile**: Fill in additional profile information

## Email Configuration (Optional)

If you want email verification to work, add to `server/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

For Gmail:
1. Enable 2-factor authentication
2. Generate app password: https://myaccount.google.com/apppasswords
3. Use app password in EMAIL_PASS

## Files Changed

1. `server/middleware/validation.js` - Fixed field names
2. `server/controllers/authController.js` - Made email non-blocking
3. `server/utils/email.js` - Added sendEmail function
4. `server/package.json` - Removed deprecated dependencies

## Summary

Registration should now work! The main issue was a simple field name mismatch between frontend and backend validation. Email sending is now optional and won't block registration if it fails.

Try registering now and it should work! 🎉
