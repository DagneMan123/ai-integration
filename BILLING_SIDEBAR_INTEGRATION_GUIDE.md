# BillingSidebar Integration Guide

## Overview

The BillingSidebar has been removed from the Navbar header. It's now available as a standalone component that can be integrated into dashboard pages and other locations where you want to display billing features.

## Changes Made

✅ **Removed from Navbar**:
- Removed "Billing" button from navbar header
- Removed BillingSidebar import from Navbar
- Removed billingOpen state from Navbar
- Navbar is now cleaner and simpler

## How to Use BillingSidebar in Your Pages

### 1. Import the Component

```typescript
import BillingSidebar from '../components/BillingSidebar';
```

### 2. Add State Management

```typescript
const [billingOpen, setBillingOpen] = useState(false);
```

### 3. Add Trigger Button

```typescript
<button
  onClick={() => setBillingOpen(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors font-semibold"
>
  <CreditCard size={18} />
  Top Up Credits
</button>
```

### 4. Render the Sidebar

```typescript
<BillingSidebar isOpen={billingOpen} onClose={() => setBillingOpen(false)} />
```

## Example Implementation

### Candidate Dashboard

```typescript
import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import BillingSidebar from '../components/BillingSidebar';

const CandidateDashboard: React.FC = () => {
  const [billingOpen, setBillingOpen] = useState(false);

  return (
    <div className="p-6">
      {/* Header with Billing Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => setBillingOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-semibold"
        >
          <CreditCard size={18} />
          Manage Billing
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your dashboard cards here */}
      </div>

      {/* Billing Sidebar */}
      <BillingSidebar isOpen={billingOpen} onClose={() => setBillingOpen(false)} />
    </div>
  );
};

export default CandidateDashboard;
```

## Recommended Locations to Add BillingSidebar

1. **Candidate Dashboard** (`client/src/pages/candidate/Dashboard.tsx`)
   - Add "Manage Billing" button in header
   - Allow quick access to wallet and payment history

2. **Candidate Payments Page** (`client/src/pages/candidate/Payments.tsx`)
   - Add "Top Up Credits" button
   - Display billing information

3. **Interview Session Page** (`client/src/pages/candidate/InterviewSession.tsx`)
   - Add "Buy Credits" button when balance is low
   - Quick access to purchase credits before interview

4. **Settings Page** (`client/src/pages/candidate/Settings.tsx`)
   - Add "Billing Settings" section
   - Link to billing sidebar

## Features Available in BillingSidebar

### 1. Top Up Tab
- Display credit bundles
- Show pricing (1 Credit = 5 ETB)
- "Top Up" button for each bundle
- Redirect to Chapa payment gateway

### 2. History Tab
- View transaction history
- Filter by status, method, date range
- Sort by date, amount, status
- Export as CSV

### 3. Analytics Tab
- Total Spent (ETB)
- Successful Transactions (count)
- Average Transaction Value
- Credits Remaining

## API Endpoints Used

The BillingSidebar uses these endpoints:

```
GET  /api/wallet/balance
GET  /api/payments/bundles
GET  /api/payments/history
GET  /api/payments/analytics
POST /api/payments/initialize
GET  /api/payments/export
```

All endpoints require JWT authentication (except `/api/payments/bundles`).

## Styling & Customization

The BillingSidebar uses Tailwind CSS and can be customized by modifying:

- Colors: Change `indigo-600` to your brand color
- Width: Change `w-96` to adjust sidebar width
- Animations: Modify transition classes
- Icons: Replace lucide-react icons

## Error Handling

The sidebar includes built-in error handling:

- Network errors display user-friendly messages
- Failed payments show retry options
- Low balance warnings
- Loading states during API calls

## Performance Considerations

- Data is fetched only when sidebar opens
- Implements proper loading states
- Uses React hooks for state management
- Optimized API calls with proper error handling

## Testing

To test the BillingSidebar:

1. Navigate to a page with the sidebar
2. Click the billing button
3. Verify wallet balance loads
4. Test each tab (Top Up, History, Analytics)
5. Test export functionality
6. Test payment initialization

## Next Steps

1. Add BillingSidebar to Candidate Dashboard
2. Add BillingSidebar to Payments page
3. Add BillingSidebar to Interview Session page
4. Test all functionality
5. Customize styling to match your brand

## Support

For issues or questions:
- Check browser console for errors
- Verify API endpoints are working
- Check JWT token is valid
- Review server logs for backend errors

---

**Status**: ✅ Ready for integration into dashboard pages
