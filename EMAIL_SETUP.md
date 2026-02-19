# Email Configuration Guide

## Current Status
✅ Email errors are now handled gracefully - the app will work without email configured
⚠️ Email notifications are disabled until you configure real credentials

## The Error You Saw
```
error: Failed to send email {"error":"Invalid login: 535-5.7.8 Username and Password not accepted..."}
```

This happens because the `.env` file has placeholder email credentials. The app now detects this and skips email sending instead of crashing.

## How Email Works Now (Development Mode)
- Registration: ✅ Works without email
- Login: ✅ Works normally
- Password Reset: ⚠️ Token generated but email not sent
- Email Verification: ⚠️ Account created but verification email not sent

## To Enable Email (Optional)

### Option 1: Gmail with App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update `server/.env`**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_actual_email@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

4. **Restart the server**

### Option 2: Other Email Providers

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

**Custom SMTP:**
```env
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## Testing Email Configuration

After configuring, test by registering a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "candidate"
  }'
```

Check the server logs for:
- ✅ `Email sent successfully` - Email is working
- ⚠️ `Email not configured, skipping` - Still using placeholders
- ❌ `Failed to send email` - Check credentials

## Production Considerations

For production, you should:
1. Use a dedicated email service (SendGrid, AWS SES, Mailgun)
2. Set `NODE_ENV=production` in your `.env`
3. Configure proper email templates
4. Monitor email delivery rates

## Current Behavior

The app is configured to:
- ✅ Continue working even if email fails (development mode)
- ✅ Log warnings instead of errors for email issues
- ✅ Skip email sending if credentials are placeholders
- ✅ Allow users to register and login without email verification

This means your app is fully functional for development and testing!
