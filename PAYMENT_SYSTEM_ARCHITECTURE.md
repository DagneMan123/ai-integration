# Payment System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CANDIDATE DASHBOARD                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Interview Payment Modal                                 │  │
│  │  ├─ Shows: Cost (5 ETB), Balance, Action Buttons        │  │
│  │  ├─ "Start Now" (if balance ≥ 1)                        │  │
│  │  └─ "Pay & Start Interview" (if balance < 1)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Billing & History Section                               │  │
│  │  ├─ Wallet Balance Card                                  │  │
│  │  ├─ Financial Analytics (Total Spent, Transactions)      │  │
│  │  ├─ Recent Transactions List                             │  │
│  │  ├─ Filter by Status                                     │  │
│  │  └─ Export CSV Button                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Payment Initialization]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Payment Controller                                      │  │
│  │  ├─ POST /api/payments/initialize                        │  │
│  │  ├─ GET /api/payments/verify/:txRef                      │  │
│  │  ├─ GET /api/payments/history                            │  │
│  │  ├─ GET /api/payments/analytics                          │  │
│  │  ├─ GET /api/payments/export                             │  │
│  │  └─ POST /api/payments/webhook                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Wallet Controller                                       │  │
│  │  ├─ GET /api/wallet/balance                              │  │
│  │  ├─ POST /api/wallet/topup                               │  │
│  │  ├─ POST /api/wallet/deduct                              │  │
│  │  └─ GET /api/wallet/transactions                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Payment Service                                         │  │
│  │  ├─ initializePayment()                                  │  │
│  │  ├─ verifyAndProcessPayment()                            │  │
│  │  ├─ getPaymentHistory()                                  │  │
│  │  ├─ calculateAnalytics()                                 │  │
│  │  └─ exportPaymentHistory()                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Wallet Service                                          │  │
│  │  ├─ getBalance()                                         │  │
│  │  ├─ topupCredits()                                       │  │
│  │  ├─ deductCredits()                                      │  │
│  │  └─ getTransactionHistory()                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chapa Service                                           │  │
│  │  ├─ generatePaymentUrl()                                 │  │
│  │  ├─ verifySignature()                                    │  │
│  │  ├─ verifyPaymentStatus()                                │  │
│  │  └─ getBanks()                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Payment Table                                           │  │
│  │  ├─ id, userId, amount, currency                         │  │
│  │  ├─ status (PENDING, COMPLETED, FAILED)                  │  │
│  │  ├─ transactionId (unique)                               │  │
│  │  ├─ chapaReference, metadata                             │  │
│  │  └─ paidAt, createdAt, updatedAt                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Wallet Table                                            │  │
│  │  ├─ id, userId (unique), balance                         │  │
│  │  ├─ currency (ETB)                                       │  │
│  │  └─ createdAt, updatedAt                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WalletTransaction Table                                 │  │
│  │  ├─ id, userId, amount                                   │  │
│  │  ├─ type (TOPUP, DEDUCTION)                              │  │
│  │  ├─ reason, createdAt                                    │  │
│  │  └─ Indexed by userId, createdAt                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CreditBundle Table                                      │  │
│  │  ├─ id, name, creditAmount                               │  │
│  │  ├─ priceETB, isActive                                   │  │
│  │  └─ createdAt, updatedAt                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chapa Payment Gateway                                   │  │
│  │  ├─ POST /transaction/initialize                         │  │
│  │  ├─ GET /transaction/verify/{txRef}                      │  │
│  │  ├─ GET /banks                                           │  │
│  │  └─ Webhook: POST /api/payments/webhook                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                     │  │
│  │  ├─ Connection Pool: 10 connections                      │  │
│  │  ├─ Indexes on frequently queried columns                │  │
│  │  └─ Atomic transactions for consistency                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Payment Initialization Flow

```
User clicks "Pay & Start Interview"
        ↓
Dashboard.handleInitiateInterviewPayment()
        ↓
paymentAPI.initialize({
  amount: 5,
  creditAmount: 1,
  type: 'interview'
})
        ↓
POST /api/payments/initialize
        ↓
PaymentController.initialize()
        ↓
PaymentService.initializePayment()
        ├─ Generate unique txRef
        ├─ Create Payment record (PENDING)
        └─ Return payment data
        ↓
ChapaService.generatePaymentUrl()
        ├─ If USE_MOCK_CHAPA=true:
        │  └─ Return mock checkout URL
        └─ If USE_MOCK_CHAPA=false:
           ├─ POST to Chapa API
           ├─ Get checkout_url
           └─ Return checkout_url
        ↓
Response: {
  txRef: "tx_123",
  checkout_url: "https://checkout.chapa.co/...",
  amount: 5,
  creditAmount: 1
}
        ↓
localStorage.setItem('pendingInterviewId', interviewId)
        ↓
window.location.href = checkout_url
        ↓
User redirected to Chapa Payment Gateway
```

### Payment Verification Flow

```
User completes payment on Chapa
        ↓
Chapa redirects to /payment/success?tx_ref=tx_123
        ↓
PaymentSuccess component loads
        ↓
useEffect: verifyPayment()
        ↓
paymentAPI.verifyPayment(txRef)
        ↓
GET /api/payments/verify/{txRef}
        ↓
PaymentController.verify()
        ↓
ChapaService.verifyPaymentStatus(txRef)
        ├─ If USE_MOCK_CHAPA=true:
        │  └─ Return mock success status
        └─ If USE_MOCK_CHAPA=false:
           ├─ GET from Chapa API
           └─ Return payment status
        ↓
PaymentService.verifyAndProcessPayment()
        ├─ Fetch Payment record by txRef
        ├─ Check if already processed (idempotency)
        ├─ Verify amount matches
        ├─ Execute atomic transaction:
        │  ├─ Update Payment to COMPLETED
        │  ├─ Get or create Wallet
        │  ├─ Increment wallet balance
        │  └─ Log transaction
        └─ Return success
        ↓
Response: {
  success: true,
  creditAmount: 1,
  newBalance: 5
}
        ↓
Show success message
        ↓
Countdown 5 seconds
        ↓
localStorage.removeItem('pendingInterviewId')
        ↓
navigate(`/candidate/interview/${interviewId}`)
        ↓
Interview session starts
```

### Webhook Processing Flow

```
Chapa sends webhook to /api/payments/webhook
        ↓
PaymentController.webhook()
        ↓
Verify webhook signature (HMAC-SHA256)
        ├─ If invalid:
        │  └─ Return 401 Unauthorized
        └─ If valid:
           ↓
           PaymentService.verifyAndProcessPayment()
           ├─ Fetch Payment record
           ├─ Check if already processed
           ├─ Verify amount
           ├─ Update Payment status
           ├─ Update Wallet balance
           └─ Log transaction
           ↓
           Return 200 OK
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Interviews Page                          │
│  ├─ Displays list of interviews                             │
│  ├─ "Start AI Interview" button                             │
│  └─ handleStartInterview()                                  │
│     ├─ localStorage.setItem('pendingInterviewId', id)       │
│     ├─ localStorage.setItem('showBillingSection', 'true')   │
│     └─ navigate('/candidate/dashboard')                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Page                           │
│  ├─ useEffect: Check for pendingInterviewId                 │
│  ├─ If found:                                               │
│  │  ├─ setPendingInterviewId(id)                            │
│  │  ├─ setShowPaymentPrompt(true)                           │
│  │  └─ Display payment modal                                │
│  │                                                          │
│  ├─ Payment Modal Component                                 │
│  │  ├─ Shows cost and balance                               │
│  │  ├─ If balance ≥ 1:                                      │
│  │  │  └─ "Start Interview Now" button                      │
│  │  │     └─ navigate(`/candidate/interview/${id}`)         │
│  │  └─ If balance < 1:                                      │
│  │     └─ "Pay & Start Interview" button                    │
│  │        └─ handleInitiateInterviewPayment()               │
│  │           ├─ paymentAPI.initialize()                     │
│  │           ├─ localStorage.setItem('pendingInterviewId')  │
│  │           └─ window.location.href = checkout_url         │
│  │                                                          │
│  └─ Billing & History Section                               │
│     ├─ Wallet balance card                                  │
│     ├─ Analytics cards                                      │
│     ├─ Transaction history list                             │
│     ├─ Filter dropdown                                      │
│     └─ Export CSV button                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Payment Success Page                     │
│  ├─ useEffect: verifyPayment()                              │
│  ├─ paymentAPI.verifyPayment(txRef)                         │
│  ├─ Show success/error status                               │
│  ├─ Countdown timer (5 seconds)                             │
│  └─ Auto-redirect to interview                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Interview Session                        │
│  ├─ Interview questions displayed                           │
│  ├─ Credit deducted from wallet                             │
│  └─ Session begins                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management

### Frontend State (React)

```
Dashboard Component State:
├─ data: DashboardData (interviews, applications, etc.)
├─ loading: boolean
├─ error: string | null
├─ wallet: { balance: number }
├─ transactions: Payment[]
├─ analytics: { totalSpent, successfulTransactions, averageValue }
├─ billingLoading: boolean
├─ billingError: string | null
├─ pendingInterviewId: string | null
├─ showPaymentPrompt: boolean
├─ processingPayment: boolean
├─ filterOpen: boolean
├─ statusFilter: string
└─ page: number

localStorage:
├─ pendingInterviewId: string
├─ showBillingSection: 'true' | 'false'
├─ pendingPaymentTxRef: string
└─ pendingPaymentTime: timestamp
```

### Backend State (Database)

```
Payment Record:
├─ id: UUID
├─ userId: string (FK)
├─ amount: Decimal (5.00)
├─ currency: 'ETB'
├─ paymentMethod: 'chapa'
├─ status: 'PENDING' | 'COMPLETED' | 'FAILED'
├─ transactionId: string (unique)
├─ chapaReference: string | null
├─ metadata: JSON
├─ paidAt: timestamp | null
├─ createdAt: timestamp
└─ updatedAt: timestamp

Wallet Record:
├─ id: UUID
├─ userId: string (FK, unique)
├─ balance: Decimal (5.00)
├─ currency: 'ETB'
├─ createdAt: timestamp
└─ updatedAt: timestamp

WalletTransaction Record:
├─ id: UUID
├─ userId: string (FK)
├─ amount: Decimal (1.00)
├─ type: 'TOPUP' | 'DEDUCTION'
├─ reason: string
└─ createdAt: timestamp
```

---

## Security Architecture

### Authentication & Authorization

```
Request Flow:
├─ Client sends request with JWT token
├─ API Interceptor adds Authorization header
├─ Backend middleware validates JWT
├─ Extract userId from token
├─ Verify user owns the resource
└─ Process request

Token Structure:
├─ Header: { alg: 'HS256', typ: 'JWT' }
├─ Payload: { userId, email, role, iat, exp }
└─ Signature: HMAC-SHA256(secret)
```

### Payment Security

```
Webhook Verification:
├─ Receive webhook from Chapa
├─ Extract signature from headers
├─ Compute HMAC-SHA256(payload, secret)
├─ Compare computed vs received signature
├─ If match: Process webhook
└─ If mismatch: Reject webhook

Idempotency:
├─ Check if Payment already processed
├─ If status = COMPLETED: Return success
├─ If status = PENDING: Process payment
└─ If status = FAILED: Return error

Amount Verification:
├─ Verify payment amount matches request
├─ Prevent tampering with amount
└─ Reject if mismatch
```

### Data Protection

```
Sensitive Data Handling:
├─ Chapa API keys: Environment variables only
├─ Webhook secrets: Environment variables only
├─ User tokens: Secure HTTP-only cookies
├─ Payment details: Encrypted in database
└─ Never log sensitive data

Database Security:
├─ Connection pooling (10 connections)
├─ Prepared statements (prevent SQL injection)
├─ Row-level security (users see own data)
└─ Audit logging (all transactions logged)
```

---

## Performance Optimization

### Database Optimization

```
Indexes:
├─ Payment.userId (for user queries)
├─ Payment.transactionId (for verification)
├─ Payment.status (for filtering)
├─ Wallet.userId (for balance queries)
├─ WalletTransaction.userId (for history)
└─ WalletTransaction.createdAt (for sorting)

Query Optimization:
├─ Pagination (limit 20 per page)
├─ Selective field retrieval
├─ Connection pooling (10 connections)
└─ Query caching (where applicable)
```

### API Optimization

```
Response Caching:
├─ Wallet balance: Cache for 5 seconds
├─ Payment history: Cache for 10 seconds
├─ Analytics: Cache for 30 seconds
└─ Credit bundles: Cache for 1 hour

Request Optimization:
├─ Batch requests where possible
├─ Compress responses (gzip)
├─ Minimize payload size
└─ Use HTTP/2 multiplexing
```

### Frontend Optimization

```
Component Optimization:
├─ Lazy loading (React.lazy)
├─ Memoization (React.memo)
├─ useCallback for event handlers
├─ useMemo for expensive computations
└─ Virtual scrolling for long lists

State Management:
├─ Separate concerns (billing, dashboard)
├─ Avoid prop drilling
├─ Use context for shared state
└─ Minimize re-renders
```

---

## Error Handling Strategy

### Error Types & Responses

```
Authentication Errors (401):
├─ Invalid token
├─ Expired token
├─ Missing token
└─ Response: Redirect to login

Authorization Errors (403):
├─ User doesn't own resource
├─ Insufficient permissions
└─ Response: Show error message

Validation Errors (400):
├─ Invalid input
├─ Missing required fields
├─ Invalid amount
└─ Response: Show validation errors

Payment Errors (400):
├─ Chapa API error
├─ Invalid credentials
├─ Payment failed
└─ Response: Show payment error

Server Errors (500):
├─ Database error
├─ Service error
├─ Unexpected error
└─ Response: Show generic error

Network Errors:
├─ Timeout
├─ Connection refused
├─ DNS resolution failed
└─ Response: Show retry option
```

### Error Recovery

```
Automatic Retry:
├─ Network errors: Retry 3 times
├─ Timeout: Retry with exponential backoff
├─ 5xx errors: Retry with exponential backoff
└─ 4xx errors: Don't retry

Manual Retry:
├─ Show "Try Again" button
├─ Clear error state
├─ Retry request
└─ Show result

Graceful Degradation:
├─ Show cached data if available
├─ Disable features that depend on service
├─ Show offline message
└─ Queue requests for later
```

---

## Deployment Architecture

### Environment Configuration

```
Development:
├─ USE_MOCK_CHAPA=true
├─ NODE_ENV=development
├─ LOG_LEVEL=debug
└─ Database: Local PostgreSQL

Staging:
├─ USE_MOCK_CHAPA=true
├─ NODE_ENV=staging
├─ LOG_LEVEL=info
└─ Database: Staging PostgreSQL

Production:
├─ USE_MOCK_CHAPA=false
├─ NODE_ENV=production
├─ LOG_LEVEL=warn
├─ Database: Production PostgreSQL
└─ Real Chapa credentials
```

### Scaling Strategy

```
Horizontal Scaling:
├─ Multiple server instances
├─ Load balancer (nginx/HAProxy)
├─ Shared database
└─ Redis for caching

Vertical Scaling:
├─ Increase server resources
├─ Optimize database queries
├─ Implement caching
└─ Use CDN for static assets

Database Scaling:
├─ Read replicas for queries
├─ Write master for transactions
├─ Connection pooling
└─ Sharding (if needed)
```

---

## Monitoring & Logging

### Metrics to Monitor

```
Payment Metrics:
├─ Payment success rate
├─ Average payment time
├─ Failed payments
├─ Chapa API errors
└─ Webhook processing time

Performance Metrics:
├─ API response time
├─ Database query time
├─ Error rate
├─ Concurrent users
└─ Memory usage

Business Metrics:
├─ Total revenue
├─ Average transaction value
├─ User retention
├─ Churn rate
└─ Customer lifetime value
```

### Logging Strategy

```
Log Levels:
├─ DEBUG: Detailed information
├─ INFO: General information
├─ WARN: Warning messages
├─ ERROR: Error messages
└─ FATAL: Fatal errors

Log Destinations:
├─ Console (development)
├─ File (production)
├─ Cloud logging (AWS CloudWatch, etc.)
└─ Error tracking (Sentry, etc.)

Sensitive Data:
├─ Never log API keys
├─ Never log payment details
├─ Never log user passwords
├─ Mask sensitive fields
└─ Use structured logging
```

---

## Testing Strategy

### Unit Tests

```
Payment Service:
├─ initializePayment()
├─ verifyAndProcessPayment()
├─ getPaymentHistory()
└─ calculateAnalytics()

Wallet Service:
├─ getBalance()
├─ topupCredits()
├─ deductCredits()
└─ getTransactionHistory()

Chapa Service:
├─ generatePaymentUrl()
├─ verifySignature()
└─ verifyPaymentStatus()
```

### Integration Tests

```
Payment Flow:
├─ Initialize payment
├─ Verify payment
├─ Update wallet
└─ Check transaction history

Wallet Flow:
├─ Get balance
├─ Topup credits
├─ Deduct credits
└─ Get transactions
```

### End-to-End Tests

```
Complete Payment Flow:
├─ User clicks "Pay & Start Interview"
├─ Payment initialized
├─ Redirected to Chapa
├─ Payment completed
├─ Redirected to success page
├─ Wallet updated
└─ Interview starts
```

---

This architecture ensures scalability, security, and reliability for the payment system.
