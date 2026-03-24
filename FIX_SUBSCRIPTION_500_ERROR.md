# Fix: Subscription 500 Error

## Problem
The subscription endpoint returns a 500 error because the database tables don't exist yet.

## Root Cause
The Prisma schema was missing the following models:
- `SubscriptionPlan` - Subscription plan definitions
- `Subscription` - User subscriptions
- `Wallet` - User wallet/credits
- `WalletTransaction` - Transaction history
- `PracticeSession` - Practice session data

## Solution

### Step 1: Run Database Migration
Open PowerShell and run:

```bash
cd server
npx prisma migrate dev --name add_subscription_wallet_practice
```

This will:
1. Create a migration file
2. Apply it to your PostgreSQL database
3. Create all missing tables
4. Update the Prisma client

### Step 2: Restart the Server
After migration completes:

```bash
npm run dev
```

### Step 3: Test
The subscription endpoint should now work:
- `GET /api/subscription/plans` - Get subscription plans
- `GET /api/subscription` - Get user subscription
- `POST /api/subscription` - Create subscription

---

## Quick Fix (One Command)

Run this to do everything at once:

```bash
cd server && npx prisma migrate dev --name add_subscription_wallet_practice && npm run dev
```

---

## Or Use the Batch File

Run this from the root directory:

```bash
FIX_500_ERROR.bat
```

---

## What Was Changed

### Prisma Schema (`server/prisma/schema.prisma`)
Added 5 new models:
- `SubscriptionPlan` - Stores subscription plan definitions
- `Subscription` - Tracks user subscriptions
- `Wallet` - User wallet balance
- `WalletTransaction` - Transaction history
- `PracticeSession` - Practice session data

### Controllers
Updated `subscriptionController.js` to handle missing tables gracefully by returning default plans if the table doesn't exist yet.

### User Model
Added relations to the new models:
- `subscriptions` - User's subscriptions
- `wallet` - User's wallet
- `practiceSessions` - User's practice sessions

---

## Troubleshooting

### Migration Fails with "Table already exists"
Run this instead:
```bash
npx prisma db push
```

### Connection Error
Make sure PostgreSQL is running and DATABASE_URL is correct in `server/.env`

### Want to Reset Everything
WARNING: This deletes all data!
```bash
npx prisma migrate reset
```

Then run the migration again.

---

## After Migration

The following endpoints will now work:

**Subscription Plans:**
```
GET /api/subscription/plans
```

**User Subscription:**
```
GET /api/subscription
POST /api/subscription
POST /api/subscription/cancel
GET /api/subscription/history
GET /api/subscription/status
```

**Wallet:**
```
GET /api/wallet/balance
POST /api/wallet/topup
POST /api/wallet/deduct
POST /api/wallet/refund
GET /api/wallet/history
```

**Practice:**
```
GET /api/practice/sessions
POST /api/practice/sessions
GET /api/practice/sessions/:sessionId
POST /api/practice/sessions/:sessionId/answer
POST /api/practice/sessions/:sessionId/end
GET /api/practice/stats
```

---

## Status

✓ Schema updated with new models
✓ Controllers created with error handling
✓ Migration script ready
✓ Fallback plans available if tables don't exist

Next: Run the migration and restart the server.
