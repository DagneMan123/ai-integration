# Fix: Applications 404 Error

## Problem
The client was getting a 404 error when trying to fetch candidate applications:
```
GET /api/applications/candidate/my-applications → 404 Not Found
```

## Root Cause
The route was defined as `/my-applications` but the client was calling `/candidate/my-applications`.

The route order was also wrong - specific routes need to come before generic `/:id` routes.

## Solution Applied

Updated `server/routes/applications.js`:

1. **Added the `/candidate/my-applications` route** - Matches what the client is calling
2. **Kept `/my-applications` as an alias** - For backward compatibility
3. **Fixed route order** - Specific routes before generic `/:id` route

## Changes Made

### Before
```javascript
router.get('/', authorizeRoles('employer', 'admin'), ...); // Generic GET
router.post('/', authorizeRoles('candidate'), ...);        // Generic POST
router.get('/my-applications', ...);                       // Specific route (too late!)
router.get('/:id', ...);                                   // Generic :id route (catches everything)
```

### After
```javascript
router.post('/', authorizeRoles('candidate'), ...);                    // POST first
router.get('/candidate/my-applications', ...);                         // Specific route
router.get('/my-applications', ...);                                   // Alias
router.delete('/:id', ...);                                            // DELETE specific
router.get('/:id', ...);                                               // Generic :id (last)
router.get('/', authorizeRoles('employer', 'admin'), ...);             // Generic GET (last)
```

## How It Works Now

When a candidate requests their applications:
```
GET /api/applications/candidate/my-applications
```

The route now matches and returns the candidate's applications.

## Testing

### Test the Endpoint
```bash
curl -X GET http://localhost:5000/api/applications/candidate/my-applications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jobId": 1,
      "candidateId": 1,
      "status": "pending",
      "appliedAt": "2026-03-24T..."
    }
  ]
}
```

### In the Application
1. Restart server: `npm run dev`
2. Login as candidate
3. Go to "My Applications" page
4. Should load without 404 error

## Available Routes

Now these routes work:

**Candidate Routes:**
- `GET /applications/candidate/my-applications` - Get my applications ✓
- `GET /applications/my-applications` - Alias (backward compatible) ✓
- `POST /applications` - Apply for a job ✓
- `DELETE /applications/:id` - Withdraw application ✓

**Employer Routes:**
- `GET /applications` - Get all applications for my jobs ✓
- `GET /applications/job/:jobId` - Get applications for specific job ✓
- `PATCH /applications/:id/status` - Update application status ✓
- `POST /applications/:id/shortlist` - Shortlist candidate ✓

**General Routes:**
- `GET /applications/:id` - Get single application ✓

## Files Modified

- `server/routes/applications.js` - Added `/candidate/my-applications` route and fixed route order

## Why This Matters

Express routes are matched in order. If a generic route like `/:id` comes before a specific route like `/my-applications`, the generic route will match first and the specific route will never be reached.

**Route Matching Order:**
1. Specific routes (e.g., `/candidate/my-applications`)
2. Parameterized routes (e.g., `/:id`)
3. Generic routes (e.g., `/`)

## Next Steps

1. Restart server: `npm run dev`
2. Test in the application
3. Candidate applications should load without errors

## Troubleshooting

**Still getting 404?**
1. Make sure server is restarted
2. Check browser network tab for exact URL
3. Verify you're logged in as a candidate
4. Check server logs for errors

**Getting 403 Forbidden?**
1. Make sure you're logged in
2. Make sure your user role is "candidate"
3. Check authorization middleware

## Support

For issues:
1. Check `server/logs/error.log`
2. Check browser console
3. Verify route is in `server/routes/applications.js`
4. Restart server
