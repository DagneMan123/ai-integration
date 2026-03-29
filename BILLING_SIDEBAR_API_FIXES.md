# BillingSidebar API Import Fixes

## Issue
The BillingSidebar component was importing `api` incorrectly, causing compilation errors:

```
ERROR in ./src/components/BillingSidebar.tsx
export 'api' (imported as 'api') was not found in '../utils/api'
```

## Root Cause
The `api.ts` file exports:
- `api` as the default export (the axios instance)
- Named exports: `authAPI`, `paymentAPI`, `jobAPI`, etc.

The BillingSidebar was trying to import `api` as a named export instead of using the default export.

## Solution

### Before
```typescript
import { api } from '../utils/api';
```

### After
```typescript
import api, { paymentAPI } from '../utils/api';
```

## API Calls Updated

All API calls in BillingSidebar now use the correct axios instance:

1. **Fetch Wallet Balance**
   ```typescript
   const walletRes = await api.get('/wallet/balance');
   ```

2. **Fetch Credit Bundles**
   ```typescript
   const bundlesRes = await api.get('/payments/bundles');
   ```

3. **Fetch Transaction History**
   ```typescript
   const historyRes = await api.get('/payments/history?limit=5');
   ```

4. **Fetch Analytics**
   ```typescript
   const analyticsRes = await api.get('/payments/analytics');
   ```

5. **Initialize Payment**
   ```typescript
   const response = await api.post('/payments/initialize', {
     bundleId,
     userId: localStorage.getItem('userId')
   });
   ```

6. **Export Transaction History**
   ```typescript
   const response = await api.get('/payments/export?format=csv', {
     responseType: 'blob'
   });
   ```

## Response Handling

Updated response handling to account for API response structure:

```typescript
// Before
setWallet(walletRes.data);

// After
setWallet(walletRes.data.data || walletRes.data);
```

This ensures compatibility with both response formats:
- `{ data: { balance: 10 } }` - nested data
- `{ balance: 10 }` - direct data

## Verification

✅ No compilation errors
✅ All API endpoints properly configured
✅ Response handling robust
✅ Component ready for testing

## Testing

To test the billing sidebar:

1. Log in as a candidate
2. Click "Billing" button in navbar
3. Verify wallet balance loads
4. Verify credit bundles display
5. Verify transaction history loads
6. Verify analytics cards display
7. Test "Top Up" button
8. Test export functionality

## Files Modified

- `client/src/components/BillingSidebar.tsx`

## Status

✅ **FIXED** - All API import and usage errors resolved
