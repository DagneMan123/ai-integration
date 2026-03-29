# Chapa Payment Integration - Quick Reference

## 🚀 Quick Start

### 1. Environment Setup
```bash
# .env file
CHAPA_API_KEY=your_api_key
CHAPA_SECRET_KEY=your_secret_key
CHAPA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend: Trigger Payment
```typescript
// In BillingSidebar component
const handleTopUp = async (bundle: CreditBundle) => {
  const response = await api.post('/payments/initialize', {
    bundleId: bundle.id,
    amount: bundle.priceETB,
    creditAmount: bundle.creditAmount
  });
  
  // Redirect to Chapa
  window.location.href = response.data.data.checkout_url;
};
```

### 3. Backend: Initialize Payment
```javascript
// POST /api/payments/initialize
// Returns: { checkout_url, txRef, amount, creditAmount }
```

### 4. User Completes Payment
- User redirected to Chapa payment gateway
- Selects payment method (Telebirr, CBEBirr, Bank)
- Completes payment

### 5. Webhook Processing
- Chapa sends callback to `/api/payments/webhook`
- Backend verifies signature
- Wallet updated atomically
- User redirected to success page

## 📊 Key Endpoints

### Payment Initialization
```
POST /api/payments/initialize
Authorization: Bearer {token}

Request:
{
  "bundleId": 1,
  "amount": 25,
  "creditAmount": 5
}

Response:
{
  "success": true,
  "data": {
    "checkout_url": "https://api.chapa.co/v1/hosted/pay/...",
    "txRef": "simuai_1234567890_abc123",
    "amount": 25,
    "creditAmount": 5
  }
}
```

### Get Wallet Balance
```
GET /api/wallet/balance
Authorization: Bearer {token}

Response:
{
  "success": true,
  "balance": 10,
  "currency": "ETB"
}
```

### Get Payment History
```
GET /api/payments/history?page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 25,
      "status": "COMPLETED",
      "transactionId": "tx_ref_123",
      "paidAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5 }
}
```

### Get Analytics
```
GET /api/payments/analytics
Authorization: Bearer {token}

Response:
{
  "success": true,
  "totalSpent": 100,
  "successfulTransactions": 4,
  "averageValue": 25,
  "creditsRemaining": 20
}
```

## 💳 Credit Bundles

Default bundles (from database):
```
Bundle 1: 5 credits = 25 ETB
Bundle 2: 10 credits = 50 ETB
Bundle 3: 20 credits = 100 ETB
Bundle 4: 50 credits = 250 ETB
```

**Conversion Rule:** 1 Credit = 5 ETB

## 🔐 Security Checklist

- ✅ CHAPA_SECRET_KEY in environment variables
- ✅ HMAC-SHA256 signature validation on webhooks
- ✅ JWT authentication on all payment endpoints
- ✅ Unique tx_ref for each payment
- ✅ Idempotent webhook processing
- ✅ Atomic database transactions
- ✅ Rate limiting (10 requests/min per user)

## 🐛 Debugging

### Check Payment Status
```javascript
// In database
SELECT * FROM "Payment" WHERE "transactionId" = 'tx_ref_123';
```

### Check Wallet Balance
```javascript
// In database
SELECT * FROM "Wallet" WHERE "userId" = 1;
```

### View Logs
```bash
# Server logs
tail -f server/logs/combined.log

# Error logs
tail -f server/logs/error.log
```

### Test Webhook
```bash
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-chapa-signature: YOUR_SIGNATURE" \
  -d '{
    "tx_ref": "simuai_1234567890_abc123",
    "status": "completed",
    "amount": 25,
    "reference": "chapa_ref_123"
  }'
```

## 📱 User Flow

```
1. User opens BillingSidebar
   ↓
2. Sees wallet balance (e.g., 5 credits)
3. Selects credit bundle (e.g., 10 credits for 50 ETB)
   ↓
4. Clicks "Top Up" button
   ↓
5. Redirected to Chapa payment gateway
   ↓
6. Selects payment method (Telebirr/CBEBirr/Bank)
   ↓
7. Completes payment
   ↓
8. Redirected to success page
   ↓
9. Wallet updated (5 + 10 = 15 credits)
   ↓
10. Can now start interviews
```

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Chapa API key not configured" | Missing env var | Set CHAPA_API_KEY |
| "Invalid webhook signature" | Wrong secret key | Verify CHAPA_SECRET_KEY |
| "Payment amount mismatch" | Frontend/backend mismatch | Check bundle prices |
| "Wallet balance not updating" | Webhook not called | Check Chapa webhook URL |
| "User not authenticated" | Missing JWT token | Include Authorization header |

## 📈 Performance Targets

- Payment initialization: < 2 seconds
- Balance update: < 5 seconds
- History query: < 1 second
- Support 100+ concurrent payments

## 🔗 Related Files

- Frontend: `client/src/components/BillingSidebar.tsx`
- Backend: `server/controllers/paymentController.js`
- Services: `server/services/paymentService.js`, `chapaService.js`
- Routes: `server/routes/payments.js`, `wallet.js`
- Database: `server/prisma/schema.prisma`
- Spec: `.kiro/specs/automated-billing-wallet-system/`

## 📚 Documentation

- Full Guide: `CHAPA_PAYMENT_INTEGRATION_GUIDE.md`
- Requirements: `BILLING_SIDEBAR_REQUIREMENTS_DOCUMENTATION.md`
- Design: `.kiro/specs/automated-billing-wallet-system/design.md`
