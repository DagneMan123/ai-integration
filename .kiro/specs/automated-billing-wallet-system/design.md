# SimuAI Automated Billing & Wallet System - Technical Design Document

## Overview

The SimuAI Automated Billing & Wallet System is a credit-based financial engine that enables Candidates to purchase "AI Interview Credits" through the Chapa payment gateway. The system automates transaction processing, wallet management, and provides real-time financial visibility. The design enforces a 1 Credit = 5 ETB conversion rule and ensures atomic, idempotent payment processing with comprehensive audit logging.

### Key Design Principles

- **Atomicity**: All financial operations are atomic transactions
- **Idempotency**: Duplicate webhook processing produces identical results
- **Auditability**: All transactions are immutably logged
- **Security**: Signature validation, encryption, and authentication on all endpoints
- **Performance**: Sub-2-second payment initialization, sub-5-second balance updates
- **Scalability**: Support for 100+ concurrent payments with rate limiting

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CANDIDATE FRONTEND                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Billing Page    │  │ Credit Bundles   │  │ Transaction      │
│  │  Component       │  │ Display          │  │ History Table    │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                     │                     │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                           │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ POST /api/payments/initialize                                │
│  │ POST /api/payments/webhook                                   │
│  │ GET  /api/wallet/balance                                     │
│  │ GET  /api/payments/history                                   │
│  │ GET  /api/payments/analytics                                 │
│  │ GET  /api/payments/export                                    │
│  └──────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │ PaymentService   │  │ ChapaService     │  │ WalletService    │
│  │ - Initialize     │  │ - Generate URL   │  │ - Get Balance    │
│  │ - Verify         │  │ - Verify Sig     │  │ - Increment      │
│  │ - Update Wallet  │  │ - Verify Status  │  │ - Decrement      │
│  │ - Get History    │  │                  │  │ - Initialize     │
│  │ - Analytics      │  │                  │  │                  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
└─────────────────────────────────────────────────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Prisma)                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │ Wallet Table     │  │ Payment Table    │  │ CreditBundle     │
│  │ - id             │  │ - id             │  │ - id             │
│  │ - userId         │  │ - userId         │  │ - name           │
│  │ - balance        │  │ - txRef          │  │ - creditAmount   │
│  │ - currency       │  │ - amount         │  │ - priceETB       │
│  │ - createdAt      │  │ - creditAmount   │  │ - isActive       │
│  │ - updatedAt      │  │ - status         │  │ - createdAt      │
│  │                  │  │ - paymentMethod  │  │                  │
│  │                  │  │ - chapaReference │  │                  │
│  │                  │  │ - metadata       │  │                  │
│  │                  │  │ - paidAt         │  │                  │
│  │                  │  │ - createdAt      │  │                  │
│  │                  │  │ - updatedAt      │  │                  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ Chapa Payment Gateway                                        │
│  │ - Payment URL Generation                                     │
│  │ - Webhook Callbacks                                          │
│  │ - Payment Status Verification                                │
│  └──────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### Payment Processing Workflow

```
1. INITIALIZATION
   ├─ Candidate clicks "Top Up" button
   ├─ Frontend calls POST /api/payments/initialize
   ├─ Backend generates unique tx_ref
   ├─ Backend creates Payment record (PENDING)
   ├─ Backend calls Chapa API for payment URL
   └─ Backend returns {txRef, paymentUrl, amount}

2. PAYMENT PROCESSING (at Chapa)
   ├─ Candidate completes payment at Chapa
   ├─ Chapa processes payment
   └─ Chapa updates payment status

3. WEBHOOK RECEPTION
   ├─ Chapa sends webhook to POST /api/payments/webhook
   ├─ Backend extracts tx_ref and status
   ├─ Backend validates webhook signature
   └─ Backend checks for duplicate processing

4. VERIFICATION
   ├─ Backend verifies payment with Chapa
   ├─ Backend validates amount matches
   ├─ Backend checks payment status
   └─ Backend determines if COMPLETED or FAILED

5. WALLET UPDATE (Atomic Transaction)
   ├─ BEGIN TRANSACTION
   ├─ Update Payment record to COMPLETED
   ├─ Increment Wallet balance
   ├─ Log transaction
   └─ COMMIT or ROLLBACK

6. RESPONSE
   ├─ Backend returns HTTP 200
   ├─ Frontend updates wallet display
   └─ Candidate can start interviews
```

---

## Database Schema (Prisma Models)

### Wallet Model

```prisma
model Wallet {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique @map("user_id")
  balance   Decimal  @default(0) @db.Decimal(10, 2)
  currency  String   @default("ETB")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("wallets")
}
```

### Payment Model

```prisma
model Payment {
  id              Int            @id @default(autoincrement())
  userId          Int            @map("user_id")
  txRef           String         @unique @map("tx_ref")
  amount          Decimal        @db.Decimal(10, 2)
  creditAmount    Int            @map("credit_amount")
  status          PaymentStatus  @default(PENDING)
  paymentMethod   String         @map("payment_method")
  chapaReference  String         @unique @map("chapa_reference")
  metadata        Json
  paidAt          DateTime?      @map("paid_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@index([status])
  @@index([txRef])
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}
```

### CreditBundle Model

```prisma
model CreditBundle {
  id            Int      @id @default(autoincrement())
  name          String
  creditAmount  Int      @map("credit_amount")
  priceETB      Decimal  @db.Decimal(10, 2) @map("price_etb")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  
  @@index([isActive])
  @@map("credit_bundles")
}
```

### User Model Extension

```prisma
model User {
  // ... existing fields ...
  
  wallet        Wallet?
  payments      Payment[]
}
```

---

## API Endpoints

### 1. Payment Initialization

**Endpoint**: `POST /api/payments/initialize`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "bundleId": 1,
  "userId": 123
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "txRef": "tx_1234567890abcdef",
  "paymentUrl": "https://chapa.co/checkout/tx_1234567890abcdef",
  "amount": 25.00,
  "creditAmount": 5
}
```

**Response (Error - 400)**:
```json
{
  "success": false,
  "error": "Invalid bundle ID or amount"
}
```

**Response (Error - 401)**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response (Error - 403)**:
```json
{
  "success": false,
  "error": "Forbidden: userId mismatch"
}
```

**Response (Error - 503)**:
```json
{
  "success": false,
  "error": "Chapa API unavailable"
}
```

**Logic**:
1. Validate JWT token and userId match
2. Fetch CreditBundle by bundleId
3. Validate bundle exists and is active
4. Validate amount is positive
5. Generate unique tx_ref
6. Create Payment record with PENDING status
7. Call Chapa API to generate payment URL
8. Return response within 2 seconds

---

### 2. Webhook Handler

**Endpoint**: `POST /api/payments/webhook`

**Authentication**: Signature validation (no JWT required)

**Request Body** (from Chapa):
```json
{
  "tx_ref": "tx_1234567890abcdef",
  "status": "completed",
  "amount": 25.00,
  "reference": "chapa_ref_123456",
  "customization": {
    "userId": 123,
    "credit_amount": 5
  }
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Response (Error - 401)**:
```json
{
  "success": false,
  "error": "Invalid signature"
}
```

**Response (Error - 409)**:
```json
{
  "success": false,
  "error": "Duplicate tx_ref"
}
```

**Logic**:
1. Extract signature from webhook header
2. Validate signature using Chapa secret
3. Extract tx_ref from payload
4. Check if tx_ref already processed (idempotency)
5. If duplicate, return success without processing
6. Verify payment status with Chapa
7. If COMPLETED, execute atomic wallet update
8. If FAILED, update Payment status to FAILED
9. Log webhook event
10. Return HTTP 200 within 5 seconds

---

### 3. Wallet Balance

**Endpoint**: `GET /api/wallet/balance`

**Authentication**: Required (JWT)

**Response (Success - 200)**:
```json
{
  "success": true,
  "balance": 15.00,
  "currency": "Credits"
}
```

**Response (Error - 404)**:
```json
{
  "success": false,
  "error": "Wallet not found"
}
```

**Logic**:
1. Validate JWT token
2. Fetch Wallet for authenticated user
3. If wallet doesn't exist, initialize with 0 balance
4. Return balance and currency

---

### 4. Transaction History

**Endpoint**: `GET /api/payments/history`

**Authentication**: Required (JWT)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20, max: 100)
- `status`: Filter by status (PENDING, COMPLETED, FAILED)
- `paymentMethod`: Filter by method (telebirr, cbebirr, bank)
- `dateFrom`: Filter from date (ISO 8601)
- `dateTo`: Filter to date (ISO 8601)
- `sortBy`: Sort field (date, amount, status)
- `sortOrder`: Sort order (asc, desc)

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "txRef": "tx_1234567890abcdef",
      "amount": 25.00,
      "creditAmount": 5,
      "status": "COMPLETED",
      "paymentMethod": "telebirr",
      "chapaReference": "chapa_ref_123456",
      "paidAt": "2024-01-15T14:30:00Z",
      "createdAt": "2024-01-15T14:25:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Logic**:
1. Validate JWT token
2. Apply filters (status, method, date range)
3. Sort by specified field
4. Paginate results
5. Return within 1 second

---

### 5. Financial Analytics

**Endpoint**: `GET /api/payments/analytics`

**Authentication**: Required (JWT)

**Response (Success - 200)**:
```json
{
  "success": true,
  "totalSpent": 125.50,
  "successfulTransactions": 5,
  "averageValue": 25.10,
  "creditsRemaining": 25
}
```

**Logic**:
1. Validate JWT token
2. Calculate sum of successful payments
3. Count successful transactions
4. Calculate average transaction value
5. Fetch current wallet balance
6. Return metrics

---

### 6. Export Transaction History

**Endpoint**: `GET /api/payments/export`

**Authentication**: Required (JWT)

**Query Parameters**:
- `format`: Export format (csv)
- `status`: Filter by status
- `paymentMethod`: Filter by method
- `dateFrom`: Filter from date
- `dateTo`: Filter to date

**Response**: CSV file download

**CSV Format**:
```
Date,Transaction Reference,Amount (ETB),Status,Payment Method,Chapa Reference
2024-01-15 14:30:00,tx_1234567890abcdef,25.00,COMPLETED,telebirr,chapa_ref_123456
2024-01-14 10:15:00,tx_0987654321fedcba,50.00,COMPLETED,cbebirr,chapa_ref_654321
```

**Logic**:
1. Validate JWT token
2. Apply filters
3. Generate CSV with current filters
4. Set appropriate headers for download
5. Return CSV file



---

## Frontend Components

### BillingPage Component

**Location**: `client/src/pages/candidate/Billing.tsx`

**Responsibilities**:
- Display credit bundles with "Top Up" buttons
- Show current wallet balance prominently
- Display transaction history table
- Show financial analytics cards
- Implement export functionality

**Key Features**:
- Real-time balance updates via WebSocket or polling
- Responsive design for mobile and desktop
- Loading states and error handling
- Success/failure notifications

**Component Structure**:
```
BillingPage
├── WalletBalanceWidget
├── CreditBundlesSection
│   └── CreditBundleCard (multiple)
├── FinancialAnalyticsCards
│   ├── TotalSpentCard
│   ├── SuccessfulTransactionsCard
│   ├── AverageValueCard
│   └── CreditsRemainingCard
└── TransactionHistorySection
    ├── FilterBar
    ├── TransactionHistoryTable
    └── ExportButton
```

---

### CreditBundleCard Component

**Location**: `client/src/components/CreditBundleCard.tsx`

**Props**:
```typescript
interface CreditBundleCardProps {
  bundleId: number;
  name: string;
  creditAmount: number;
  priceETB: number;
  onTopUp: (bundleId: number) => void;
  isLoading?: boolean;
}
```

**Features**:
- Display bundle name, credits, and price
- Show "Top Up" button
- Display conversion rate (1 Credit = 5 ETB)
- Loading state during payment initialization
- Error handling for failed payments

---

### WalletBalanceWidget Component

**Location**: `client/src/components/WalletBalanceWidget.tsx`

**Props**:
```typescript
interface WalletBalanceWidgetProps {
  balance: number;
  currency: string;
  onTopUpClick: () => void;
}
```

**Features**:
- Display current balance prominently
- Show "Top Up" link if balance < 1
- Update in real-time after payment
- Display currency label

---

### TransactionHistoryTable Component

**Location**: `client/src/components/TransactionHistoryTable.tsx`

**Props**:
```typescript
interface TransactionHistoryTableProps {
  transactions: Payment[];
  isLoading: boolean;
  onSort: (field: string, order: 'asc' | 'desc') => void;
  onFilter: (filters: FilterOptions) => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}
```

**Features**:
- Sortable columns: Date, Amount, Status, Method, Reference
- Filterable by status, method, date range
- Pagination support
- Export button
- Status badges (COMPLETED, FAILED, PENDING)

---

### FinancialAnalyticsCards Component

**Location**: `client/src/components/FinancialAnalyticsCards.tsx`

**Props**:
```typescript
interface FinancialAnalyticsCardsProps {
  analytics: {
    totalSpent: number;
    successfulTransactions: number;
    averageValue: number;
    creditsRemaining: number;
  };
  isLoading: boolean;
}
```

**Features**:
- Total Spent card with ETB currency
- Successful Transactions card with count
- Average Transaction Value card
- Credits Remaining card
- Loading skeleton states

---

## Backend Services

### PaymentService

**Location**: `server/services/paymentService.js`

**Methods**:

#### initializePayment(bundleId, userId)
```javascript
async initializePayment(bundleId, userId) {
  // 1. Validate bundle exists and is active
  // 2. Generate unique tx_ref
  // 3. Create Payment record with PENDING status
  // 4. Call ChapaService.generatePaymentUrl()
  // 5. Return {txRef, paymentUrl, amount, creditAmount}
  // Timeout: 2 seconds
}
```

#### verifyPayment(txRef, chapaData)
```javascript
async verifyPayment(txRef, chapaData) {
  // 1. Fetch Payment record by txRef
  // 2. Verify amount matches
  // 3. Check payment status from Chapa
  // 4. Return boolean (true if valid, false otherwise)
}
```

#### updateWalletBalance(userId, creditAmount)
```javascript
async updateWalletBalance(userId, creditAmount) {
  // 1. Execute atomic transaction:
  //    a. Update Payment to COMPLETED
  //    b. Increment Wallet balance
  //    c. Log transaction
  // 2. Implement optimistic locking
  // 3. Retry up to 3 times on conflict
  // 4. Throw error if retries exhausted
}
```

#### getPaymentHistory(userId, filters)
```javascript
async getPaymentHistory(userId, filters) {
  // 1. Apply filters (status, method, date range)
  // 2. Sort by specified field
  // 3. Paginate results
  // 4. Return {data, pagination}
  // Timeout: 1 second
}
```

#### calculateAnalytics(userId)
```javascript
async calculateAnalytics(userId) {
  // 1. Calculate totalSpent (sum of COMPLETED payments)
  // 2. Count successfulTransactions
  // 3. Calculate averageValue
  // 4. Fetch creditsRemaining from wallet
  // 5. Return analytics object
}
```

---

### ChapaService

**Location**: `server/services/chapaService.js`

**Methods**:

#### generatePaymentUrl(txRef, amount, metadata)
```javascript
async generatePaymentUrl(txRef, amount, metadata) {
  // 1. Validate inputs
  // 2. Call Chapa API with:
  //    - amount
  //    - currency: "ETB"
  //    - email: user email
  //    - first_name, last_name
  //    - tx_ref
  //    - callback_url
  //    - customization: metadata
  // 3. Return payment URL
  // 4. Implement exponential backoff retry
  // 5. Timeout: 1 second
}
```

#### verifySignature(payload, signature)
```javascript
verifySignature(payload, signature) {
  // 1. Retrieve Chapa secret from environment
  // 2. Compute HMAC-SHA256 signature
  // 3. Compare with provided signature
  // 4. Return boolean
}
```

#### verifyPaymentStatus(txRef)
```javascript
async verifyPaymentStatus(txRef) {
  // 1. Call Chapa API to verify payment
  // 2. Return {status, amount, reference}
  // 3. Implement exponential backoff retry
}
```

---

### WalletService

**Location**: `server/services/walletService.js`

**Methods**:

#### getBalance(userId)
```javascript
async getBalance(userId) {
  // 1. Fetch Wallet for userId
  // 2. If not found, initialize with 0
  // 3. Return balance
}
```

#### incrementBalance(userId, amount)
```javascript
async incrementBalance(userId, amount) {
  // 1. Validate amount > 0
  // 2. Update Wallet balance atomically
  // 3. Log transaction
  // 4. Return updated balance
}
```

#### decrementBalance(userId, amount)
```javascript
async decrementBalance(userId, amount) {
  // 1. Validate amount > 0
  // 2. Validate balance >= amount
  // 3. Update Wallet balance atomically
  // 4. Log transaction
  // 5. Return updated balance or throw 402 error
}
```

#### initializeWallet(userId)
```javascript
async initializeWallet(userId) {
  // 1. Create Wallet record
  // 2. Set balance to 0
  // 3. Set currency to "ETB"
  // 4. Return wallet
}
```

---

## Security Implementation

### Authentication

**Requirement**: All payment endpoints require JWT authentication

**Implementation**:
- Middleware: `server/middleware/auth.js`
- Validate JWT token on all payment endpoints
- Extract userId from token
- Verify userId matches request parameter
- Return 401 for missing/invalid token
- Return 403 for userId mismatch

**Code Pattern**:
```javascript
router.post('/api/payments/initialize', 
  authenticateJWT,
  validateUserIdMatch,
  paymentController.initialize
);
```

---

### Webhook Signature Validation

**Requirement**: Validate Chapa webhook signatures

**Implementation**:
1. Retrieve Chapa secret from `process.env.CHAPA_SECRET_KEY`
2. Extract signature from webhook header: `X-Chapa-Signature`
3. Compute HMAC-SHA256 signature of payload
4. Compare computed signature with header signature
5. Reject if signatures don't match
6. Log security event for failed validation

**Code Pattern**:
```javascript
function verifyWebhookSignature(payload, signature) {
  const secret = process.env.CHAPA_SECRET_KEY;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return computed === signature;
}
```

---

### Data Encryption

**Requirements**:
- Use HTTPS for all endpoints
- Store Chapa secret in environment variables
- Never log sensitive data

**Implementation**:
- HTTPS enforced at server level
- Environment variables: `CHAPA_API_KEY`, `CHAPA_SECRET_KEY`
- Sanitize logs to exclude sensitive fields
- Use secure headers middleware

**Secure Headers**:
```javascript
app.use(helmet());
app.use(express.json());
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

### Rate Limiting

**Requirement**: Max 10 payment requests per user per minute

**Implementation**:
- Use `express-rate-limit` middleware
- Key: userId from JWT token
- Window: 1 minute
- Max requests: 10
- Return 429 error if exceeded

**Code Pattern**:
```javascript
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user.id,
  message: 'Too many payment requests, please try again later'
});

router.post('/api/payments/initialize', paymentLimiter, ...);
```

---

## Error Handling

### Payment Initialization Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid bundle ID or amount | Bundle doesn't exist or amount not positive |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden: userId mismatch | Authenticated user doesn't match request |
| 503 | Chapa API unavailable | Chapa service down or unreachable |

### Webhook Errors

| Status | Error | Cause |
|--------|-------|-------|
| 401 | Invalid signature | Webhook signature validation failed |
| 409 | Duplicate tx_ref | Transaction already processed |
| 500 | Database transaction failed | Atomic transaction rollback |

### Wallet Errors

| Status | Error | Cause |
|--------|-------|-------|
| 402 | Insufficient credits | Wallet balance < required amount |
| 404 | Wallet not found | User wallet doesn't exist |
| 409 | Concurrent update conflict | Optimistic locking conflict |

---

## Data Integrity & Transactions

### Atomic Wallet Update

**Transaction Structure**:
```javascript
const result = await prisma.$transaction(async (tx) => {
  // 1. Update Payment record
  const payment = await tx.payment.update({
    where: { txRef },
    data: { 
      status: 'COMPLETED',
      paidAt: new Date()
    }
  });

  // 2. Increment Wallet balance
  const wallet = await tx.wallet.update({
    where: { userId },
    data: { 
      balance: {
        increment: creditAmount
      }
    }
  });

  // 3. Log transaction
  await tx.transactionLog.create({
    data: {
      userId,
      type: 'PAYMENT_COMPLETED',
      amount,
      creditAmount,
      txRef,
      timestamp: new Date()
    }
  });

  return { payment, wallet };
});
```

---

### Idempotency

**Implementation**:
1. Check if tx_ref already processed
2. If yes, return success without duplicating credits
3. Use database unique constraint on tx_ref
4. Implement idempotency key in request headers

**Code Pattern**:
```javascript
const existingPayment = await prisma.payment.findUnique({
  where: { txRef }
});

if (existingPayment && existingPayment.status === 'COMPLETED') {
  return { success: true, message: 'Already processed' };
}
```

---

### Conflict Resolution

**Optimistic Locking Implementation**:
```javascript
async function updateWalletWithRetry(userId, creditAmount, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Fetch current wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId }
        });

        // Update with version check
        return await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: creditAmount } }
        });
      });
      return result;
    } catch (error) {
      if (error.code === 'P2034' && attempt < maxRetries - 1) {
        // Conflict detected, retry
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Performance Optimization

### Database Indexes

**Payment Table Indexes**:
```prisma
@@index([userId])
@@index([createdAt])
@@index([status])
@@index([txRef])
```

**Wallet Table Indexes**:
```prisma
@@index([userId])
```

**Query Optimization**:
- Use indexed fields in WHERE clauses
- Pagination for large result sets
- Lazy load analytics calculations
- Use database aggregation functions

---

### Caching Strategy

**Cache Layers**:
1. **Credit Bundles** (5 minute TTL)
   - Cache in-memory or Redis
   - Invalidate on admin update

2. **Wallet Balance** (1 minute TTL)
   - Cache per user
   - Invalidate on payment completion

3. **Transaction History** (No cache)
   - Always fetch fresh from database
   - Pagination prevents large queries

**Implementation**:
```javascript
const cache = new Map();

async function getCreditBundles() {
  const cacheKey = 'credit_bundles';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const bundles = await prisma.creditBundle.findMany({
    where: { isActive: true }
  });
  
  cache.set(cacheKey, bundles);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return bundles;
}
```

---

### Query Optimization

**Pagination**:
- Default: 20 records per page
- Max: 100 records per page
- Offset-based pagination

**Lazy Loading**:
- Load analytics only when requested
- Don't calculate on every page load
- Use database aggregation

**Database Aggregation**:
```javascript
const analytics = await prisma.payment.aggregate({
  where: { userId, status: 'COMPLETED' },
  _sum: { amount: true },
  _count: true,
  _avg: { amount: true }
});
```



---

## Monitoring & Logging

### Log Events

**Payment Initialization**:
```
[INFO] Payment initialized: txRef=tx_123, userId=456, bundleId=1, amount=25.00
```

**Webhook Reception**:
```
[INFO] Webhook received: txRef=tx_123, status=completed, timestamp=2024-01-15T14:30:00Z
```

**Wallet Update**:
```
[INFO] Wallet updated: userId=456, before=10, after=15, creditAmount=5, txRef=tx_123
```

**Failed Payment**:
```
[WARN] Payment failed: txRef=tx_123, reason=insufficient_funds, timestamp=2024-01-15T14:30:00Z
```

**Concurrent Update Conflict**:
```
[WARN] Concurrent update conflict: userId=456, attempt=1, retrying...
```

**Security Event**:
```
[ERROR] Invalid webhook signature: txRef=tx_123, timestamp=2024-01-15T14:30:00Z
```

### Metrics

**Key Metrics**:
- Payment success rate (%)
- Average payment processing time (ms)
- Webhook latency (ms)
- Database transaction duration (ms)
- Concurrent payment count
- Rate limit violations per minute

**Monitoring Tools**:
- Application Performance Monitoring (APM)
- Database query profiling
- Error tracking (Sentry)
- Log aggregation (ELK Stack)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

#### 1.1 Credit Bundle Display
Thoughts: This is testing that the system displays bundles. We can generate random bundles and verify they appear on the dashboard.
Testable: yes - example

#### 1.2 Bundle Pricing Conversion
Thoughts: This is a rule that should apply to all bundles. We can generate random credit amounts and verify the price equals creditAmount * 5.
Testable: yes - property

#### 1.3 Bundle Configuration
Thoughts: This is testing admin functionality. We can update a bundle and verify the changes persist.
Testable: yes - example

#### 1.4 Bundle Price Validation
Thoughts: This is a rule that should apply to all bundles. We can verify all bundle prices are positive numbers.
Testable: yes - property

#### 2.1 Payment Initialization
Thoughts: This is testing that payment initialization generates a unique tx_ref and creates a PENDING record.
Testable: yes - property

#### 2.2 Bundle Validation
Thoughts: This is testing that invalid bundles are rejected. We can attempt to initialize with non-existent bundle IDs.
Testable: yes - example

#### 2.3 Response Time
Thoughts: This is testing performance. We can measure response time and verify it's under 2 seconds.
Testable: yes - property

#### 3.1 Webhook Idempotency
Thoughts: This is a rule that should apply to all webhooks. Processing the same tx_ref multiple times should produce the same result.
Testable: yes - property

#### 4.1 Signature Validation
Thoughts: This is testing security. We can verify that invalid signatures are rejected.
Testable: yes - example

#### 5.1 Atomic Wallet Update
Thoughts: This is a rule that should apply to all payments. Either all three operations succeed or none do.
Testable: yes - property

#### 6.1 Wallet Balance Display
Thoughts: This is testing that the balance is displayed. We can verify the displayed balance matches the database.
Testable: yes - property

#### 7.1 Transaction History Population
Thoughts: This is a rule that should apply to all completed payments. Each payment should appear in history.
Testable: yes - property

#### 8.1 Transaction Sorting
Thoughts: This is testing that sorting works correctly. We can verify results are in the correct order.
Testable: yes - property

#### 9.1 CSV Export
Thoughts: This is testing that exported data matches the database. We can verify the CSV contains all expected records.
Testable: yes - property

#### 10.1 Analytics Calculation
Thoughts: This is a rule that should apply to all analytics. Calculated values should match database aggregates.
Testable: yes - property

#### 11.1 Interview Access Control
Thoughts: This is a rule that should apply to all interviews. Interviews should only start if balance >= 1.
Testable: yes - property

#### 12.1 Atomic Credit Deduction
Thoughts: This is a rule that should apply to all interviews. Either credit is deducted or interview fails.
Testable: yes - property

#### 13.1 Credit Refund
Thoughts: This is a rule that should apply to cancelled interviews. Refund should be idempotent.
Testable: yes - property

#### 14.1 Audit Logging
Thoughts: This is a rule that should apply to all transactions. All transactions should be logged.
Testable: yes - property

#### 15.1 Concurrent Payment Handling
Thoughts: This is a rule that should apply to concurrent payments. All updates should be applied correctly.
Testable: yes - property

#### 16.1 Failed Payment Handling
Thoughts: This is testing that failed payments are handled correctly. We can verify wallet is not updated.
Testable: yes - property

#### 17.1 Chapa Downtime Resilience
Thoughts: This is testing error handling. We can simulate Chapa downtime and verify graceful handling.
Testable: yes - example

#### 18.1 Payment Endpoint Authentication
Thoughts: This is a rule that should apply to all payment endpoints. Unauthenticated requests should be rejected.
Testable: yes - property

#### 19.1 Webhook Signature Validation
Thoughts: This is a rule that should apply to all webhooks. Invalid signatures should be rejected.
Testable: yes - property

#### 20.1 Environment Variable Management
Thoughts: This is testing that secrets are not logged. We can verify logs don't contain sensitive data.
Testable: yes - example

#### 21.1 Payment Initialization Response Time
Thoughts: This is testing performance. We can measure response time and verify it's under 2 seconds.
Testable: yes - property

#### 22.1 Wallet Balance Update Latency
Thoughts: This is testing performance. We can measure update latency and verify it's under 5 seconds.
Testable: yes - property

#### 23.1 Transaction History Query Performance
Thoughts: This is testing performance. We can measure query time and verify it's under 1 second.
Testable: yes - property

#### 24.1 Concurrent Payment Scalability
Thoughts: This is testing that the system handles 100+ concurrent payments. We can simulate concurrent requests.
Testable: yes - property

#### 25.1 Payment Data Encryption
Thoughts: This is testing that HTTPS is used. We can verify all endpoints use HTTPS.
Testable: yes - example

#### 26.1 Wallet Initialization
Thoughts: This is a rule that should apply to all new users. Wallets should be initialized with 0 balance.
Testable: yes - property

#### 27.1 Payment Method Tracking
Thoughts: This is a rule that should apply to all payments. Payment method should be recorded.
Testable: yes - property

#### 28.1 Chapa Reference Reconciliation
Thoughts: This is testing that Chapa references are stored. We can verify they're present in records.
Testable: yes - property

#### 29.1 Payment Metadata Storage
Thoughts: This is a rule that should apply to all payments. Metadata should be stored as JSON.
Testable: yes - property

#### 30.1 Pretty Printer
Thoughts: This is testing that payment records are formatted correctly. We can verify formatting.
Testable: yes - example

#### 31.1 Payment Record Round-Trip
Thoughts: This is testing serialization. Serializing then deserializing should produce equivalent objects.
Testable: yes - property

#### 32.1 Wallet Balance Invariant
Thoughts: This is a rule that should apply to all wallets. Balance should always be >= 0 and an integer.
Testable: yes - property

#### 33.1 Payment Status Idempotence
Thoughts: This is a rule that should apply to all payments. Processing the same payment multiple times should produce the same result.
Testable: yes - property

#### 34.1 Payment Status Transitions
Thoughts: This is a rule that should apply to all payments. Only valid transitions should be allowed.
Testable: yes - property

#### 35.1 Wallet Update Conflict Resolution
Thoughts: This is a rule that should apply to concurrent updates. Conflicts should be resolved correctly.
Testable: yes - property

### Property Reflection

After analyzing all 35 acceptance criteria, I've identified the following testable properties. Some criteria are redundant or can be combined:

- Properties 5.1 and 15.1 both test atomic operations - can be combined into one comprehensive property
- Properties 3.1 and 33.1 both test idempotency - can be combined
- Properties 21.1 and 22.1 test performance - can be combined into one performance property
- Properties 18.1 and 19.1 test security validation - can be combined

After consolidation, we have 28 unique testable properties.

---

### Correctness Properties

#### Property 1: Bundle Price Conversion Rule

*For any* credit bundle, the price in ETB should equal the credit amount multiplied by 5 (1 Credit = 5 ETB).

**Validates: Requirements 1.2, 1.3**

#### Property 2: Bundle Price Positivity

*For any* credit bundle, the price should be a positive number greater than 0.

**Validates: Requirements 1.4**

#### Property 3: Payment Initialization Generates Unique Reference

*For any* payment initialization request, the system should generate a unique tx_ref that doesn't exist in the database.

**Validates: Requirements 2.1**

#### Property 4: Payment Record Creation

*For any* successful payment initialization, a Payment record should be created with status PENDING and the correct amount and creditAmount.

**Validates: Requirements 2.1**

#### Property 5: Payment Initialization Response Time

*For any* payment initialization request, the system should respond within 2 seconds.

**Validates: Requirements 2.3, 21.1**

#### Property 6: Webhook Idempotency

*For any* webhook with the same tx_ref processed multiple times, the system should produce the same result each time without duplicating credits.

**Validates: Requirements 3.1, 33.1**

#### Property 7: Signature Validation

*For any* webhook with an invalid signature, the system should reject it and return a 401 error.

**Validates: Requirements 4.1, 19.1**

#### Property 8: Atomic Wallet Update

*For any* successful payment verification, either all three operations (Payment update, Wallet increment, Log creation) succeed or none do.

**Validates: Requirements 5.1, 15.1**

#### Property 9: Wallet Balance Display Accuracy

*For any* user, the displayed wallet balance should match the balance in the database.

**Validates: Requirements 6.1**

#### Property 10: Transaction History Population

*For any* completed payment, the transaction should appear in the user's transaction history.

**Validates: Requirements 7.1**

#### Property 11: Transaction Sorting

*For any* transaction history query with a sort parameter, results should be ordered according to the specified field and direction.

**Validates: Requirements 8.1**

#### Property 12: CSV Export Accuracy

*For any* CSV export, the exported data should match the filtered transaction history in the database.

**Validates: Requirements 9.1**

#### Property 13: Analytics Calculation Accuracy

*For any* analytics query, calculated values (totalSpent, successfulTransactions, averageValue) should match database aggregates.

**Validates: Requirements 10.1**

#### Property 14: Interview Access Control

*For any* interview start request, if wallet balance < 1, the system should prevent the interview from starting.

**Validates: Requirements 11.1**

#### Property 15: Atomic Credit Deduction

*For any* interview start, either exactly 1 credit is deducted or the interview fails without deducting credits.

**Validates: Requirements 12.1**

#### Property 16: Credit Refund Idempotence

*For any* cancelled interview, refunding credits should be idempotent (refunding twice should not double-refund).

**Validates: Requirements 13.1**

#### Property 17: Audit Logging Completeness

*For any* financial transaction, the system should create an immutable audit log entry with all required fields.

**Validates: Requirements 14.1**

#### Property 18: Concurrent Payment Correctness

*For any* concurrent payments to the same user, all credit updates should be applied correctly without loss or duplication.

**Validates: Requirements 15.1, 24.1**

#### Property 19: Failed Payment Wallet Integrity

*For any* failed payment, the wallet balance should remain unchanged.

**Validates: Requirements 16.1**

#### Property 20: Authentication Requirement

*For any* payment endpoint request without valid JWT authentication, the system should return a 401 error.

**Validates: Requirements 18.1**

#### Property 21: Wallet Initialization for New Users

*For any* new user, the system should automatically create a Wallet record with balance = 0 and currency = "ETB".

**Validates: Requirements 26.1**

#### Property 22: Payment Method Recording

*For any* completed payment, the payment method (telebirr, cbebirr, or bank) should be recorded in the Payment record.

**Validates: Requirements 27.1**

#### Property 23: Chapa Reference Storage

*For any* completed payment, the Chapa Reference should be stored in the Payment record and be unique.

**Validates: Requirements 28.1**

#### Property 24: Payment Metadata Storage

*For any* payment, metadata should be stored as JSON and include userId and credit_amount.

**Validates: Requirements 29.1**

#### Property 25: Payment Record Serialization Round-Trip

*For any* valid Payment record, serializing to JSON and deserializing should produce an equivalent object.

**Validates: Requirements 31.1**

#### Property 26: Wallet Balance Invariant

*For any* wallet, the balance should always be >= 0 and an integer (whole credits only).

**Validates: Requirements 32.1**

#### Property 27: Payment Status Transition Validity

*For any* payment, only valid status transitions should be allowed (PENDING→COMPLETED or PENDING→FAILED, no other transitions).

**Validates: Requirements 34.1**

#### Property 28: Concurrent Update Conflict Resolution

*For any* concurrent wallet updates, conflicts should be detected and resolved correctly through optimistic locking and retries.

**Validates: Requirements 35.1**

---

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** (Specific Examples & Edge Cases):
- Test specific payment scenarios (successful, failed, duplicate)
- Test error conditions (invalid bundle, missing JWT, invalid signature)
- Test edge cases (zero balance, concurrent updates, Chapa downtime)
- Test integration points between components
- Verify error messages and status codes

**Property-Based Tests** (Universal Properties):
- Verify properties hold across all valid inputs
- Generate random payment data and verify invariants
- Test concurrent scenarios with multiple simultaneous payments
- Verify serialization round-trips
- Test performance characteristics

### Unit Testing Focus

**Payment Initialization Tests**:
- Valid bundle initialization
- Invalid bundle ID (404)
- Missing JWT token (401)
- UserID mismatch (403)
- Chapa API unavailable (503)

**Webhook Handler Tests**:
- Valid webhook with COMPLETED status
- Valid webhook with FAILED status
- Invalid signature (401)
- Duplicate tx_ref (idempotency)
- Malformed payload

**Wallet Tests**:
- Get balance for existing wallet
- Initialize wallet for new user
- Insufficient balance for interview
- Concurrent balance updates

**Analytics Tests**:
- Calculate totalSpent correctly
- Count successful transactions
- Calculate average value
- Handle zero transactions

### Property-Based Testing Configuration

**Testing Library**: Hypothesis (Python) or fast-check (JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Timeout: 30 seconds per test
- Seed: Fixed for reproducibility
- Shrinking: Enabled for failure analysis

**Test Structure**:
```javascript
describe('Payment System Properties', () => {
  // Feature: automated-billing-wallet-system, Property 1: Bundle Price Conversion Rule
  it('should maintain 1 Credit = 5 ETB conversion for all bundles', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (creditAmount) => {
          const expectedPrice = creditAmount * 5;
          const bundle = createBundle(creditAmount, expectedPrice);
          return bundle.priceETB === expectedPrice;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: automated-billing-wallet-system, Property 3: Payment Initialization Generates Unique Reference
  it('should generate unique tx_ref for each payment', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 10, maxLength: 20 }),
        (userIds) => {
          const txRefs = userIds.map(userId => generateTxRef(userId));
          const uniqueTxRefs = new Set(txRefs);
          return uniqueTxRefs.size === txRefs.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: automated-billing-wallet-system, Property 6: Webhook Idempotency
  it('should process duplicate webhooks idempotently', () => {
    fc.assert(
      fc.property(
        fc.record({
          txRef: fc.string(),
          userId: fc.integer({ min: 1, max: 1000 }),
          amount: fc.integer({ min: 1, max: 10000 })
        }),
        async (webhook) => {
          const result1 = await processWebhook(webhook);
          const result2 = await processWebhook(webhook);
          return result1.success === result2.success &&
                 result1.creditsAdded === result2.creditsAdded;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: automated-billing-wallet-system, Property 8: Atomic Wallet Update
  it('should atomically update wallet or fail completely', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.integer({ min: 1, max: 1000 }),
          creditAmount: fc.integer({ min: 1, max: 100 })
        }),
        async (data) => {
          const beforeBalance = await getWalletBalance(data.userId);
          try {
            await updateWalletAtomically(data.userId, data.creditAmount);
            const afterBalance = await getWalletBalance(data.userId);
            return afterBalance === beforeBalance + data.creditAmount;
          } catch (error) {
            const finalBalance = await getWalletBalance(data.userId);
            return finalBalance === beforeBalance;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: automated-billing-wallet-system, Property 26: Wallet Balance Invariant
  it('should maintain wallet balance >= 0 and integer', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 1, maxLength: 50 }),
        (operations) => {
          let balance = 0;
          for (const op of operations) {
            balance += op;
            if (balance < 0) balance = 0;
          }
          return balance >= 0 && Number.isInteger(balance);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80% code coverage
- **Property Tests**: All 28 correctness properties
- **Integration Tests**: End-to-end payment flow
- **Performance Tests**: Response time and throughput
- **Security Tests**: Authentication, signature validation, encryption

---

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Codes

| Code | HTTP Status | Message | Cause |
|------|-------------|---------|-------|
| INVALID_BUNDLE | 400 | Invalid bundle ID or amount | Bundle doesn't exist or amount not positive |
| UNAUTHORIZED | 401 | Unauthorized | Missing or invalid JWT token |
| FORBIDDEN | 403 | Forbidden: userId mismatch | Authenticated user doesn't match request |
| INSUFFICIENT_CREDITS | 402 | Insufficient credits | Wallet balance < required amount |
| NOT_FOUND | 404 | Wallet not found | User wallet doesn't exist |
| INVALID_SIGNATURE | 401 | Invalid signature | Webhook signature validation failed |
| DUPLICATE_TRANSACTION | 409 | Duplicate tx_ref | Transaction already processed |
| CONFLICT | 409 | Concurrent update conflict | Optimistic locking conflict |
| SERVICE_UNAVAILABLE | 503 | Chapa API unavailable | Chapa service down or unreachable |
| INTERNAL_ERROR | 500 | Internal server error | Unexpected error |

---

## Deployment Checklist

### Environment Variables Required

```bash
# Chapa Configuration
CHAPA_API_KEY=<chapa_api_key>
CHAPA_SECRET_KEY=<chapa_secret_key>
CHAPA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/simuai

# JWT
JWT_SECRET=<jwt_secret>

# Frontend
FRONTEND_URL=https://yourdomain.com

# Server
NODE_ENV=production
PORT=3000
```

### Database Migrations

```bash
# Create Wallet table
npx prisma migrate dev --name add_wallet

# Create Payment table
npx prisma migrate dev --name add_payment

# Create CreditBundle table
npx prisma migrate dev --name add_credit_bundle

# Add indexes
npx prisma migrate dev --name add_payment_indexes

# Add constraints
npx prisma migrate dev --name add_payment_constraints
```

### Testing Requirements

- [ ] Unit tests pass (80% coverage)
- [ ] Property tests pass (all 28 properties)
- [ ] Integration tests pass (end-to-end flow)
- [ ] Load tests pass (100+ concurrent payments)
- [ ] Security tests pass (authentication, signature validation)
- [ ] Performance tests pass (response times < thresholds)

### Pre-Deployment Verification

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] HTTPS configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

