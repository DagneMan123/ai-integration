# Prisma Import Fix - Admin Controller

## Issue
The admin controller was throwing "Cannot read properties of undefined (reading 'findMany')" error when trying to fetch support tickets.

## Root Cause
The admin controller was importing Prisma incorrectly:
```javascript
// ❌ WRONG
const { prisma } = require('../config/database');
```

The `config/database.js` file doesn't export a destructured `prisma` object. The correct Prisma client is exported from `lib/prisma.js`.

## Solution
Changed the import to use the correct Prisma client location:

**File**: `server/controllers/adminController.js`

```javascript
// ✅ CORRECT
const prisma = require('../lib/prisma');
```

## Why This Works

- `lib/prisma.js` exports the Prisma client directly (not destructured)
- This is the same pattern used in other controllers and routes
- The client is properly initialized with connection pooling and error handling
- Matches the pattern used in `dashboardController.js`, `helpCenter.js`, etc.

## Verification

After the fix:
- ✅ Admin support tickets endpoint works
- ✅ No more "Cannot read properties of undefined" errors
- ✅ Prisma queries execute successfully
- ✅ Support tickets load in admin panel

## Related Files

Other files using the correct import:
- `server/routes/dashboard.js` - Uses `require('../lib/prisma')`
- `server/routes/helpCenter.js` - Uses `require('../lib/prisma')`
- `server/routes/admin.js` - Uses `require('../lib/prisma')`
- `server/middleware/auth.js` - Uses `require('../lib/prisma')`

## Notes

- This is a common pattern issue when multiple Prisma client instances exist
- Always use `lib/prisma.js` for the main Prisma client
- The client is a singleton and should be imported consistently across the application
- No destructuring needed - the file exports the client directly
