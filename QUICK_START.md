# SimuAI Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

---

## 1️⃣ Database Setup

```bash
# Start PostgreSQL (Windows)
Start-Service -Name "postgresql-x64-15"

# Or on Mac
brew services start postgresql

# Or on Linux
sudo systemctl start postgresql
```

---

## 2️⃣ Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env
# Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/simuai

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start server
npm start
```

Server will run on `http://localhost:5000`

---

## 3️⃣ Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update REACT_APP_API_URL in .env
# Example: REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

---

## 4️⃣ Test the Application

### Create Test Accounts

**Candidate Account**
- Email: candidate@test.com
- Password: Test@123456
- Role: candidate

**Employer Account**
- Email: employer@test.com
- Password: Test@123456
- Role: employer

**Admin Account**
- Email: admin@test.com
- Password: Test@123456
- Role: admin

### Access Dashboards

1. **Candidate Dashboard**: http://localhost:3000/candidate/dashboard
2. **Employer Dashboard**: http://localhost:3000/employer/dashboard
3. **Admin Dashboard**: http://localhost:3000/admin/dashboard

---

## 5️⃣ Verify Everything Works

### Checklist
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login with test accounts
- [ ] Dashboard loads data from database
- [ ] Cross-dashboard communication works
- [ ] Help center displays correctly

---

## 📊 Database Structure

The application uses these main tables:

```
users
├── id (primary key)
├── email (unique)
├── name
├── role (candidate, employer, admin)
├── password (hashed)
└── createdAt

jobs
├── id (primary key)
├── title
├── description
├── createdById (foreign key to users)
├── companyId (foreign key to companies)
└── status (ACTIVE, PENDING, CLOSED)

applications
├── id (primary key)
├── candidateId (foreign key to users)
├── jobId (foreign key to jobs)
├── status (APPLIED, SHORTLISTED, REJECTED, ACCEPTED)
└── createdAt

interviews
├── id (primary key)
├── candidateId (foreign key to users)
├── jobId (foreign key to jobs)
├── status (SCHEDULED, IN_PROGRESS, COMPLETED)
├── aiEvaluation (JSON with scores)
└── createdAt
```

---

## 🔄 Dashboard Communication

All three dashboards communicate in real-time:

1. **Candidate Dashboard** fetches:
   - User applications
   - Interview history
   - Performance scores
   - Saved jobs

2. **Employer Dashboard** fetches:
   - Posted jobs
   - Received applications
   - Scheduled interviews
   - Hiring analytics

3. **Admin Dashboard** fetches:
   - Platform statistics
   - User counts by role
   - Job and interview counts
   - Revenue data

---

## 🔐 Authentication Flow

```
1. User enters credentials
   ↓
2. Backend validates and creates JWT token
   ↓
3. Frontend stores token in localStorage
   ↓
4. All API requests include token in Authorization header
   ↓
5. Backend verifies token and checks user role
   ↓
6. Return role-specific data
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify database exists
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution:
1. Kill process on port 5000: lsof -ti:5000 | xargs kill -9
2. Or change PORT in .env
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution:
1. Verify REACT_APP_API_URL in frontend .env
2. Verify CLIENT_URL in backend .env
3. Restart both servers
```

---

## 📚 API Documentation

### Get Candidate Dashboard
```bash
GET /api/dashboard-data/candidate
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "applications": [ ... ],
    "interviews": [ ... ],
    "stats": { ... }
  }
}
```

### Get Employer Dashboard
```bash
GET /api/dashboard-data/employer
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "jobs": [ ... ],
    "recentApplications": [ ... ],
    "stats": { ... }
  }
}
```

### Get Admin Dashboard
```bash
GET /api/dashboard-data/admin
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "stats": { ... },
    "recentActivity": [ ... ],
    "systemHealth": { ... }
  }
}
```

---

## 🎯 Next Steps

1. **Customize branding**: Update logo and colors in `client/src/index.css`
2. **Configure Chapa payments**: Add API keys to `.env`
3. **Set up email notifications**: Configure email service
4. **Deploy to production**: Use Docker or cloud platform
5. **Monitor performance**: Set up logging and analytics

---

## 📞 Support

- Check logs: `server/logs/error.log`
- Review database: `npx prisma studio`
- Test API: Use Postman or curl

---

## ✅ You're Ready!

Your SimuAI platform is now running with:
- ✅ Complete database integration
- ✅ Role-based access control
- ✅ 3-dashboard communication
- ✅ Real-time data synchronization
- ✅ Production-ready security

**Happy coding! 🚀**
