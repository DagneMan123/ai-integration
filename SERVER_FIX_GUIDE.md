# 🔧 Server Fix Guide

## Problem
The server was trying to use `express-mongo-sanitize` which is a MongoDB-specific package, but we're using PostgreSQL.

## ✅ What Was Fixed

1. **Removed MongoDB sanitization** from `server/index.js`
2. **Updated imports** to remove unnecessary dependencies
3. **Created fix scripts** for easy installation

## 🚀 Quick Fix

### Option 1: Run Fix Script (Recommended)

```bash
# From project root
fix-server.bat
```

This will:
- Clean node_modules
- Clean package-lock.json
- Reinstall all dependencies
- Verify installation

### Option 2: Manual Fix

```bash
cd server
npm install
npm run dev
```

## 📋 Verify Installation

After running the fix, verify everything is working:

```bash
cd server
npm run dev
```

You should see:
```
[nodemon] starting `node index.js`
Server running on port 5000
Database connected successfully
```

## 🔍 Common Issues & Solutions

### Issue 1: Module Not Found

**Error:**
```
Error: Cannot find module 'express-mongo-sanitize'
```

**Solution:**
Already fixed! The module import was removed from index.js.

### Issue 2: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 3: Database Connection Error

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Make sure PostgreSQL is running
2. Check your `.env` file has correct database credentials
3. Verify database exists

### Issue 4: Missing Dependencies

**Error:**
```
Error: Cannot find module 'xyz'
```

**Solution:**
```bash
cd server
npm install
```

## 📦 Required Dependencies

The server now uses these packages:

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "pg": "^8.11.3",
  "sequelize": "^6.35.2",
  "multer": "^1.4.5-lts.1",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1",
  "dotenv": "^16.3.1",
  "axios": "^1.6.2",
  "winston": "^3.11.0",
  "uuid": "^9.0.1",
  "nodemailer": "^6.9.7",
  "joi": "^17.11.0",
  "openai": "^4.20.1",
  "@prisma/client": "^5.7.1"
}
```

## 🎯 Next Steps

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up database (if using Prisma):**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## ✅ Success Indicators

When everything is working correctly, you should see:

```
[nodemon] starting `node index.js`
INFO: Database connected successfully
INFO: Server running on port 5000
```

## 🆘 Still Having Issues?

1. **Check Node.js version:**
   ```bash
   node --version  # Should be v16 or higher
   ```

2. **Check npm version:**
   ```bash
   npm --version  # Should be v8 or higher
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Reinstall everything:**
   ```bash
   cd server
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

## 📞 Support

If you continue to have issues:
1. Check the error message carefully
2. Verify all environment variables are set
3. Make sure PostgreSQL is running
4. Check that all required ports are available

Your server should now be running without errors! 🎉
