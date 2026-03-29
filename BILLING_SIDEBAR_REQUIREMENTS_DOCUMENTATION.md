# SimuAI Automated Billing & Wallet System - Sidebar Documentation

## Overview

The BillingSidebar now includes comprehensive information about the SimuAI Automated Billing & Wallet System. This documentation is displayed directly in the sidebar footer for user reference.

## System Overview

**SimuAI Billing System** is an automated, credit-based financial engine that enables Candidates to purchase "AI Interview Credits" using Chapa (Telebirr, CBEBirr, and Banks). The system is designed to handle transactions, update user wallets, and display real-time payment history without any manual intervention.

## Functional Requirements

### 1. Credit Purchase Interface
- Users see predefined credit bundles (e.g., 5 Credits for 25 ETB, 10 Credits for 50 ETB)
- A "Top Up" button triggers the Chapa Payment Gateway
- Bundles are displayed with clear pricing and conversion rates

### 2. Real-time Wallet Display
- System displays current AI Credit Balance on the dashboard
- Balance updates in real-time after successful payment
- Low balance warnings when credits < 1

### 3. Automated Transaction History
Upon successful payment, the "Billing & History" table automatically populates with:
- Date & Time of the transaction
- Transaction Reference (tx_ref)
- Amount Paid (ETB)
- Payment Status (SUCCESS/FAILED)
- Payment Method (Telebirr, CBEBirr, Bank)

### 4. Aggregated Financial Analytics
Dashboard cards calculate dynamically from the database:
- Total Spent (sum of all successful payments in ETB)
- Successful Transactions (count of completed payments)
- Average Transaction Value (mean amount per transaction)
- Credits Remaining (current wallet balance)

## Technical Requirements

### A. Payment Initialization (Backend Logic)

**Endpoint**: `POST /api/payments/initialize`

The system must:
1. Generate a unique `tx_ref` for each attempt
2. Validate the selected credit bundle exists and is active
3. Validate that the bundle amount is positive
4. Create a Payment record with status PENDING
5. Pass metadata to Chapa containing:
   - `userId` - Authenticated user ID
   - `credit_amount` - Number of credits to purchase
   - `bundleName` - Name of the bundle
6. Respond with payment URL and transaction reference within 2 seconds

### B. Webhook & Verification (Automation Engine)

**Endpoint**: `POST /api/payments/webhook`

The Backend must:
1. Provide a Callback/Webhook URL for Chapa to communicate with
2. Perform Server-Side Verification using Chapa's secret key
3. Validate webhook signature using HMAC-SHA256
4. Upon verification, execute a Prisma Transaction to:
   - Create a record in the Payment table
   - Increment the balance in the Wallet table for the specific user
   - Log the transaction for audit purposes
5. Handle idempotent processing (same tx_ref processed only once)
6. Return HTTP 200 within 5 seconds

### C. Data Integrity

The system must ensure:
1. A single `tx_ref` cannot be processed more than once (prevents credit duplication)
2. Atomic transactions (all-or-nothing updates)
3. Optimistic locking for concurrent wallet updates
4. Unique constraints on `tx_ref` and `chapaReference`
5. Immutable audit logs for all transactions

## Database Requirements (Prisma Schema)

### Wallet Table
```
- id: Int (Primary Key)
- userId: Int (Unique)
- balance: Decimal (Default: 0)
- currency: String (Default: "ETB")
- createdAt: DateTime
- updatedAt: DateTime
```

### Payment Table
```
- id: Int (Primary Key)
- userId: Int (Foreign Key)
- amount: Decimal
- creditAmount: Int
- status: PaymentStatus (PENDING, COMPLETED, FAILED)
- transactionId: String (Unique - tx_ref)
- chapaReference: String (Unique)
- paymentMethod: String
- metadata: Json
- paidAt: DateTime
- createdAt: DateTime
- updatedAt: DateTime
```

### CreditBundle Table
```
- id: Int (Primary Key)
- name: String
- creditAmount: Int
- priceETB: Decimal
- isActive: Boolean (Default: true)
- createdAt: DateTime
```

### WalletTransaction Table
```
- id: Int (Primary Key)
- userId: Int (Foreign Key)
- amount: Decimal
- type: String (TOPUP, DEDUCT, REFUND)
- reason: String
- createdAt: DateTime
```

## Business Logic

### The 5 ETB Rule

**Conversion**: 1 AI Credit = 5 ETB

This rule is enforced at all system levels:
- Credit bundle pricing: `priceETB = creditAmount * 5`
- Payment initialization: Validates conversion ratio
- Wallet updates: Credits stored as integers
- Analytics: Displays both credits and ETB amounts

### Access Control

**Interview Start Requirement**: The "Start AI Interview" button shall remain disabled if the user's Wallet Balance is less than 1 credit.

Implementation:
1. Check wallet balance before interview creation
2. Disable button in UI if balance < 1
3. Return 402 (Payment Required) error if API called without sufficient credits
4. Display "Top Up" prompt with link to billing sidebar

## API Endpoints

### Payment Endpoints

1. **Initialize Payment**
   - `POST /api/payments/initialize`
   - Requires: JWT authentication
   - Returns: txRef, paymentUrl, amount, creditAmount

2. **Webhook Handler**
   - `POST /api/payments/webhook`
   - Requires: Signature validation
   - Returns: Success/failure status

3. **Get Payment History**
   - `GET /api/payments/history`
   - Requires: JWT authentication
   - Supports: Filtering, sorting, pagination

4. **Get Financial Analytics**
   - `GET /api/payments/analytics`
   - Requires: JWT authentication
   - Returns: totalSpent, successfulTransactions, averageValue, creditsRemaining

5. **Get Credit Bundles**
   - `GET /api/payments/bundles`
   - No authentication required
   - Returns: List of active bundles

6. **Export Transaction History**
   - `GET /api/payments/export`
   - Requires: JWT authentication
   - Returns: CSV file download

### Wallet Endpoints

1. **Get Wallet Balance**
   - `GET /api/wallet/balance`
   - Requires: JWT authentication
   - Returns: balance, currency

2. **Get Wallet Transactions**
   - `GET /api/wallet/transactions`
   - Requires: JWT authentication
   - Returns: List of wallet transactions

3. **Check Credits**
   - `GET /api/wallet/check-credits`
   - Requires: JWT authentication
   - Returns: hasSufficientCredits, balance, requiredCredits

## Security Implementation

### Authentication
- All payment endpoints require JWT authentication
- Webhook uses signature validation instead of JWT
- userId in request must match authenticated user

### Signature Validation
- Webhook signature validated using HMAC-SHA256
- Chapa secret key stored in environment variables
- Invalid signatures rejected with 401 error

### Data Protection
- HTTPS enforced for all endpoints
- Sensitive credentials stored in environment variables
- Logs sanitized to exclude sensitive data
- Rate limiting: 10 payment requests per user per minute

## Performance Targets

- **Payment Initialization**: < 2 seconds
- **Wallet Balance Update**: < 5 seconds
- **Transaction History Query**: < 1 second
- **Concurrent Payments**: Support 100+ simultaneous requests
- **Database Indexes**: Optimized for userId, createdAt, status, txRef

## Error Handling

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid bundle ID or amount | Bundle doesn't exist or amount not positive |
| 401 | Unauthorized | Missing or invalid JWT token |
| 402 | Insufficient credits | Wallet balance < required amount |
| 403 | Forbidden: userId mismatch | Authenticated user doesn't match request |
| 404 | Wallet not found | User wallet doesn't exist |
| 409 | Duplicate tx_ref | Transaction already processed |
| 503 | Chapa API unavailable | Chapa service down or unreachable |

## Sidebar Information Sections

The BillingSidebar displays the following information in the footer:

1. **System Overview** - Brief description of the billing system
2. **Credit Bundles** - How users purchase credits
3. **Real-time Wallet** - Wallet display and transaction history
4. **Payment Processing** - How payments are initialized and verified
5. **Data Integrity** - Duplicate prevention and atomic transactions
6. **Business Logic** - 1 Credit = 5 ETB rule and access control
7. **Payment Methods** - Supported payment methods (Telebirr, CBEBirr, Banks)
8. **Processing** - Real-time updates and instant credit delivery

## Testing the System

### Manual Testing Steps

1. **Test Payment Flow**
   - Log in as candidate
   - Open billing sidebar
   - Click "Top Up" on a bundle
   - Complete payment at Chapa
   - Verify wallet balance updates
   - Check transaction history

2. **Test Access Control**
   - Deplete wallet to 0 credits
   - Verify "Start Interview" button is disabled
   - Verify "Top Up" prompt appears
   - Purchase credits
   - Verify button becomes enabled

3. **Test Data Integrity**
   - Attempt to process same tx_ref twice
   - Verify credit not duplicated
   - Check transaction history shows only one entry

4. **Test Analytics**
   - Make multiple payments
   - Verify analytics cards calculate correctly
   - Check total spent, transaction count, average value

## Deployment Checklist

- [ ] Environment variables configured (CHAPA_API_KEY, CHAPA_SECRET_KEY)
- [ ] Database migrations applied
- [ ] Credit bundles seeded
- [ ] Webhook URL configured in Chapa dashboard
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Logging and monitoring set up
- [ ] Error tracking configured
- [ ] Backup strategy in place

## Support & Troubleshooting

### Common Issues

**Issue**: "Chapa API key is not configured"
- **Solution**: Ensure CHAPA_API_KEY and CHAPA_SECRET_KEY are set in .env

**Issue**: "Wallet not found"
- **Solution**: Wallet is auto-created on first access. Check database connection.

**Issue**: "Invalid webhook signature"
- **Solution**: Verify CHAPA_SECRET_KEY matches Chapa dashboard

**Issue**: "Insufficient credits"
- **Solution**: User needs to top up wallet. Check balance with /api/wallet/balance

## Summary

The SimuAI Automated Billing & Wallet System provides:
- ✅ Automated credit-based payment processing
- ✅ Real-time wallet management
- ✅ Secure payment gateway integration
- ✅ Comprehensive transaction history
- ✅ Financial analytics
- ✅ Data integrity and idempotency
- ✅ Professional error handling
- ✅ High performance and scalability

All requirements have been implemented and are production-ready.
