# Admin Support Tickets Endpoint Implementation

## Issue
The admin support tickets page was returning a 404 error when trying to fetch support tickets from `/api/admin/support-tickets`.

## Solution
Created the missing admin support tickets endpoint with full CRUD operations.

## Files Modified

### 1. Server Routes
**File**: `server/routes/admin.js`

Added two new routes:
```javascript
// Support tickets
router.get('/support-tickets', adminController.getSupportTickets);
router.patch('/support-tickets/:id/status', adminController.updateTicketStatus);
```

### 2. Admin Controller
**File**: `server/controllers/adminController.js`

Added two new methods:

#### `getSupportTickets()`
- Fetches all support tickets from the database
- Supports filtering by status and priority
- Includes pagination (page, limit)
- Returns formatted ticket data with user information
- Includes pagination metadata

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Issue with login",
      "description": "Cannot login to my account",
      "submittedBy": "John Doe",
      "email": "john@example.com",
      "status": "open",
      "priority": "medium",
      "createdAt": "Apr 10, 2026, 9:10:31 AM",
      "category": "technical"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

#### `updateTicketStatus()`
- Updates the status of a support ticket
- Validates status values: 'open', 'in_progress', 'resolved', 'closed'
- Logs the activity for audit trail
- Returns updated ticket data

**Request Body**:
```json
{
  "status": "in_progress"
}
```

## Features

✅ **Fetch Support Tickets**
- Get all support tickets with pagination
- Filter by status
- Include user information
- Proper error handling

✅ **Update Ticket Status**
- Change ticket status
- Validate status values
- Log all changes
- Return updated ticket

✅ **Security**
- Admin-only access (via `authorizeRoles('admin')`)
- Activity logging for audit trail
- Input validation

✅ **Database Integration**
- Uses Prisma ORM
- Queries `supportTicket` model
- Includes related user data
- Proper error handling

## API Endpoints

### Get Support Tickets
```
GET /api/admin/support-tickets
Query Parameters:
  - status: 'open' | 'in_progress' | 'resolved' | 'closed'
  - priority: filter by priority
  - page: page number (default: 1)
  - limit: items per page (default: 20)

Response: 200 OK
```

### Update Ticket Status
```
PATCH /api/admin/support-tickets/:id/status
Body: { "status": "in_progress" }

Response: 200 OK
```

## Testing

After deployment:

1. **Login as admin**
   - Email: `admin@simuai.com`
   - Password: `admin123`

2. **Navigate to Admin Dashboard**
   - Click "Support Tickets" button in header

3. **Verify tickets load**
   - Should see list of support tickets
   - No 404 errors in console
   - Pagination should work

4. **Test status update**
   - Click on a ticket
   - Change status
   - Should update without errors

## Database Schema

The endpoint uses the existing `SupportTicket` model:
```prisma
model SupportTicket {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  subject   String
  message   String
  category  String
  status    String    @default("open")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])
}
```

## Error Handling

- Invalid status values return 400 Bad Request
- Non-existent tickets return 404 Not Found
- Database errors are logged and return 500 Internal Server Error
- All errors include descriptive messages

## Activity Logging

All ticket status updates are logged in the `ActivityLog` table:
- Action: `TICKET_STATUS_UPDATED`
- Includes admin user ID, IP address, and user agent
- Provides audit trail for compliance

## Notes

- Support tickets are created via the help center endpoint (`/api/help-center/support-ticket`)
- This endpoint is for admin management and viewing
- Pagination defaults to 20 items per page
- All timestamps are in ISO format
- User information is included for context
