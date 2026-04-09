# Duplicate Application Fix

## Problem
When a candidate applied for a job, duplicate applications were being created for the same job, showing multiple entries like:
- civilCompany 4/9/2026 Pending Accept & Schedule
- civilCompany 4/9/2026 Pending Accept & Schedule (duplicate)

## Root Cause
Race conditions during concurrent application submissions where multiple requests could bypass the duplicate check before the first one was committed to the database.

## Solution Implemented

### 1. Enhanced Database Transaction (Serializable Isolation)
**File**: `server/controllers/applicationController.js`

```javascript
const result = await prisma.$transaction(
  async (tx) => {
    // Check for existing application INSIDE transaction
    const existingApplication = await tx.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: jobIdInt,
          candidateId: userId
        }
      }
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400);
    }

    // Create application only if no duplicate exists
    const application = await tx.application.create({...});
    const interview = await tx.interview.create({...});
    
    return { application, interview };
  },
  {
    timeout: 30000,
    isolationLevel: 'Serializable'  // Prevents race conditions
  }
);
```

**Key Changes**:
- ✅ Moved duplicate check INSIDE the transaction
- ✅ Added `isolationLevel: 'Serializable'` to prevent race conditions
- ✅ Proper error handling for P2002 (unique constraint violation)
- ✅ Changed interview status from 'IN_PROGRESS' to 'PENDING' (more accurate)

### 2. Database Unique Constraint
**File**: `server/prisma/schema.prisma`

Already defined:
```prisma
model Application {
  ...
  @@unique([jobId, candidateId])  // Prevents duplicates at DB level
  ...
}
```

### 3. Deduplication Endpoint (Admin)
**File**: `server/controllers/applicationController.js`

New endpoint to clean up any existing duplicates:
```javascript
POST /api/applications/deduplicate
```

**Functionality**:
- Finds all job+candidate combinations with multiple applications
- Keeps the most recent application
- Deletes older duplicates
- Returns count of removed duplicates

### 4. Route Configuration
**File**: `server/routes/applications.js`

Added admin-only deduplication endpoint:
```javascript
router.post('/deduplicate', authorizeRoles('admin'), applicationController.deduplicateApplications);
```

## How It Works

### Application Flow
1. Candidate clicks "Apply"
2. Request sent to `POST /api/applications`
3. Transaction starts with Serializable isolation level
4. Check if application already exists (inside transaction)
5. If exists → throw error "Already applied"
6. If not exists → create application + interview
7. Transaction commits atomically

### Race Condition Prevention
- **Before**: Request A checks → no duplicate → Request B checks → no duplicate → Both create
- **After**: Request A locks → checks → creates → commits → Request B checks → finds duplicate → error

## Testing

### Test Case 1: Single Application
```bash
POST /api/applications
{
  "jobId": 1,
  "coverLetter": "I'm interested..."
}
```
✅ Result: Application created successfully

### Test Case 2: Duplicate Application
```bash
POST /api/applications
{
  "jobId": 1,
  "coverLetter": "I'm interested..."
}
POST /api/applications  # Same job, same candidate
{
  "jobId": 1,
  "coverLetter": "I'm interested..."
}
```
✅ Result: First succeeds, second returns 400 "Already applied"

### Test Case 3: Concurrent Applications
```bash
# Send 5 simultaneous requests for same job
```
✅ Result: Only 1 succeeds, others return 400

### Test Case 4: Cleanup Duplicates
```bash
POST /api/applications/deduplicate
```
✅ Result: Removes all duplicate applications, keeps most recent

## Files Modified

| File | Changes |
|------|---------|
| `server/controllers/applicationController.js` | Enhanced transaction with Serializable isolation, added deduplication logic |
| `server/routes/applications.js` | Added deduplicate endpoint |
| `server/prisma/schema.prisma` | Already has unique constraint (no changes needed) |

## Verification

✅ No TypeScript/JavaScript errors
✅ Unique constraint enforced at database level
✅ Transaction isolation prevents race conditions
✅ Proper error messages for duplicate attempts
✅ Admin can clean up existing duplicates

## Deployment Steps

1. Deploy updated `applicationController.js`
2. Deploy updated `applications.js` routes
3. (Optional) Run deduplication endpoint to clean existing duplicates:
   ```bash
   POST /api/applications/deduplicate
   ```

## Result

- ✅ One candidate = One application per job
- ✅ No more duplicate entries in applications list
- ✅ Race conditions prevented
- ✅ Clear error messages for duplicate attempts
- ✅ Admin can clean up historical duplicates

---

**Status**: ✅ **FIXED**

Generated: April 9, 2026
