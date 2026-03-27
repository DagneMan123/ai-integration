# Fix: Different Candidate IDs for Applications

## ❌ Problem

All applications were showing the same `candidateId: 17` because you were using the same test candidate account for all applications.

## ✅ Solution

Create multiple test candidate accounts so each candidate has a unique ID.

## 🧪 How to Create Multiple Candidates

### Option 1: Run the Script (Recommended)

```bash
node create-multiple-candidates.js
```

This creates 5 test candidates:
- candidate1@test.com (ID will vary)
- candidate2@test.com (ID will vary)
- candidate3@test.com (ID will vary)
- candidate4@test.com (ID will vary)
- candidate5@test.com (ID will vary)

### Option 2: Manual Registration

1. Go to `/auth/register`
2. Create account with:
   - Email: candidate1@test.com
   - Password: password123
   - First Name: Alice
   - Last Name: Johnson
   - Role: Candidate
3. Repeat for candidate2, candidate3, etc.

## 📊 How It Works

```
Candidate 1 (ID: 18) applies for Job A
    ↓
Application created with candidateId: 18

Candidate 2 (ID: 19) applies for Job B
    ↓
Application created with candidateId: 19

Candidate 3 (ID: 20) applies for Job A
    ↓
Application created with candidateId: 20
```

## 🔍 Verify Different IDs

### Check Applications in Database

```sql
SELECT id, candidateId, jobId, status FROM applications;
```

You should see:
```
id | candidateId | jobId | status
1  | 18          | 1     | PENDING
2  | 19          | 2     | PENDING
3  | 20          | 1     | PENDING
```

### Check in Frontend

1. Go to `/candidate/applications`
2. Each candidate sees only their own applications
3. Different candidates have different application lists

## 🧑‍💼 Test Workflow

### Candidate 1 (Alice)
1. Login as candidate1@test.com
2. Go to `/jobs`
3. Apply for Job A
4. Go to `/candidate/applications`
5. See application with candidateId: 18

### Candidate 2 (Bob)
1. Logout
2. Login as candidate2@test.com
3. Go to `/jobs`
4. Apply for Job B
5. Go to `/candidate/applications`
6. See application with candidateId: 19

### Candidate 3 (Carol)
1. Logout
2. Login as candidate3@test.com
3. Go to `/jobs`
4. Apply for Job A
5. Go to `/candidate/applications`
6. See application with candidateId: 20

## 📋 Test Candidates

After running the script, you'll have:

```
Candidate 1: Alice Johnson
Email: candidate1@test.com
Password: password123

Candidate 2: Bob Smith
Email: candidate2@test.com
Password: password123

Candidate 3: Carol Williams
Email: candidate3@test.com
Password: password123

Candidate 4: David Brown
Email: candidate4@test.com
Password: password123

Candidate 5: Emma Davis
Email: candidate5@test.com
Password: password123
```

## 🔐 Authentication Flow

```
Login with candidate1@test.com
    ↓
JWT token created with user ID 18
    ↓
Token sent with every request
    ↓
Auth middleware extracts ID from token
    ↓
req.user.id = 18
    ↓
Application created with candidateId: 18
```

## ✨ Benefits

✅ Each candidate has unique ID
✅ Applications properly attributed to correct candidate
✅ Interviews linked to correct candidate
✅ Candidate can only see their own applications
✅ Realistic testing environment

## 🚀 Next Steps

1. Run: `node create-multiple-candidates.js`
2. Login as different candidates
3. Apply for jobs
4. Verify different candidateIds in database
5. Check applications page shows correct data

## 📝 Code Explanation

The application controller correctly uses `req.user.id`:

```javascript
exports.createApplication = async (req, res, next) => {
  const { jobId } = req.body;
  const candidateId = req.user.id;  // ← Gets current user's ID from JWT
  
  const application = await prisma.application.create({
    data: {
      jobId: parseInt(jobId, 10),
      candidateId,  // ← Each candidate has different ID
      status: 'PENDING',
      appliedAt: new Date()
    }
  });
};
```

The issue was **not** in the code, but in the **testing approach** - using the same account for all tests.

---

**Status:** ✅ Fixed
**Root Cause:** Same test account used for all applications
**Solution:** Create multiple test candidate accounts
