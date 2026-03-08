# Chapa Payment Integration - Complete Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SimuAI Platform                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────┐          │
│  │   Frontend Client    │         │   Backend Server     │          │
│  │  (React/TypeScript)  │         │   (Node.js/Express)  │          │
│  │                      │         │                      │          │
│  │ Subscription.tsx     │◄───────►│ paymentController.js │          │
│  │                      │ HTTP    │ chapaService.js      │          │
│  └──────────────────────┘         └──────────────────────┘          │
│           │                                │                         │
│           │                                │                         │
│           │                                ▼                         │
│           │                        ┌──────────────────┐              │
│           │                        │  PostgreSQL DB   │              │
│           │                        │                  │              │
│           │                        │ Payment Table    │              │
│           │                        │ - id             │              │
│           │                        │ - userId         │              │
│           │                        │ - transactionId  │              │
│           │                        │ - status         │              │
│           │                        │ - amount         │              │
│           │                        └──────────────────┘              │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            │ HTTPS
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Chapa Payment Gateway                           │
│                   (https://api.chapa.co/v1)                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /transaction/initialize  - Start payment                   │  │
│  │  /transaction/verify/:tx_ref - Verify payment               │  │
│  │  /banks - Get available banks                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Complete Payment Flow - Step by Step

### Phase 1: Payment Initialization

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Clicks "Subscribe Now"                                 │
└─────────────────────────────────────────────────────────────────────┘

Frontend (Subscription.tsx)
  │
  ├─ User selects plan (Basic: 999 ETB)
  │
  ├─ handleSubscribe() called
  │
  └─ paymentAPI.initializePayment({
       amount: 999,
       type: 'subscription',
       description: 'Basic Plan - Monthly Subscription'
     })

         │
         │ POST /api/payments/initialize
         │ Headers: Authorization: Bearer {token}
         │
         ▼

Backend (paymentController.js - initializePayment)
  │
  ├─ Validate input
  │  ├─ amount > 0? ✓
  │  ├─ type provided? ✓
  │  └─ user authenticated? ✓
  │
  ├─ Create Payment record
  │  ├─ userId: req.user.id
  │  ├─ amount: 999
  │  ├─ currency: 'ETB'
  │  ├─ paymentMethod: 'chapa'
  │  ├─ status: 'PENDING'
  │  ├─ transactionId: 'TX-1234567890-abc123'
  │  └─ metadata: { type: 'subscription' }
  │
  ├─ Call Chapa API
  │  │
  │  └─ initializeChapa({
  │       amount: 999,
  │       email: user@example.com,
  │       first_name: 'John',
  │       last_name: 'Doe',
  │       tx_ref: 'TX-1234567890-abc123',
  │       callback_url: 'http://localhost:3000/payment/callback',
  │       return_url: 'http://localhost:3000/payment/success',
  │       customization: {
  │         title: 'SimuAI Payment',
  │         description: 'Basic Plan - Monthly Subscription'
  │       }
  │     })
  │
  ├─ Chapa API Response
  │  ├─ status: 'success'
  │  ├─ data: {
  │  │   id: 'chapa_tx_123',
  │  │   checkout_url: 'https://checkout.chapa.co/...',
  │  │   status: 'pending'
  │  │ }
  │  └─ message: 'Hosted Link created'
  │
  ├─ Update Payment record
  │  ├─ chapaReference: 'https://checkout.chapa.co/...'
  │  └─ metadata: { chapaData: {...} }
  │
  └─ Return response
     {
       success: true,
       data: {
         paymentId: 'uuid',
         transactionRef: 'TX-1234567890-abc123',
         checkoutUrl: 'https://checkout.chapa.co/...',
         amount: 999
       }
     }

         │
         │ Response with checkoutUrl
         │
         ▼

Frontend (Subscription.tsx)
  │
  ├─ Receive checkoutUrl
  │
  ├─ window.location.href = checkoutUrl
  │
  └─ Redirect to Chapa checkout page
```

### Phase 2: Payment Processing

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: User Completes Payment on Chapa                             │
└─────────────────────────────────────────────────────────────────────┘

User on Chapa Checkout Page
  │
  ├─ Select payment method
  │  ├─ Bank transfer
  │  ├─ Mobile money (Telebirr, Ethio Telecom)
  │  └─ Card payment
  │
  ├─ Enter payment details
  │
  ├─ Confirm payment
  │
  └─ Chapa processes payment
     │
     ├─ Payment successful ✓
     │  └─ Redirect to: http://localhost:3000/payment/success
     │
     └─ Payment failed ✗
        └─ Redirect to: http://localhost:3000/payment/callback
```

### Phase 3: Payment Verification

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: Verify Payment Status                                       │
└─────────────────────────────────────────────────────────────────────┘

Frontend (after redirect from Chapa)
  │
  ├─ Extract tx_ref from URL params
  │  └─ tx_ref = 'TX-1234567890-abc123'
  │
  ├─ paymentAPI.verifyPayment(tx_ref)
  │
  └─ GET /api/payments/verify/TX-1234567890-abc123
     Headers: Authorization: Bearer {token}

         │
         │
         ▼

Backend (paymentController.js - verifyPayment)
  │
  ├─ Validate tx_ref provided
  │
  ├─ Find Payment by transactionId ✅ FIXED
  │  └─ SELECT * FROM Payment WHERE transactionId = 'TX-1234567890-abc123'
  │
  ├─ Call Chapa API to verify
  │  │
  │  └─ verifyChapa('TX-1234567890-abc123')
  │     │
  │     └─ GET /transaction/verify/TX-1234567890-abc123
  │        Headers: Authorization: Bearer {CHAPA_SECRET_KEY}
  │
  ├─ Chapa API Response
  │  ├─ status: 'success'
  │  ├─ data: {
  │  │   status: 'success',
  │  │   amount: 999,
  │  │   currency: 'ETB',
  │  │   tx_ref: 'TX-1234567890-abc123',
  │  │   reference: 'chapa_ref_123'
  │  │ }
  │  └─ message: 'Transaction verified'
  │
  ├─ Update Payment status ✅ FIXED (uppercase)
  │  ├─ status: 'COMPLETED'
  │  ├─ paidAt: NOW()
  │  └─ metadata: { verificationData: {...} }
  │
  └─ Return response
     {
       success: true,
       message: 'Payment verified successfully',
       data: {
         paymentId: 'uuid',
         status: 'COMPLETED'
       }
     }

         │
         │ Verification result
         │
         ▼

Frontend (Subscription.tsx)
  │
  ├─ Receive verification result
  │
  ├─ If success
  │  ├─ Show success toast
  │  ├─ Update subscription status
  │  └─ Redirect to dashboard
  │
  └─ If failed
     ├─ Show error toast
     └─ Allow retry
```

### Phase 4: Webhook Notification (Async)

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: Chapa Sends Webhook Notification                            │
└─────────────────────────────────────────────────────────────────────┘

Chapa Server (after payment completion)
  │
  ├─ Payment completed
  │
  ├─ Send webhook notification
  │
  └─ POST /api/payments/webhook
     Headers: x-chapa-signature: {signature}
     Body: {
       tx_ref: 'TX-1234567890-abc123',
       event: 'charge.completed',
       status: 'success'
     }

         │
         │
         ▼

Backend (paymentController.js - chapaWebhook)
  │
  ├─ Validate webhook signature ✅ NEW
  │  └─ x-chapa-signature === CHAPA_WEBHOOK_SECRET
  │
  ├─ Extract tx_ref from body
  │  └─ tx_ref = 'TX-1234567890-abc123'
  │
  ├─ Check event type
  │  └─ event === 'charge.completed' || status === 'success'
  │
  ├─ Find Payment by transactionId ✅ FIXED
  │  └─ SELECT * FROM Payment WHERE transactionId = 'TX-1234567890-abc123'
  │
  ├─ Update Payment status ✅ FIXED (uppercase)
  │  ├─ status: 'COMPLETED'
  │  ├─ paidAt: NOW()
  │  └─ metadata: { webhookData: {...} }
  │
  ├─ Log success ✅ IMPROVED
  │  └─ "Payment completed via webhook: {paymentId}"
  │
  └─ Return response
     {
       success: true,
       message: 'Webhook processed'
     }
```

## Database State Changes

```
┌─────────────────────────────────────────────────────────────────────┐
│ Payment Record Lifecycle                                             │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: After Initialization
┌────────────────────────────────────────────────────────────────┐
│ id          │ 550e8400-e29b-41d4-a716-446655440000            │
│ userId      │ 660e8400-e29b-41d4-a716-446655440001            │
│ amount      │ 999                                              │
│ currency    │ ETB                                              │
│ paymentMethod│ chapa                                            │
│ status      │ PENDING                                          │
│ transactionId│ TX-1234567890-abc123                            │
│ chapaReference│ https://checkout.chapa.co/...                 │
│ paidAt      │ NULL                                             │
│ createdAt   │ 2026-03-08 10:00:00                             │
└────────────────────────────────────────────────────────────────┘

STEP 2: After Payment Completion (Verification or Webhook)
┌────────────────────────────────────────────────────────────────┐
│ id          │ 550e8400-e29b-41d4-a716-446655440000            │
│ userId      │ 660e8400-e29b-41d4-a716-446655440001            │
│ amount      │ 999                                              │
│ currency    │ ETB                                              │
│ paymentMethod│ chapa                                            │
│ status      │ COMPLETED ✅ UPDATED                            │
│ transactionId│ TX-1234567890-abc123                            │
│ chapaReference│ https://checkout.chapa.co/...                 │
│ paidAt      │ 2026-03-08 10:05:00 ✅ SET                      │
│ createdAt   │ 2026-03-08 10:00:00                             │
└────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ Error Scenarios and Recovery                                         │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: Invalid Amount
  │
  ├─ Frontend sends amount: 0 or negative
  │
  ├─ Backend validation fails
  │
  └─ Response: 400 Bad Request
     {
       error: 'Invalid amount'
     }

Scenario 2: Chapa API Error
  │
  ├─ Chapa API returns 401 (invalid credentials)
  │
  ├─ Backend catches error
  │
  ├─ Logs: "Chapa initialization error: 401"
  │
  └─ Response: 500 Internal Server Error
     {
       error: 'Payment initialization failed: 401'
     }

Scenario 3: Payment Not Found During Verification
  │
  ├─ Frontend sends invalid tx_ref
  │
  ├─ Backend searches database
  │
  ├─ Payment not found
  │
  ├─ Logs: "Payment not found: invalid_tx_ref"
  │
  └─ Response: 404 Not Found
     {
       error: 'Payment not found'
     }

Scenario 4: Invalid Webhook Signature
  │
  ├─ Chapa sends webhook with wrong signature
  │
  ├─ Backend validates signature
  │
  ├─ Signature mismatch
  │
  ├─ Logs: "Invalid webhook signature received"
  │
  └─ Response: 401 Unauthorized
     {
       error: 'Invalid webhook signature'
     }
```

## Key Fixes Applied

```
┌─────────────────────────────────────────────────────────────────────┐
│ Bug Fixes Summary                                                    │
└─────────────────────────────────────────────────────────────────────┘

1. Webhook Field Name ✅
   BEFORE: where: { transactionRef: tx_ref }
   AFTER:  where: { transactionId: tx_ref }
   IMPACT: Webhook now finds payment records

2. Status Case ✅
   BEFORE: status: 'completed'
   AFTER:  status: 'COMPLETED'
   IMPACT: Status matches database schema

3. Webhook Signature Validation ✅
   BEFORE: No validation
   AFTER:  Validates x-chapa-signature header
   IMPACT: Webhook is now secure

4. Error Logging ✅
   BEFORE: Generic error messages
   AFTER:  Detailed API response logging
   IMPACT: Easier debugging

5. API URL ✅
   BEFORE: process.env.CHAPA_URL || 'https://api.chapa.co/v1'
   AFTER:  'https://api.chapa.co/v1'
   IMPACT: Consistent endpoint
```

## Testing Checklist

```
┌─────────────────────────────────────────────────────────────────────┐
│ Verification Steps                                                   │
└─────────────────────────────────────────────────────────────────────┘

Phase 1: Initialization
  [ ] Frontend sends payment request
  [ ] Backend creates Payment record
  [ ] Payment status is PENDING
  [ ] transactionId is generated (TX-...)
  [ ] Chapa API returns checkout URL
  [ ] Frontend redirects to checkout

Phase 2: Payment Processing
  [ ] User completes payment on Chapa
  [ ] Chapa redirects back to app
  [ ] URL contains tx_ref parameter

Phase 3: Verification
  [ ] Frontend calls verify endpoint
  [ ] Backend finds Payment by transactionId
  [ ] Chapa API confirms payment
  [ ] Payment status updates to COMPLETED
  [ ] paidAt timestamp is set

Phase 4: Webhook
  [ ] Chapa sends webhook notification
  [ ] Backend validates signature
  [ ] Backend finds Payment by transactionId
  [ ] Payment status updates to COMPLETED
  [ ] Webhook response is 200 OK

Database
  [ ] Payment record created
  [ ] All fields populated correctly
  [ ] Status is uppercase
  [ ] transactionId is unique
  [ ] paidAt is set after completion
```
