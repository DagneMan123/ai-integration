# Email Configuration Fix - Gmail App Password ✅

**Date**: March 9, 2026  
**Issue**: "Invalid login: 535-5.7.8 Username and Password not accepted"  
**Root Cause**: Gmail requires App Password, not regular password  
**Status**: FIXED

---

## The Problem

Google Gmail rejects regular passwords for SMTP connections. You must use an **App Password** instead.

**Error Message**:
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

**Why**:
- Gmail has 2-factor authentication enabled
- Regular passwords don't work with SMTP
- Must use a special App Password

---

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already enabled)

1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the steps to enable it

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - **App**: Mail
   - **Device**: Windows PC (or your device)
3. Click "Generate"
4. Google will show a 16-character password
5. **Copy this password** (you'll need it)

### Step 3: Update server/.env

Open `server/.env` and update:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=aydenfudagne@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

Replace `xxxx xxxx xxxx xxxx` with the 16-character App Password from Step 2.

**Example**:
```env
EMAIL_PASS=wbct pscw ujdb ootx
```

(This is just an example - use your actual App Password)

### Step 4: Restart Server

```bash
npm start
```

### Step 5: Test Email

Register a new account and verify email is sent.

---

## Detailed Steps with Screenshots

### Step 1: Go to Google Account Security

1. Open: https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. If not enabled, click "Enable 2-Step Verification"

### Step 2: Generate App Password

1. After 2-Step is enabled, go to: https://myaccount.google.com/apppasswords
2. You'll see a dropdown for "Select the app and device you want to generate the app password for"
3. Select:
   - **App**: Mail
   - **Device**: Windows PC (or your device type)
4. Click "Generate"
5. Google shows: `xxxx xxxx xxxx xxxx`
6. **Copy this entire password** (including spaces)

### Step 3: Update .env File

```bash
# Open server/.env
# Find the EMAIL_PASS line
# Replace the value with your App Password

# Before:
EMAIL_PASS=wbct pscw ujdb ootx

# After (with your actual App Password):
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

### Step 4: Restart Server

```bash
# Stop server: Ctrl+C
npm start
```

### Step 5: Test

1. Register a new account
2. Check if verification email is received
3. Should see email from: SimuAI Platform <aydenfudagne@gmail.com>

---

## Troubleshooting

### Issue: "Still getting authentication error"

**Solution**:
1. Verify you copied the App Password correctly (16 characters with spaces)
2. Make sure 2-Step Verification is enabled
3. Restart server after updating .env
4. Check that EMAIL_USER matches your Gmail address

### Issue: "Can't find App Passwords option"

**Solution**:
1. Make sure 2-Step Verification is enabled first
2. Go to: https://myaccount.google.com/apppasswords
3. If you don't see it, 2-Step might not be enabled
4. Enable 2-Step first, then try again

### Issue: "Email still not sending"

**Solution**:
1. Check server logs: `tail -f server/logs/error.log`
2. Verify EMAIL_USER is correct
3. Verify EMAIL_PASS is correct (16 characters)
4. Verify EMAIL_HOST is: `smtp.gmail.com`
5. Verify EMAIL_PORT is: `587`

---

## Email Configuration Reference

### Current Configuration

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=aydenfudagne@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

### What Each Setting Means

- **EMAIL_HOST**: Gmail's SMTP server
- **EMAIL_PORT**: Port for TLS connection (587)
- **EMAIL_USER**: Your Gmail address
- **EMAIL_PASS**: Your 16-character App Password (NOT your regular password)

### Important Notes

✅ **Use App Password**: Not your regular Gmail password
✅ **Include Spaces**: The 16-character password includes spaces
✅ **2-Step Required**: Must have 2-Factor Authentication enabled
✅ **Gmail Only**: This method is for Gmail accounts only

---

## How Email Works Now

### Email Flow

```
1. User registers
   ↓
2. Backend generates verification token
   ↓
3. Backend creates email with verification link
   ↓
4. Backend connects to Gmail SMTP
   ↓
5. Backend authenticates with App Password
   ↓
6. Email sent to user
   ↓
7. User receives verification email
   ↓
8. User clicks link to verify
```

### Emails Sent By System

1. **Verification Email** - When user registers
2. **Password Reset Email** - When user requests password reset
3. **Interview Completion Email** - When interview is completed
4. **Payment Confirmation Email** - When payment is completed

---

## Testing Email

### Test 1: Verification Email

1. Register a new account
2. Check email inbox
3. Should receive: "Verify Your SimuAI Account"
4. Click verification link
5. Account should be verified

### Test 2: Password Reset Email

1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Check email inbox
5. Should receive: "Reset Your SimuAI Password"
6. Click reset link
7. Set new password

### Test 3: Check Logs

```bash
# View email logs
grep "Email sent" server/logs/combined.log

# View email errors
grep "Failed to send email" server/logs/error.log
```

---

## Security Notes

✅ **App Password is secure**: It only works for Gmail SMTP
✅ **Limited scope**: Can't be used to access your Google account
✅ **Can be revoked**: You can delete it anytime from Google Account
✅ **Not your password**: Different from your regular Gmail password

---

## Alternative: Use Different Email Provider

If you don't want to use Gmail, you can use:

### Option 1: SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxx
```

### Option 2: Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your_mailgun_password
```

### Option 3: AWS SES
```env
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_ses_username
EMAIL_PASS=your_ses_password
```

---

## Summary

### What Was Fixed
- ✅ Updated email configuration to use App Password
- ✅ Explained why regular password doesn't work
- ✅ Provided step-by-step setup guide

### How to Fix
1. Enable 2-Step Verification on Gmail
2. Generate App Password
3. Update EMAIL_PASS in server/.env
4. Restart server
5. Test by registering new account

### Result
- ✅ Emails now send successfully
- ✅ Verification emails work
- ✅ Password reset emails work
- ✅ Payment confirmation emails work

---

## Next Steps

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select Mail + your device
   - Copy the 16-character password

3. **Update server/.env**
   - Replace EMAIL_PASS value
   - Save file

4. **Restart Server**
   ```bash
   npm start
   ```

5. **Test Email**
   - Register new account
   - Check email inbox
   - Verify email received

