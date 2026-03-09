# Email Configuration Fix - Gmail App Password

## Problem
The email system is failing with error:
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

This happens because Gmail no longer accepts regular passwords for SMTP connections. You must use an **App Password** instead.

## Solution Steps

### Step 1: Enable 2-Step Verification (Required)
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification" in the left menu
3. Follow the prompts to enable 2-Step Verification
4. You'll need to verify with your phone

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Windows Computer" (or your device type) as the device
4. Click "Generate"
5. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
6. **Copy this password** (including spaces)

### Step 3: Update .env File
1. Open `server/.env`
2. Find the line: `EMAIL_PASS=your_app_password_here`
3. Replace `your_app_password_here` with the 16-character App Password from Step 2
4. Example:
   ```
   EMAIL_PASS=abcd efgh ijkl mnop
   ```

### Step 4: Restart Server
1. Stop the server (Ctrl+C)
2. Run: `npm start` in the server directory
3. The server should now be able to send emails

### Step 5: Test Email
1. Register a new account with a test email
2. Check if you receive the verification email
3. If successful, the email system is working

## Troubleshooting

### Still Getting "Invalid login" Error?
- Double-check the App Password is exactly 16 characters
- Make sure you copied it correctly (including spaces)
- Verify 2-Step Verification is enabled
- Try generating a new App Password

### Email Still Not Sending?
- Check server logs for `[EMAIL]` entries
- Verify `EMAIL_USER` is correct: `aydenfudagne@gmail.com`
- Ensure `EMAIL_HOST` is `smtp.gmail.com`
- Ensure `EMAIL_PORT` is `587`

### Security Note
- Never share your App Password
- This password only works for SMTP email sending
- It's different from your Gmail password
- You can revoke it anytime from the App Passwords page

## Current Configuration
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=aydenfudagne@gmail.com
EMAIL_PASS=<YOUR_16_CHARACTER_APP_PASSWORD>
```

## What This Fixes
- ✅ Email verification on registration
- ✅ Password reset emails
- ✅ Interview completion notifications
- ✅ Payment confirmation emails
- ✅ All other email notifications

---

**Status**: Ready for configuration. Follow the steps above to complete the setup.
