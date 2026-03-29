# Chapa Payment Integration Guide - SimuAI Billing System

## Overview
This guide documents the complete Chapa payment integration for the SimuAI Automated Billing & Wallet System. The system enables candidates to purchase AI Interview Credits using Chapa payment gateway (Telebirr, CBEBirr, and Banks).

## System Architecture

### Payment Flow
```
1. User clicks "Top Up" button in BillingSidebar
   ↓
2. Frontend sends payment initialization request
   ↓
3. Backend creates PENDING payment record with unique tx_ref
   ↓
4. Backend generates Chapa checkout URL
   ↓
5. User redirected to Chapa payment gateway
   ↓
6. User completes payment (Telebirr/CBEBirr/Bank)
   ↓
7. Chapa sends webhook callback to backend
   ↓
8. Backend verifies signature and processes payment atomically
   ↓
9. Wallet balance updated, credits added
   ↓
10. User redirected to success page
```

## Frontend Implementation

### BillingSidebar Component (`client/src/components/BillingSidebar.tsx`)

**Key Features:**
- Real-time wallet balance display
- Credit bundle selection (5, 10, 20, 50 credits)
- Transaction history with filtering
- Financial analytics dashboard
- Low balance warnings

**Payment Initialization:**
```typescript
const handleTopUp = async (bundle: CreditBundle) => {
  const txRef = `simuai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await api.post('/payments/initialize', {
    amount: bundle.priceETB,
    creditAmount: bundle.creditAmount,
    bundleId: bundle.id,
    txRef,
    metadata: {
      bundleName: bundle.name,
      creditAmount: bundle.creditAmount,
      priceETB: bundle.priceETB
    }
  });
  
  // Redirect to Chapa checkout
  window.location.href = response.data.data.checkout_url;
};
```

**Response Handling:**
- Expects `response.data.data.checkout_url` from backend
- Redirects user to Chapa payment gateway
- Handles errors with user-friendly messages

## Backend Implementation

### Payment Controller (`server/controllers/paymentController.js`)

**Initialize Endpoint: `POST /api/payments/initialize`**

Request Body:
```json
{
  "bundleId": 1,
  "amount": 25,
  "creditAmount": 5,
  "txRef": "simuai_1234567890_abc123",
  "metadata": {
    "bundleName": "Starter Pack",
    "creditAmount": 5,
    "priceETB": 25
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "txRef": "simuai_1234567890_abc123",
    "checkout_url": "https://api.chapa.co/v1/hosted/pay/...",
    "amount": 25,
    "creditAmount": 5
  }
}
```

**Key Features:**
- Extracts userId from authenticated request
- Validates bundle or custom amount
- Generates unique transaction reference
- Creates PENDING payment record in database
- Generates Chapa checkout URL with metadata
- Returns checkout URL for frontend redirect

### Payment Service (`server/services/paymentService.js`)

**initializePayment Method:**
```javascript
async initializePayment(bundleId, userId, amount, creditAmount, txRef)
```

**Responsibilities:**
1. Validates bundle exists and is active (if bundleId provided)
2. Validates amount is positive
3. Generates unique tx_ref if not provided
4. Creates Payment record with PENDING status
5. Stores metadata (bundleId, creditAmount, bundleName)
6. Returns payment details for Chapa URL generation

**verifyAndProcessPayment Method:**
```javascript
async verifyAndProcessPayment(txRef, chapaData)
```

**Responsibilities:**
1. Fetches Payment record by txRef
2. Checks idempotency (prevents duplicate processing)
3. Verifies amount matches Chapa response
4. Executes atomic transaction:
   - Updates Payment status to COMPLETED
   - Gets or creates Wallet
   - Increments wallet balance with credits
   - Logs transaction in WalletTransaction table
5. Returns success with new balance

### Chapa Service (`server/services/chapaService.js`)

**generatePaymentUrl Method:**
```javascript
async generatePaymentUrl(txRef, amount, metadata)
```

**Responsibilities:**
1. Validates Chapa API key is configured
2. Prepares payment data with:
   - Amount in ETB
   - Currency: ETB
   - Email, first_name, last_name
   - Unique tx_ref
   - Callback URL for webhook
   - Return URL for success page
   - Customization (title, description)
   - Metadata (userId, creditAmount)
3. Sends POST request to Chapa API
4. Returns checkout URL

**verifySignature Method:**
```javascript
verifySignature(payload, signature)
```

**Responsibilities:**
1. Validates HMAC-SHA256 signature from webhook
2. Uses CHAPA_SECRET_KEY from environment
3. Compares computed vs received signature
4. Returns boolean result

**verifyPaymentStatus Method:**
```javascript
async verifyPaymentStatus(txRef)
```

**Responsibilities:**
1. Queries Chapa API for payment status
2. Returns status, amount, reference
3. Used for manual verification if needed

### Webhook Handler (`server/routes/chapaWebhook.js`)

**Webhook Endpoint: `POST /api/payments/webhook`**

**Responsibilities:**
1. Receives callback from Chapa
2. Validates HMAC-SHA256 signature
3. Extracts tx_ref, status, amount, reference
4. Calls paymentService.verifyAndProcessPayment()
5. Returns 200 OK for successful processing
6. Implements idempotency (same tx_ref processed once)

**Webhook Payload:**
```json
{
  "tx_ref": "simuai_1234567890_abc123",
  "status": "completed",
  "amount": 25,
  "reference": "chapa_ref_123",
  "customization": {
    "title": "SimuAI - AI Interview Credits",
    "description": "Purchase 5 credits"
  }
}
```

## Database Schema

### Payment Table
```sql
CREATE TABLE "Payment" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ETB',
  paymentMethod VARCHAR(50) DEFAULT 'chapa',
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
  transactionId VARCHAR(100) UNIQUE NOT NULL, -- tx_ref
  chapaReference VARCHAR(100),
  metadata JSONB, -- {bundleId, creditAmount, bundleName}
  paidAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### Wallet Table
```sql
CREATE TABLE "Wallet" (
  id SERIAL PRIMARY KEY,
  userId INT UNIQUE NOT NULL,
  balance INT DEFAULT 0, -- Credit balance
  currency VARCHAR(3) DEFAULT 'ETB',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### WalletTransaction Table
```sql
CREATE TABLE "WalletTransaction" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  amount INT NOT NULL, -- Credits added/deducted
  type VARCHAR(20), -- TOPUP, DEBIT, REFUND
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### CreditBundle Table
```sql
CREATE TABLE "CreditBundle" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  creditAmount INT NOT NULL,
  priceETB DECIMAL(10, 2) NOT NULL,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

Required in `.env`:
```
# Chapa Configuration
CHAPA_API_KEY=your_chapa_api_key
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook

# Frontend
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/simuai
```

## API Endpoints

### Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/initialize` | Yes | Initialize payment |
| POST | `/api/payments/webhook` | No | Chapa webhook callback |
| GET | `/api/payments/bundles` | No | Get credit bundles |
| GET | `/api/payments/history` | Yes | Get payment history |
| GET | `/api/payments/analytics` | Yes | Get financial analytics |
| GET | `/api/payments/export` | Yes | Export history as CSV |

### Wallet Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wallet/balance` | Yes | Get wallet balance |
| GET | `/api/wallet/transactions` | Yes | Get transaction history |
| GET | `/api/wallet/check-credits` | Yes | Check if sufficient credits |

## Business Logic

### Credit Conversion Rule
**1 Credit = 5 ETB**

This rule is enforced at all system levels:
- Bundle pricing: 5 credits = 25 ETB, 10 credits = 50 ETB
- Wallet balance stored in credits
- Interview cost: 1 credit per interview
- Refunds calculated using this ratio

### Access Control
- "Start AI Interview" button disabled if wallet balance < 1 credit
- Checked via `/api/wallet/check-credits` endpoint
- Real-time validation before interview starts

### Idempotency
- Each payment has unique `tx_ref`
- Webhook processing checks if payment already COMPLETED
- Prevents duplicate credit additions
- Safe to retry webhook calls

### Atomic Transactions
All payment processing uses database transactions:
1. Update Payment status
2. Get/create Wallet
3. Increment balance
4. Log transaction
All succeed or all fail - no partial updates

## Security Implementation

### Signature Validation
- HMAC-SHA256 signature verification on all webhooks
- Uses CHAPA_SECRET_KEY from environment
- Prevents unauthorized webhook calls

### Authentication
- All payment endpoints require JWT token
- Extracted from Authorization header
- Verified via middleware

### Data Protection
- Sensitive data (API keys, secrets) in environment variables only
- Never logged or exposed in responses
- HTTPS required for all Chapa API calls

### Rate Limiting
- 10 payment requests per user per minute
- Prevents abuse and fraud
- Implemented via express-rate-limit middleware

## Performance Targets

| Operation | Target | Implementation |
|-----------|--------|-----------------|
| Payment initialization | < 2 seconds | Optimized Chapa API call |
| Balance update | < 5 seconds | Atomic transaction |
| History query | < 1 second | Indexed database queries |
| Concurrent payments | 100+ | Connection pooling |

## Testing

### Manual Testing Steps

1. **Initialize Payment:**
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bundleId": 1,
    "amount": 25,
    "creditAmount": 5
  }'
```

2. **Check Wallet Balance:**
```bash
curl -X GET http://localhost:5000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Get Payment History:**
```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Verify Webhook:**
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

## Troubleshooting

### Common Issues

**Issue: "Chapa API key is not configured"**
- Solution: Set CHAPA_API_KEY in .env file
- Verify: `echo $CHAPA_API_KEY`

**Issue: "Invalid webhook signature"**
- Solution: Verify CHAPA_SECRET_KEY matches Chapa dashboard
- Check: Signature calculation uses correct payload

**Issue: "Payment amount mismatch"**
- Solution: Ensure frontend sends correct amount
- Verify: Amount matches bundle price in database

**Issue: "Wallet balance not updating"**
- Solution: Check webhook is being called
- Verify: Payment status is COMPLETED in database
- Check: WalletTransaction record created

## Monitoring & Logging

### Log Levels
- INFO: Payment initialization, completion, webhook processing
- WARN: Invalid signatures, payment failures, configuration issues
- ERROR: Database errors, API failures, unexpected exceptions

### Key Metrics to Monitor
- Payment success rate
- Average payment processing time
- Webhook delivery success rate
- Failed payment count
- Concurrent payment count

## Compliance & Best Practices

✅ **Implemented:**
- Atomic transactions for data integrity
- Idempotent webhook processing
- HMAC-SHA256 signature validation
- Rate limiting for fraud prevention
- Comprehensive error handling
- Detailed logging for auditing
- Environment variable security
- JWT authentication

✅ **Recommended:**
- Monitor payment success rates
- Set up alerts for failed payments
- Regular security audits
- Backup webhook processing
- Payment reconciliation reports
- User communication on payment status

## Support & Documentation

For more information:
- Chapa API Docs: https://developer.chapa.co/
- SimuAI Billing Spec: `.kiro/specs/automated-billing-wallet-system/`
- Requirements: `BILLING_SIDEBAR_REQUIREMENTS_DOCUMENTATION.md`
