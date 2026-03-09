# Immediate Fixes Required - March 9, 2026

## Issue 1: PaymentDebug is not defined (Frontend Cache Error)

**Status**: Cache issue, not actual code problem

**Fix Steps**:
1. Stop the client development server (Ctrl+C in client terminal)
2. Delete the cache folder:
   ```bash
   cd client
   rmdir /s /q node_modules\.cache
   ```
3. Restart the client:
   ```bash
   npm start
   ```
4. Clear browser cache:
   - Press `Ctrl+Shift+Delete`
   - Select "All time"
   - Check "Cookies and other site data" and "Cached images and files"
   - Click "Clear data"
5. Hard refresh the page: `Ctrl+F5`

---

## Issue 2: Database Connection Error

**Error**: "Can't reach database server at `localhost:5432`"

**Status**: PostgreSQL service is not running

**Fix Steps**:

### Windows:
```bash
# Option 1: Using Services
1. Press Win+R
2. Type: services.msc
3. Find "postgresql-x64-15" (or similar)
4. Right-click → Start

# Option 2: Using Command Line (Admin)
net start postgresql-x64-15
```

### Mac:
```bash
brew services start postgresql
```

### Linux:
```bash
sudo systemctl start postgresql
```

**Verify PostgreSQL is running**:
```bash
psql -U postgres -d simuai_db -c "SELECT 1"
```

---

## Issue 3: Session Expired / Payment Already Paid

**Status**: ALREADY FIXED in previous conversation

**What was fixed**:
- Modified `server/middleware/auth.js` to allow expired tokens for payment verification
- Added grace period for `/payments/verify` and `/payments/webhook` endpoints
- Modified `server/controllers/paymentController.js` to check for existing pending payments
- Prevents duplicate payments within 24-hour window

**Current Implementation**:
- Unique transaction references: `req-${userId}-${Date.now()}-${random}`
- Server-side verification with Chapa
- Ownership verification for payment access
- Professional logging with `[PAYMENT]` and `[WEBHOOK]` prefixes

---

## Testing Payment Flow

**Test Credentials**:
- Phone: `0900000000`
- Amount: Any amount (e.g., 999 ETB)

**Payment Flow**:
1. Go to `/employer/subscription`
2. Click "Subscribe Now" on any plan
3. You'll be redirected to Chapa checkout
4. Use test phone number `0900000000`
5. Complete payment
6. You'll be redirected to `/payment/success`
7. Backend verifies payment with Chapa
8. Success page shows confirmation

---

## Quick Checklist

- [ ] PostgreSQL is running on port 5432
- [ ] Database `simuai_db` exists
- [ ] Server is running: `npm start` (in server folder)
- [ ] Client is running: `npm start` (in client folder)
- [ ] Client cache cleared (delete `node_modules/.cache`)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Hard refresh browser (Ctrl+F5)

---

## If Issues Persist

1. **Check server logs**: `server/logs/error.log`
2. **Check database connection**: 
   ```bash
   psql -U postgres -d simuai_db
   ```
3. **Restart everything**:
   - Stop server (Ctrl+C)
   - Stop client (Ctrl+C)
   - Start PostgreSQL
   - Start server
   - Start client

